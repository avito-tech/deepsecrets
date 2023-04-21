from typing import List, Tuple

from deepsecrets.core.engines.iengine import IEngine
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.rules.regex import RegexRule
from deepsecrets.core.model.token import Token


class RegexEngine(IEngine):
    name = 'regex'
    description = 'Scans by regex patterns provided by RegexRules'

    def search(self, token: Token) -> List[Finding]:
        results = []

        for rule in self.ruleset:
            if not self.is_rule_applicable(token=token, rule=rule):
                continue

            results.extend(self._check_rule(token, rule))  # type: ignore
        return results

    def _check_rule(self, token: Token, rule: RegexRule) -> List[Finding]:
        findings: List[Finding] = []

        # rule.match returns an array of (start, end) spans
        detects: List[Tuple[int, int]] = rule.match(token)

        for start, end in detects:
            findings.append(
                Finding(
                    rules=[rule],
                    detection=token.content[start:end],
                    start_pos=start,
                    end_pos=end,
                )
            )

        return findings