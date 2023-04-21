import regex as re
from typing import List

from deepsecrets.core.model.file import File
from deepsecrets.core.model.token import Token
from deepsecrets.core.tokenizers.itokenizer import Tokenizer

separator = re.compile(r'\n')


class PerLineTokenizer(Tokenizer):
    def tokenize(self, file: File) -> List[Token]:
        separs = separator.finditer(file.content)
        prev_end = 0
        for sep in separs:
            s, e = sep.span()
            self.tokens.append(Token(file=file, content=file.content[prev_end:s], span=[prev_end, s]))
            prev_end = e

        return self.tokens
