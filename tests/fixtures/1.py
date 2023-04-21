# flake8: noqa
# fmt: off
# !/usr/bin/python3

# from time import sleep
import socket
import threading
import time
# import logging
# import logging.handlers
import traceback
from pprint import pprint

import psycopg2
from bal_control_functions import LoggerCounter, real_servers_for_balancer


class BalControlDatabase:
    def database_thread_f(self):
        self.logger.info('Start database thread with check_interval %s secs' % self.check_interval)
        while True:
            time_started = time.time()
            # self.logger.debug("Database thread process")
            try:
                # Main cycle
                if self.db_connect():
                    self.update_from_database()
                else:
                    self.logger.error('Database not connected! Not fetching now.')
            except psycopg2.InterfaceError as e:
                if self.dbconn:
                    self.dbconn.close()
                self.dbconn = None
            except Exception as e:
                self.logger.error(traceback.format_exc())

            time_ended = time.time()
            time_to_sleep = self.check_interval - (time_ended - time_started)
            if time_to_sleep < 0:
                time_to_sleep = 0
            if time_to_sleep > 0.1:
                # self.logger.debug ("Need to sleep %s" %time_to_sleep)
                time.sleep(time_to_sleep)

    def __init__(self):
        # self.logger=logging.getLogger("BalControlDatabase")
        self.logger = LoggerCounter('BalControlDatabase')
        self.check_interval = 31  # Check database every 31 seconds
        self.database_thread = None
        self.database_thread_started = False
        self.dbconn = None
        self.detect = 'soar'
        self.dbcur = None
        self.current_database_version = 0
        self.database_fetch_successfull = False

        self.db_balancers = {}
        self.db_balancergroups = {}
        self.db_virtual_ips = {}
        self.db_checks = {}
        self.db_services = {}

        self.effective_balancers = {}
        self.effective_balancer_groups = {}
        self.effective_virtual_ips = {}
        self.effective_services = {}
        self.services_db_vs = None

        self.stopped = False
        self.start()

    def __del__(self):
        self.stopped = True
        if self.dbcur:
            self.dbcur.close()
            self.dbcur = None
        if self.dbconn:
            self.dbconn.close()
            self.dbconn = None

    def start(self):
        # start monitoring thread
        if self.database_thread_started:
            self.logger.error('Database thread already started. Not starting now.')
            return
        self.database_thread = threading.Thread(target=self.database_thread_f)
        self.database_thread.setDaemon(True)
        self.database_thread.start()
        self.database_thread_started = True

    def db_connect(self):
        if self.dbconn and self.dbcur:
            # self.logger.warning("Database already connected")
            return self.dbcur
        self.dbconn = psycopg2.connect(
            host='pg-int.miami.example.com',
            dbname='cmdb',
            user='cmdb_balancer',
            password='$ecRetT0F1nD',
        )
        if not self.dbconn:
            self.logger.error('Cannot connect to database cmdb')
            return None
        self.dbconn.autocommit = True
        self.dbcur = self.dbconn.cursor()
        if not self.dbcur:
            self.logger.error('Cannot create cursor')
            return None
        return self.dbcur

    def update_from_database(self):
        ts = time.time()
        version = 1
        # try:
        self.dbcur.execute(
            'SELECT value_int FROM balancer_parameters WHERE name = %s;', ('version',)
        )
        version = self.dbcur.fetchone()[0]
        # except Exception as e:
        #    self.logger.error(e)
        self.logger.debug('Current database version: %s ' % version)

        if version != self.current_database_version:
            self.logger.info('Need to update data from database: version = %s' % version)

            status = self.get_database_data()

            if status:
                self.current_database_version = version
                services_db_vs_new = {}
                # generate dict based on services from db with keys in format 'ip:port'
                for service_id, service in self.effective_services.items():
                    # pprint (service)
                    for virtual_ip in service['virtual_ips']:
                        services_db_vs_new['%s:%s' % (virtual_ip['ip'], service['port'])] = service
                self.services_db_vs = services_db_vs_new
                # print('=99999----------')
                # pprint (self.services_db_vs)
                # print('-------8888888----')
                # pprint(self.effective_services)
                self.logger.info(
                    'Done database fetching: Has %s active virtual services'
                    % len(self.services_db_vs)
                )
                self.database_fetch_successfull = True
            else:
                self.database_fetch_successfull = False

    def get_database_data(self):
        # Получаем из ДБ информацию о Балансерах
        self.dbcur.execute(
            'SELECT id, hostname, internal_ip, description, enabled FROM balancer_balancer;'
        )
        db_balancers_new = {}
        effective_balancers_new = {}
        my_hostname = socket.gethostname()
        for balancer in self.dbcur.fetchall():
            balancer_id = balancer[0]
            hostname = balancer[1]
            internal_ip = balancer[2]
            description = balancer[3]
            enabled = balancer[4]
            balancer_data = {
                'hostname': hostname,
                'internal_ip': internal_ip,
                'description': description,
                'enabled': enabled,
            }
            db_balancers_new[balancer_id] = balancer_data
            if hostname == my_hostname:
                if enabled:
                    effective_balancers_new[balancer_id] = balancer_data
        # print ('Balancers_db: ', balancers_db)
        # print ('Effective_balancer: ', effective_balancers)

        # Получаем из ДБ группы балансеров (пока без связи с балансерами)
        self.dbcur.execute('SELECT id, name, description FROM balancer_balancergroup;')
        db_balancergroups_new = {}
        for bgroup in self.dbcur.fetchall():
            group_id = bgroup[0]
            name = bgroup[1]
            description = bgroup[2]
            db_balancergroups_new[group_id] = {
                'name': name,
                'description': description,
                'balancers': [],
                'real_server_pool': [],
            }

        # Получаем из БД связки групп балансеров; Добавляем балансеры в группы балансеров
        self.dbcur.execute('SELECT id, balancer_id, group_id FROM balancer_balancergrouplink;')
        effective_balancer_groups_new = {}
        for bgrouplink in self.dbcur.fetchall():
            link_id = bgrouplink[0]
            balancer_id = bgrouplink[1]
            group_id = bgrouplink[2]

            if not group_id in db_balancergroups_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found balancergroup id=%s, which is found in balancergrouplink with id %s'
                    % (group_id, link_id)
                )
                continue
            bgroup = db_balancergroups_new[group_id]
            if not balancer_id in db_balancers_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found balancer id=%s, which is found in balancergrouplink with id %s'
                    % (balancer_id, link_id)
                )
                continue
            balancer = db_balancers_new[balancer_id]
            if balancer_id in effective_balancers_new:
                effective_balancer_groups_new[group_id] = bgroup
            bgroup['balancers'].append(balancer)


        db_virtual_ips_new = {}
        self.dbcur.execute('SELECT id, ip, synproxy FROM balancer_virtualip;')
        for virtualip in self.dbcur.fetchall():
            ip_id = virtualip[0]
            ip = virtualip[1]
            synproxy = virtualip[2]
            db_virtual_ips_new[ip_id] = {
                'id': ip_id,
                'ip': ip,
                'balancers_groups': [],
                'synproxy': synproxy,
            }

        self.dbcur.execute(
            'SELECT id, virtualip_id, balancergroup_id FROM balancer_virtualip_balancer_groups;'
        )
        effective_virtual_ips_new = {}
        for iplink in self.dbcur.fetchall():
            link_id = iplink[0]
            ip_id = iplink[1]
            balancer_group_id = iplink[2]

            if not balancer_group_id in db_balancergroups_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found balancergroup id=%s, which is found in balancer_virtualip_balancer_groups with id %s'
                    % (balancer_group_id, link_id)
                )
                continue
            bgroup = db_balancergroups_new[balancer_group_id]
            if not ip_id in db_virtual_ips_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found virtual ip =%s, which is found in balancer_virtualip_balancer_groups with id %s'
                    % (ip_id, link_id)
                )
                continue
            virtual_ip = db_virtual_ips_new[ip_id]
            virtual_ip['balancers_groups'].append(bgroup)
            if balancer_group_id in effective_balancer_groups_new:
                effective_virtual_ips_new[ip_id] = virtual_ip

        self.dbcur.execute(
            'SELECT id, name, method, url, overwrite_port, port, enabled FROM balancer_checkmethod;'
        )
        db_checks_new = {}
        for check in self.dbcur.fetchall():
            check_id = check[0]
            name = check[1]
            method = check[2]
            url = check[3]
            overwrite_port = check[4]
            port = check[5]
            enabled = check[6]

            check_data = {
                'id': check_id,
                'name': name,
                'method': method,
                'url': url,
                'overwrite_port': overwrite_port,
                'port': port,
                'enabled': enabled,
            }
            db_checks_new[check_id] = check_data

        self.dbcur.execute(
            'SELECT id, name, port, protocol, enabled, scheduling_method, persistent, persistent_timeout, check_method_id  FROM balancer_service;'
        )
        db_services_new = {}
        for service in self.dbcur.fetchall():
            service_id = service[0]
            name = service[1]
            port = service[2]
            protocol = service[3]
            enabled = service[4]
            scheduling_method = service[5]
            persistent = service[6]
            persistent_timeout = service[7]
            check_method_id = service[8]
            check_method = None
            if not check_method_id in db_checks_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found check_method id=%s, which is found in table balancer_service with service_id %s'
                    % (check_method_id, service_id)
                )
                continue
            else:
                check_method = db_checks_new[check_method_id]
            service_data = {
                'port': port,
                'protocol': protocol,
                'name': name,
                'enabled': enabled,
                'scheduling_method': scheduling_method,
                'persistent': persistent,
                'persistent_timeout': persistent_timeout,
                'virtual_ips': [],
                'server_pools': [],
                'check_method': check_method,
            }
            db_services_new[service_id] = service_data

        self.dbcur.execute(
            'SELECT id, virtualip_id, service_id FROM balancer_service_virtual_ips;'
        )
        effective_services_new = {}
        for link in self.dbcur.fetchall():
            link_id = link[0]
            ip_id = link[1]
            service_id = link[2]
            if not ip_id in db_virtual_ips_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found ip_id=%s, which is found in balancer_service_virtual_ips with id %s'
                    % (ip_id, link_id)
                )
                continue
            virtual_ip = db_virtual_ips_new[ip_id]
            if not service_id in db_services_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found service id=%s, which is found in servicebalancergrouplink with id %s'
                    % (service_id, link_id)
                )
                continue
            service = db_services_new[service_id]
            service['virtual_ips'].append(virtual_ip)
            if ip_id in effective_virtual_ips_new:
                if service['enabled']:
                    effective_services_new[service_id] = service

        self.dbcur.execute(
            'SELECT id, hostname, ip, forward_method, enabled, description FROM balancer_realserver;'
        )
        db_servers_new = {}
        for server in self.dbcur.fetchall():
            server_id = server[0]
            hostname = server[1]
            ip = server[2]
            forward_method = server[3]
            enabled = server[4]
            description = server[5]
            server_data = {
                'hostname': hostname,
                'ip': ip,
                'forward_method': forward_method,
                'enabled': enabled,
                'description': description,
            }
            db_servers_new[server_id] = server_data

        self.dbcur.execute('SELECT id, name, description FROM balancer_realserverpool;')
        db_server_pools_new = {}
        for pool in self.dbcur.fetchall():
            pool_id = pool[0]
            name = pool[1]
            description = pool[2]
            db_server_pools_new[pool_id] = {
                'name': name,
                'description': description,
                'servers': {},
            }

        self.dbcur.execute(
            'SELECT id, weight, pool_id, real_server_id FROM balancer_realserverpoollink;'
        )
        for link in self.dbcur.fetchall():
            link_id = link[0]
            weight = link[1]
            pool_id = link[2]
            server_id = link[3]
            if not pool_id in db_server_pools_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found RealServer Pool id=%s, which is found in realserverpoollink with id %s'
                    % (pool_id, link_id)
                )
                continue
            pool = db_server_pools_new[pool_id]
            if not server_id in db_servers_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found server id=%s, which is found in realserverpoollink with id %s'
                    % (server_id, link_id)
                )
                continue
            server = db_servers_new[server_id]
            pool['servers'][server['ip']] = {'server': server, 'weight': weight}


        self.dbcur.execute(
            'SELECT id, balancergroup_id, realserverpool_id FROM balancer_balancergroup_real_server_pools;'
        )
        effective_balancer_groups_new = {}
        for balancer_balancergroup_real_server_pool in self.dbcur.fetchall():
            link_id = balancer_balancergroup_real_server_pool[0]
            balancergroup_id = balancer_balancergroup_real_server_pool[1]
            realserverpool_id = balancer_balancergroup_real_server_pool[2]

            if not balancergroup_id in db_balancergroups_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found balancergroup id=%s, which is found in balancergrouplink with id %s'
                    % (realserverpool_id, link_id)
                )
                continue


            server_pool = db_server_pools_new[realserverpool_id]
            db_balancergroups_new.get(balancergroup_id).get('real_server_pool').append(server_pool)

        self.dbcur.execute('SELECT id, pool_id, service_id FROM balancer_servicepoollink;')
        for link in self.dbcur.fetchall():
            link_id = link[0]
            pool_id = link[1]
            service_id = link[2]
            if not pool_id in db_server_pools_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found RealServer Pool id=%s, which is found in servicepoollink with id %s'
                    % (pool_id, link_id)
                )
                continue
            pool = db_server_pools_new[pool_id]
            if not service_id in db_services_new:
                self.logger.error(
                    'Warning: inconsistent Database: Not found service id=%s, which is found in servicepoollink with id %s'
                    % (service_id, link_id)
                )
                continue
            service = db_services_new[service_id]
            service['server_pools'].append(pool)

        self.db_balancers = db_balancers_new
        self.db_balancergroups = db_balancergroups_new
        self.db_virtual_ips = db_virtual_ips_new
        self.db_checks = db_checks_new
        self.db_services = db_services_new
        self.db_servers = db_servers_new
        self.db_server_pools = db_server_pools_new

        self.effective_balancers = effective_balancers_new
        self.effective_balancer_groups = effective_balancer_groups_new
        self.effective_virtual_ips = effective_virtual_ips_new
        self.effective_services = effective_services_new
        '''
        print('+++++++++++++++++++++++++++++')
        for service, service_data in self.effective_services.items():
            #pprint(service_data)
            print('==============================')
            #print(service_data['name'])
            #pprint(service_data)
            #for vals in service_data.get('server_pools'):
            #    print('  %s' % vals.get('name'))
            #    for val in vals.get('servers'):
            #        print('     %s' % val)
            print('----------')
            for virtual_ip in service_data.get('virtual_ips'):
                print('  %s' % (virtual_ip.get('ip')))
                for balancers_group in virtual_ip.get('balancers_groups'):
                    print('    %s' % (balancers_group.get('name')))
                    #print(balancers_group)
                    ignore_real_server_pool = True
                    for balancer in balancers_group.get('balancers'):
                        print('        %s %s' % (balancer.get('hostname'), socket.gethostname()))
                        if balancer.get('hostname') == socket.gethostname():
                            ignore_real_server_pool = False
                    if ignore_real_server_pool == True:
                        print ('                --------------------ignore_real_server_pool')
                    else:
                        for real_server_pool in balancers_group.get('real_server_pool'):
                            print('            %s' % real_server_pool.get('name'))
                            for real_server in real_server_pool.get('servers').keys():
                                print('1                %s' % real_server)
                            for real_server2 in real_servers_for_balancer(service_data, 'enabled').keys():
                                print('2                %s' % real_server2)
            #pprint(service_data)
        ##pprint (self.effective_services)
        #print('+++++++++++++++++++++++++++++')
        #exit()
        '''
        return True
