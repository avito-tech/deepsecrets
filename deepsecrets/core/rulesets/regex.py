from deepsecrets.core.model.rules.regex import RegexRule
from deepsecrets.core.rulesets.ibuilder import IRulesetBuilder


class RegexRulesetBuilder(IRulesetBuilder):
    rule_model = RegexRule
    ruleset_name = 'regex'
