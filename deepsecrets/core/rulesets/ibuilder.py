import json
from typing import List, Type

from deepsecrets.core.model.rules.rule import Rule


class IRulesetBuilder:
    rules: List[Rule]
    rule_model: Type
    ruleset_name = 'rules'

    def __init__(self) -> None:
        self.rules = []

    def with_rules_from_file(self, file: str) -> object:
        rules_raw = None
        with open(file) as f:
            rules_raw = json.load(f)

        self.rules.extend([self.rule_model(**rule) for rule in rules_raw])
        return self

    @property
    def high_confidence_rules(self) -> List[Rule]:
        return [rule for rule in self.rules if rule.confidence == 9]
