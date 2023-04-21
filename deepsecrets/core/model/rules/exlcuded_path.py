from typing import List
from pydantic import BaseModel
from deepsecrets.core.model.rules.regex import RegexRuleWithoutId


class ExcludePathRule(RegexRuleWithoutId):
    disabled: bool = False


class ExcludePatternsList(BaseModel):
    __root__: List[ExcludePathRule]
