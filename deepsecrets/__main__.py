import sys
from deepsecrets import logger

message = \
'\n'\
'================== DEPRECATION NOTICE ==================\n' \
'Active developent was moved to the creator\'s fork at\n' \
'      https://github.com/ntoskernel/deepsecrets\n\n' \
'     This repository will no longer receive updates \n'\
'========================================================\n'


logger.error(message)

sys.exit()
