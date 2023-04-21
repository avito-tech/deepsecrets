from abc import abstractmethod
from typing import List

from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.rules.rule import Rule
from deepsecrets.core.model.token import Token


class IEngine:
    name: str
    ruleset: List[Rule]

    def __init__(self, ruleset: List = []) -> None:
        self.ruleset = ruleset

    @abstractmethod
    def search(self, token: Token) -> List[Finding]:
        pass

    def is_rule_applicable(self, token: Token, rule: Rule) -> bool:
        file_path = token.file.path
        if len(rule.applicable_file_patterns) == 0:
            return True

        for file_pattern in rule.applicable_file_patterns:
            matches = file_pattern.search(file_path)
            if matches is not None:
                return True

        return False

    def is_token_false_positive(self, token: Token) -> bool:
        for false_token in self.false_tokens:
            if len(false_token.match(token.content)) > 0:
                return True
        return False

    def __hash__(self) -> int:  # pragma: nocover
        return hash(type(self))

    def __repr__(self) -> str:  # pragma: no cover
        return self.__class__.__name__
