import regex as re
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator

from deepsecrets.core.model.token import Token
from deepsecrets.core.tokenizers.helpers.semantic.language import Language


class Match(BaseModel):
    types: List[Any] = Field(default_factory=list)
    values: List[re.Pattern] = Field(default_factory=list)
    not_values: List[re.Pattern] = Field(default_factory=list)

    def check(self, tokens: List[Token]) -> bool:
        
        types_match = self._check_types(tokens)
        values_match = self._check_values(tokens)
        not_values_match = self._check_not_values(tokens)

        if not types_match:
            return False
        
        if not values_match:
            return False 
        
        if not_values_match:
            return False

        return True

    

    def _check_types(self, tokens):
        if len(self.types) == 0:
            return True # should match any type
        
        for token in tokens:
            if token.type[0] in self.types:
                return True
        return False


    def _check_values(self, tokens):
        if len(self.values) == 0:
            return True # should match any value
        
        for token in tokens:
            for pattern in self.values:
                if re.match(pattern, token.content) is not None:
                    return True
        return False
    

    def _check_not_values(self, tokens):
        if len(self.not_values) == 0:
            return False
        
        for token in tokens:
            for pattern in self.not_values:
                if re.match(pattern, token.content) is not None:
                    return True
        return False     
            





    @validator('values', 'not_values', pre=True)
    def regexify_values(cls, values: Dict) -> List[re.Pattern]:
        if values is None:
            return values

        if not isinstance(values, list):
            raise Exception('value must be an array')

        patterns = []
        for val in values:
            if isinstance(val, re.Pattern):
                patterns.append(val)
                continue

            patterns.append(re.compile(re.escape(val), re.IGNORECASE))

        return patterns

    class Config:
        arbitrary_types_allowed = True


class VaribleDetector(BaseModel):
    language: Optional[Language] = None
    stream_pattern: re.Pattern
    match_rules: Dict[int, Match]
    match_semantics: Dict[int, str]
    creds_probability: int = 0

    class Config:
        arbitrary_types_allowed = True

    def match(self, tokens: List[Token], token_stream: str) -> List['Variable']:
        true_detections = []

        for match in re.finditer(self.stream_pattern, token_stream, overlapped=True):
            if not self._verify(match, tokens):
                continue

            var = Variable()
            for i, name in self.match_semantics.items():
                setattr(var, name, tokens[match.span(i)[0]])
            var.found_by = self
            var.span = [match.span(0)[0], match.span(0)[1]]

            true_detections.append(var)

        return true_detections

    def _verify(self, match: re.Match, tokens: List[Token]) -> bool:
        for group_i, match_rule in self.match_rules.items():
            span = match.span(group_i)
            window = tokens[span[0] : span[1]]

            if not match_rule.check(window):
                return False

        return True


class VaribleSuppressor(VaribleDetector):

    def match(self, tokens: List[Token], token_stream: str) -> List['Variable']:
        detections = super().match(tokens, token_stream)
        spans = []
        for detection in detections:
            spans.append(detection.span)
        
        return spans
    


from deepsecrets.core.model.semantic import Variable
