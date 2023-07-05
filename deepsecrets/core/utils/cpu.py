from multiprocessing import cpu_count

from deepsecrets.core.utils.fs import path_exists

QUOTA_FILE = '/sys/fs/cgroup/cpu/cpu.cfs_quota_us'
PERIOD_FILE = '/sys/fs/cgroup/cpu/cpu.cfs_period_us'
CGROUP_2_MAX = '/sys/fs/cgroup/cpu.max'


class CpuHelper:

    def get_limit(self) -> int:
        multiproc_limit = self._by_multiproc()
        cgroup = self._by_cgroup()

        final = cgroup if cgroup != -1 else multiproc_limit
        return final if final > 0 else 0
    
    def _by_multiproc(self):
        return cpu_count()
    
    def _by_cgroup(self):
        quota = 1
        period = -1

	    # cgroup 2: https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html
        if path_exists(CGROUP_2_MAX):
            try:
                quota, period = self.__cgroup2()
                return quota // period
            except Exception:
                pass

        # cgroup 1: https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v1/index.html
        if path_exists(QUOTA_FILE) and path_exists(PERIOD_FILE):
            try:
                quota, period = self.__cgroup1()
                return quota // period
            except Exception:
                pass

        return quota // period
    
    def __cgroup1(self):
        quota = 1
        period = -1

        with open(QUOTA_FILE) as f:
            quota = int(f.read())
        
        with open(PERIOD_FILE) as f:
            period = int(f.read())

        return quota, period

    
    def __cgroup2(self):
        quota = 1
        period = -1

        with open(CGROUP_2_MAX) as f:
            str_quota_period = f.read().split(' ')
            quota = int(str_quota_period[0])
            period = int(str_quota_period[1])
        
        return quota, period

