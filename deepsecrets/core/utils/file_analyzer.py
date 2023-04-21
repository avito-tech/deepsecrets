from multiprocessing import RLock
from multiprocessing.pool import Pool
from typing import Dict, List, Optional, Type

from pydantic import BaseModel

from deepsecrets import logger
from deepsecrets.core.engines.iengine import IEngine
from deepsecrets.core.model.file import File
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.token import Token
from deepsecrets.core.tokenizers.itokenizer import Tokenizer


class EngineWithTokenizer(BaseModel):
    engine: IEngine
    tokenizer: Tokenizer

    class Config:
        arbitrary_types_allowed = True


class FileAnalyzer:
    file: File
    engine_tokenizers: List[EngineWithTokenizer]
    tokens: Dict[Type, List[Token]]
    pool_class: Type

    def __init__(self, file: File, pool_class: Optional[Type] = None):
        if pool_class is not None:
            self.pool_class = Pool
        else:
            self.pool_class = pool_class

        self.engine_tokenizers = []
        self.file = file
        self.tokens = {}
        self.tokenizers_lock = RLock()

    def add_engine(self, engine: IEngine, tokenizers: List[Tokenizer]) -> None:
        for tokenizer in tokenizers:
            self.engine_tokenizers.append(EngineWithTokenizer(engine=engine, tokenizer=tokenizer))

    def process(self, threaded: bool = False) -> List[Finding]:
        results: List[Finding] = []

        if threaded:  # pragma: nocover
            with self.pool_class(2) as pool:
                engine_results = pool.imap(self._run_engine, self.engine_tokenizers)
                pool.close()
                pool.join()

            if engine_results is None:
                return results

            for er in engine_results:
                if not er:
                    continue
                results.extend(er)

        else:
            for et in self.engine_tokenizers:
                results.extend(self._run_engine(et))

        return results

    def _run_engine(self, et: EngineWithTokenizer) -> List[Finding]:
        results: List[Finding] = []
        processed_values: Dict[int, bool] = {}

        with self.tokenizers_lock:
            if et.tokenizer not in self.tokens:
                self.tokens[et.tokenizer] = et.tokenizer.tokenize(self.file)

        tokens: List[Token] = self.tokens[et.tokenizer]

        for token in tokens:
            is_known_content = processed_values.get(token.val_hash())
            if is_known_content is not None and is_known_content is False:
                continue

            processed_values[token.val_hash()] = False

            try:
                findings: List[Finding] = et.engine.search(token)
                for finding in findings:
                    finding.map_on_file(file=self.file, relative_start=token.span[0])
                    results.append(finding)
                    processed_values[token.val_hash()] = True

            except Exception as e:
                logger.error('Unable to process token')
                continue

        return results
