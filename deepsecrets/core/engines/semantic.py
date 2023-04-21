import regex as re
from typing import List

from deepsecrets import logger
from deepsecrets.core.engines.iengine import IEngine
from deepsecrets.core.helpers.content_analyzer import ContentAnalyzer
from deepsecrets.core.helpers.entropy import EntropyHelper
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.rules.rule import Rule
from deepsecrets.core.model.token import Token

filenames_ignorelist = [
    'package-lock.json',
    'package.json',
]

false_starting_sequences = [
    '${',
    'true',
    '%env',
]

useless_values = [
    'null',
    'bearer',
    'restore_password',
]


class SemanticEngine(IEngine):
    name = 'semantic'
    entropy_threshold = 4.15
    dangerous_variable_regex = re.compile(
        r'(secret|passw|\bpass\b|\btoken\b|\baccess\b|\bpwd\b|rivateke|cesstoke|authkey|\bsecret\b).{0,15}',
        re.IGNORECASE,
    )
    useless_value_regex = re.compile(r'^[^A-Za-z0-9]*$|^%.*%$|^\[.*\]$|^{.*}$', re.IGNORECASE)
    subengine: IEngine

    def __init__(self, subengine: IEngine, **kwargs) -> None:
        super().__init__(**kwargs)
        self.subengine = subengine

    # token is a STRING with potential 'semantic' extension
    def search(self, token: Token) -> List[Finding]:
        findings: List[Finding] = []

        if token.length == token.file.length:
            return findings

        for fname in filenames_ignorelist:
            if fname in token.file.path:
                return findings

        if token.semantic is not None and token.semantic.creds_probability == 9:
            findings.append(
                Finding(
                    detection=token.content,
                    start_pos=0,
                    end_pos=len(token.content),
                    rules=[Rule(id='S107', name='Dangerous condition', confidence=9)],
                )
            )

        try:
            dangerous_variable = self._if_dangerous_variable(token)

            if self.subengine is not None:  # pragma: nocover
                content_findings = ContentAnalyzer(self.subengine).analyze(token)
                if content_findings is not None:
                    findings.extend(content_findings)

            if not dangerous_variable:
                return findings

            if len(token.content) == 1:
                return findings

            if len(token.content.split(' ')) > 1:
                return findings

            if token.content in useless_values:
                return findings

            if len(re.findall(self.useless_value_regex, token.content)) > 0:
                return findings

            entropy = EntropyHelper.get_for_string(token.content)
            if self._is_high_entropy(entropy):
                findings.append(
                    Finding(
                        detection=token.content,
                        start_pos=0,
                        end_pos=len(token.content),
                        rules=[Rule(id='S105', name='Entropy+Var naming', confidence=-1)],
                    )
                )
            else:
                for fss in false_starting_sequences:
                    if token.content.startswith(fss):
                        return findings

                findings.append(
                    Finding(
                        detection=token.content,
                        start_pos=0,
                        end_pos=len(token.content),
                        rules=[Rule(id='S106', name='Var naming', confidence=-1)],
                    )
                )

        except Exception:
            logger.error('Problem during Entropy check on token')

        return findings

    def _is_high_entropy(self, entropy: float) -> bool:
        return True if entropy > self.entropy_threshold else False

    def _if_dangerous_variable(self, token: Token) -> bool:
        if token.semantic is None:
            return False

        if token.semantic.creds_probability == 9:
            return True

        cleaned_up_varname = self.normalize_punctuation(token.semantic.name)
        badvar = self.dangerous_variable_regex.findall(cleaned_up_varname)
        if len(badvar) == 0:
            return False

        return True

    def normalize_punctuation(self, string: str):
        return string.replace(' ', '_').replace('-', ' ').replace('_', ' ')
