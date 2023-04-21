from typing import Dict, List, Type

from pydantic import BaseModel

from deepsecrets.core.utils.exceptions import FileNotFoundException
from deepsecrets.core.utils.fs import get_abspath, path_exists


class Output(BaseModel):
    type: str
    path: str


class Config:
    workdir_path: str
    engines: List[Type] = []
    rulesets: Dict[Type, List[str]] = {}
    global_exclusion_paths: List[str] = []
    output: Output

    def __init__(self) -> None:
        self.engines = []
        self.rulesets = {}
        self.global_exclusion_paths = []

    def _set_path(self, path: str, field: str) -> None:
        if not path_exists(path):
            raise FileNotFoundException(f'{field} path does not exist ({path})')
        setattr(self, field, get_abspath(path))

    def set_workdir(self, path: str) -> None:
        self._set_path(path, 'workdir_path')

    def set_global_exclusion_paths(self, paths: List[str]) -> None:
        for path in paths:
            if not path_exists(path):
                raise FileNotFoundException(f'global_exclusion_path does not exist ({path})')
            self.global_exclusion_paths.append(path)

        self.global_exclusion_paths = list(set(self.global_exclusion_paths))

    def add_ruleset(self, type: Type, paths: List[str] = []) -> None:
        self._validate_paths(paths)
        self.rulesets[type] = [get_abspath(path) for path in paths]

    def _validate_paths(self, paths: List[str]) -> None:
        if paths is None:
            return

        for path in paths:
            if path_exists(path):
                continue
            raise FileNotFoundException(f'File {path} does not exist')

        return
