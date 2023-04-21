import regex as re
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, root_validator


class Rule(BaseModel):
    id: str
    name: Optional[str]
    confidence: int = Field(default=9)
    applicable_file_patterns: List[re.Pattern] = Field(default=[])

    @root_validator(pre=True)
    def fill_confidence(cls, values: Dict) -> Dict:
        file_patterns = values.get('applicable_file_patterns', [])
        if len(file_patterns) > 0:
            pattеrns = [re.compile(p) for p in file_patterns]
            values['applicable_file_patterns'] = pattеrns

        if values.get('confidence', None) is None and values.get('id') is not None:
            values['confidence'] = 9

        return values

    def __hash__(self) -> int:  # pragma: nocover
        return hash(self.id)

    class Config:
        arbitrary_types_allowed = True
