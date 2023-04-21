import os
import sys

from deepsecrets import BASE_DIR, MODULE_NAME


def get_abspath(filepath: str) -> str:
    if filepath.startswith('/'):
        return filepath

    filepath = filepath.replace('./', '')
    return os.path.join(BASE_DIR, filepath)


def path_exists(filepath: str) -> bool:
    abs_path = get_abspath(filepath)
    return os.path.exists(abs_path)


def get_path_inside_package(filepath: str) -> str:
    pkg_root = sys.modules[MODULE_NAME].__path__[0]
    return os.path.join(pkg_root, filepath)
