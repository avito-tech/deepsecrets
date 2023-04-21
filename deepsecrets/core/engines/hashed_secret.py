from typing import List, Sequence

from deepsecrets.core.engines.iengine import IEngine
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.rules.hashed_secret import HashedSecretRule
from deepsecrets.core.model.token import Token


class HashedSecretEngine(IEngine):
    name = 'hashed'
    description = 'Scans by regex patterns provided by HashedSecretRules'
    ruleset: Sequence[HashedSecretRule]

    def search(self, token: Token) -> List[Finding]:
        results = []
        for rule in self.ruleset:
            if not self.is_rule_applicable(token=token, rule=rule):
                continue

            token.calculate_hashed_value(rule.algorithm)
            results.extend(self._check_rule(token, rule))

        return results

    def is_rule_applicable(self, token: Token, rule: HashedSecretRule) -> bool:
        if rule.token_length != token.length:
            return False
        return super().is_rule_applicable(token=token, rule=rule)

    def _check_rule(self, token: Token, rule: HashedSecretRule) -> List[Finding]:
        findings: List[Finding] = []

        if token.hashed_value != rule.hashed_val:
            return findings

        findings.append(
            Finding(
                rules=[rule],
                detection=token.content,
                start_pos=0,
                end_pos=token.length,
                file=None,  # filled higher
                final_rule=None,  # filled higher,
                full_line=None,  # filled higher
                linum=None,  # filled higher
            )
        )

        return findings
