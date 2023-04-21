from __future__ import annotations

from enum import Enum
from typing import List, Optional, Type

from deepsecrets.core.model.file import File
from deepsecrets.core.model.rules.hashing import HashingAlgorithm
from deepsecrets.core.utils.hashing import get_hash


class SemanticType(Enum):
    VAR = 1


class Semantic:
    type: SemanticType
    name: str
    creds_probability: int

    def __init__(self, type: SemanticType, name: str, creds_probability: int = 0) -> None:
        self.type = type
        self.name = name
        self.creds_probability = creds_probability


class Token:
    content: str
    uncovered_content: List[str]
    span: List[int]
    file: 'File'
    type: List[Type]
    length: int
    hashed_value: Optional[str]
    semantic: Optional[Semantic]
    previous: Optional['Token']
    next: Optional['Token']

    def __init__(self, file: File, content: Optional[str] = None, span: Optional[List[int]] = None) -> None:
        self.file = file
        self.content = content
        self.span = span
        self.length = len(content) if self.content else 0
        self.hashed_value = None
        self.previous = None
        self.next = None
        self.type: List[Type] = []  # type: ignore
        self.semantic = None
        self.uncovered_content = []

    def set_type(self, type: List[Type]) -> None:
        self.type = type  # type: ignore

    def val_hash(self) -> int:
        return hash(self.content)

    def calculate_hashed_value(self, algorithm: HashingAlgorithm) -> None:
        if self.hashed_value:
            return

        self.hashed_value = get_hash(payload=self.content, algorithm=algorithm)

    def __repr__(self) -> str:  # pragma: no cover
        if self.semantic is None and self.type is not None:
            return f'{self.content} | {self.type[0]}\n'

        out = f'======== VAR: {self.semantic.name} = {self.content}'  # type: ignore
        if self.type is not None:
            out += f' | {self.type[0]}\n'

        return out
