import regex as re
from typing import List, Optional

from deepsecrets.core.model.file import File
from deepsecrets.core.model.token import Token
from deepsecrets.core.tokenizers.itokenizer import Tokenizer

separator = re.compile(r'[ ,"\'\n:={}\[\]\+]+')


class PerWordTokenizer(Tokenizer):
    def tokenize(self, file: File, content: Optional[str] = None) -> List[Token]:
        cnt = content if content is not None else file.content
        length = len(cnt)
        separs = separator.finditer(cnt)
        prev_end = 0

        for sep in separs:
            s, e = sep.span()
            if s == prev_end:
                prev_end = e
                continue

            token = Token(file=file, content=content[prev_end : e - 1], span=[prev_end, e - 1])
            self.tokens.append(token)
            prev_end = e

        if prev_end != length:
            token = Token(file=file, content=content[prev_end:length], span=[prev_end, length])
            self.tokens.append(token)

        return self.tokens
