from deepsecrets.core.model.rules.exlcuded_path import ExcludePathRule
from deepsecrets.core.rulesets.ibuilder import IRulesetBuilder


class ExcludedPathsBuilder(IRulesetBuilder):
    rule_model = ExcludePathRule
    ruleset_name = 'excluded_paths'
