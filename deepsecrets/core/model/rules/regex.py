import regex as re
from typing import Dict, ForwardRef, List, Optional, Union

from pydantic import Field, root_validator

from deepsecrets.core.helpers.entropy import EntropyHelper
from deepsecrets.core.model.rules.rule import Rule
from deepsecrets.core.model.token import Token

RegexRule = ForwardRef('RegexRule')


class RegexRule(Rule):  # type: ignore
    pattern: re.Pattern
    match_rules: Optional[Dict[int, RegexRule]] = Field(default={})  # type: ignore
    target_group: int = Field(default=0)
    entropy_settings: Optional[float] = Field(default=None)
    escaping_needed: bool = False

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            re.Pattern: lambda v: v.pattern,
        }

    @root_validator(pre=True)
    def build_pattern(cls, values: Dict) -> Dict:
        pattern_str = values.get('pattern', None)
        if pattern_str is not None and isinstance(pattern_str, str):
            escaping_needed = values.get('escaping_needed', False)
            if escaping_needed:
                pattern_str = re.escape(pattern_str)

            values['pattern'] = re.compile(pattern_str, re.IGNORECASE)

        match_rules = values.get('match_rules', {})
        for _, match_rule in match_rules.items():
            match_rule['id'] = ''
            match_rule['confidence'] = 9

        return values

    def __hash__(self) -> int:  # pragma: nocover
        return hash(self.id)

    def match(self, token: Union[Token, str]) -> List[re.Match]:
        good_matches = []
        contents = []
        contents.append(token.content if isinstance(token, Token) else token)
        contents.extend(token.uncovered_content if isinstance(token, Token) else [])

        for i, content in enumerate(contents):
            matches = re.finditer(self.pattern, content)

            for match in matches:
                if not self._verify(match):
                    continue

                good_matches.append(match.span(self.target_group) if i == 0 else (0, len(contents[0])))

        return good_matches

    def _verify(self, match: re.Match) -> bool:
        match_ok = True
        entropy_ok = True

        if self.match_rules is not None:
            for group_i, match_rule in self.match_rules.items():
                span = match.span(group_i)
                window = match.string[span[0] : span[1]]
                if not match_rule.match(window):  # type: ignore
                    match_ok = False
                    break

        if self.entropy_settings is not None:
            span = match.span(self.target_group)
            str_to_check = match.string[span[0] : span[1]]
            ent = EntropyHelper.get_for_string(str_to_check)
            if ent < self.entropy_settings:
                entropy_ok = False

        return match_ok and entropy_ok


RegexRule.update_forward_refs()  # type: ignore


class RegexRuleWithoutId(RegexRule):
    id: Optional[str] = Field(default=None)
