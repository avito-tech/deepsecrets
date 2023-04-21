import base64
from typing import Callable, List, Optional

from deepsecrets.core.engines.iengine import IEngine
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.token import Token


class ContentAnalyzer:
    engine: IEngine
    flags: dict[str, bool]
    token: Token
    uncover_tactics: List[Callable]

    def __init__(self, engine: IEngine) -> None:
        self.engine = engine
        self.uncover_tactics = [self._check_by_base64]

    def analyze(self, token: Token) -> List[Finding]:
        self.token = token
        self.uncover()
        return self.engine.search(self.token) if self.engine is not None else []

    def uncover(self) -> None:
        for tactic in self.uncover_tactics:
            uncovered_str = tactic()
            if uncovered_str is None:
                continue

            if len(uncovered_str) < 5:
                continue

            self.token.uncovered_content.append(uncovered_str)

    def _check_by_base64(self) -> Optional[str]:
        try:
            return base64.b64decode(self.token.content).decode('UTF-8')
        except Exception:
            return None
