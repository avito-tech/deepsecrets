from deepsecrets.core.model.rules.false_finding import FalseFindingRule
from deepsecrets.core.rulesets.ibuilder import IRulesetBuilder


class FalseFindingsBuilder(IRulesetBuilder):
    rule_model = FalseFindingRule
    ruleset_name = 'false_findings'
