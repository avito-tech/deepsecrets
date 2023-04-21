
### Users and groups ###
# Each user should have primary group as username
# Additional groups can be passed over $groups var

###
# NOTICE for $sshaccess:
# hash keys must specify full hostnames and must not contain ^ and $ - they are kind of added automatically
# Example:
# sshaccess => { 'deployer' => ['app00'] }    ### regexp is /^deployer$/ and matches only deployer and not deployer-jessie
# sshaccess => { '^deployer' => ['app00'] }   ### regexp is /^^deployer$/ AND WILL MATCH NOTHING
# sshaccess => { 'deployer.*' => ['app00'] }  ### regexp is /^deployer.*$/ and matches both deployer and deployer-jessie. Also deployer-test, deployer-killallhumans and deployer-blah-blah-blah.
###

define add_user_sshaccess (
  $sshaccess,
  $usersshaccess='',
  $home=''
) {
  $username = $title
  if $home != '' {
    $realhome=$home
  } else {
    $realhome="/home/${username}"
  }
  include concat::setup
  unless defined(Concat["${realhome}/.ssh/authorized_keys"]) {
    concat { "${realhome}/.ssh/authorized_keys":
      owner   => $username,
      group   => $username,
      mode    => '0600',
    }
    concat::fragment { "ssh_authorized_keys::${username}::header":
      target  => "${realhome}/.ssh/authorized_keys",
      order   => '00',
      content => "# This file is managed by Puppet\n",
    }
  }
  if ( $sshaccess != '' ) {
    if regexp_key_in_hash($sshaccess, $::hostname)==true {
      file {"${realhome}/.ssh/id_rsa":
        ensure  => present,
        owner   => $title,
        group   => $title,
        mode    => '0600',
        content => generate('/usr/local/sbin/generate-ssh-key', $::hostname, $username),
      }
      file {"${realhome}/.ssh/id_rsa.pub":
        ensure  => present,
        owner   => $title,
        group   => $title,
        mode    => '0644',
        content => generate('/usr/local/sbin/generate-ssh-key', $::hostname, $username, 1),
      }
    } else {
      file { "${realhome}/.ssh/id_rsa":
        ensure => absent
      }
      file { "${realhome}/.ssh/id_rsa.pub":
        ensure => absent
      }
    }
    concat::fragment { "ssh_authorized_keys::${username}::sshaccess":
      target  => "${realhome}/.ssh/authorized_keys",
      order   => '50',
      content => ssh_get_public_keys($sshaccess, $::hostname, $username),
    }
  } else {
    file { "${realhome}/.ssh/id_rsa":
      ensure => absent
    }
    file { "${realhome}/.ssh/id_rsa.pub":
      ensure => absent
    }
  }
  if ( $usersshaccess != '' ) {
    concat::fragment { "ssh_authorized_keys::${username}::usersshaccess":
      target  => "${realhome}/.ssh/authorized_keys",
      order   => '75',
      content => get_user_public_keys($usersshaccess, $::hostname, $username),
    }
  }
}

## Adds a user and manages its keys and password
define add_user (
  $name,
  $password,
  $shell,
  $groups,
  $sshkeytype,
  $sshkey,
  $sshaccess='',
  $usersshaccess='',
  $home='',
  $sudoers='',
  $uid = undef,
  $managehome=true,
  $homemode='0751'
) {
  include concat::setup
  $username = $title
  if $groups == 'UNSET' {
    $real_groups = [$username,]
  } else {
    $real_groups = $groups
  }

  if $home == '' {
    $homedir = "/home/${username}"
  } else {
    $homedir = $home
  }

  group { $username:
    ensure  => present,
    gid     => $uid,
  }
  user { $username:
    comment           => $name,
    home              => $homedir,
    shell             => $shell,
    uid               => $uid,
    gid               => $username,
    managehome        => true,
    password          => $password,
    groups            => $real_groups,
    membership        => inclusive,
    password_min_age  => 99999,
  }
  if $managehome and ! defined(File[$homedir]){
    file { $homedir:
      ensure => directory,
      mode   => $homemode,
      owner  => $username,
      group  => $username,
    }
  }

  if ! defined(File["${homedir}/.ssh"]) {
    file { "${homedir}/.ssh":
      ensure  => directory,
      mode    => '0700',
      owner   => $username,
      group   => $username,
    }
  }

  unless defined(Concat["${homedir}/.ssh/authorized_keys"]) {
    concat { "${homedir}/.ssh/authorized_keys":
      owner   => $username,
      group   => $username,
      mode    => '0600',
    }
    concat::fragment { "ssh_authorized_keys::${username}::header":
      target  => "${homedir}/.ssh/authorized_keys",
      order   => '00',
      content => "# This file is managed by Puppet\n",
    }
  }
  if ( $sshkey != '' ) {
    concat::fragment { "ssh_authorized_keys::${username}::personal":
      target  => "${homedir}/.ssh/authorized_keys",
      order   => '25',
      content => "${sshkeytype} ${sshkey} ${username}\n",
    }
    if ( $sshaccess != '' ) {
      notify {'You can use only one of $sshkey or $sshaccess variables in user_add class!': loglevel => error }
    }
  } else {
    if ( $sshaccess != '') {
      add_user_sshaccess{$username:
        home          => $homedir,
        sshaccess     => $sshaccess,
        usersshaccess => $usersshaccess,
      }
    }
  }
  if ( $sudoers != '' ) {
    sudoers::rules{$username: rules => $sudoers, }
  }
}

# Deletes user
define del_user {
  $username = $title
  exec { "pkill -u ${username}":
    onlyif  => "getent passwd ${username}",
    returns => [0, 1],
  }
  -> user { $username:
    ensure => absent,
  }
  -> group { $username:
    ensure => absent,
  }
  file { "/home/${username}/.ssh":
    ensure => absent,
    force  => true,
  }
}


# Manages user
class user_one( $groups = 'UNSET' ) {
  add_user { 'userone':
    name        => 'John Doe',
    uid         => '7005',
    password    => '*',
    shell       => '/bin/bash',
    groups      => $groups,
    sshkeytype  => 'ssh-rsa',
    sshkey      => get_pubkey('pubkeys/jdoe.pub'),
    sudoers     => [{command => 'ALL', nopasswd => true, user => 'exacron', nodes => 'crons', },
                    {command => '/usr/bin/puppet agent -t', nopasswd => true, nodes => ['crons']},
                    {command => 'ALL', user => 'postgres', nopasswd => true, nodes =>['crons','^app\d+', 'exa-sql','exa-sql-indexer[0-9]+','deployer','pg-int']},
                    {command => 'ALL', nopasswd => true, user => 'root', nodes => ['app00','exa-dwh15'],},
                    {command => '/usr/bin/strace', nopasswd => true, user => 'root', nodes => ['crons','^app\d+']},
                    {command => '/bin/netstat', nopasswd => true, user => 'root', nodes => ['crons','^app\d+']},
                    {command => '/bin/ss', nopasswd => true, user => 'root', nodes => ['crons','^app\d+']},
                    {command => '/usr/bin/lsof', nopasswd => true, user => 'root', nodes => ['crons','^app\d+']},
                    {command => 'ALL', user => 'sampler', nodes => 'sql-sample01'},],
  }
}