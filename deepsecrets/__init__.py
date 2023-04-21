import logging
import os

MODULE_NAME = 'deepsecrets'


def build_logger() -> logging.Logger:
    logging.basicConfig(format=' %(message)s', level=logging.INFO)
    logger = logging.getLogger(MODULE_NAME)
    return logger


logger = build_logger()


def set_logging_level(level: int) -> None:
    logger.setLevel(level)
    for handler in logger.handlers:
        if isinstance(handler, type(logging.StreamHandler())):
            handler.setLevel(level)
            handler.setFormatter(logging.Formatter('DS-%(levelname)s: %(message)s'))

    logger.debug('Debug logging enabled')


PROFILER_ON = False
BASE_DIR = os.getcwd()
