from abc import abstractmethod
from collections import namedtuple
from typing import List, NamedTuple

from deepsecrets.core.model.file import File
from deepsecrets.core.model.token import Token


class Tokenizer:
    tokens: List[Token]
    settings: NamedTuple

    def __init__(self, **kwargs) -> None:
        self.tokens = []
        Settings = namedtuple('Settings', kwargs.keys())  # type: ignore
        self.settings = Settings._make(kwargs.values())  # type: ignore

    @abstractmethod
    def tokenize(self, file: File) -> List[Token]:
        pass

    def __hash__(self) -> int:  # pragma: nocover
        return hash(type(self))

    def __repr__(self) -> str:  # pragma: no cover
        return self.__class__.__name__
