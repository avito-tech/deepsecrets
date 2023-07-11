# flake8: noqa
# fmt: off

from ldap3 import (
    ALL,
    Connection,
    Server,
)

s = Server('ldaps://ldap-main.miami.example.com:636', get_info=ALL, use_ssl=True)
c = Connection(s, user='uid=openvpn,ou=services,dc=example,dc=us', password='TESTSECRET1234')

c = Connection(s, pwd='2TESTSECRET1234')

c.bind()

if key == 'setuptools':
    print()
