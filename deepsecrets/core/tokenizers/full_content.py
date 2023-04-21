from typing import List

from deepsecrets.core.tokenizers.itokenizer import Tokenizer
from deepsecrets.core.model.file import File
from deepsecrets.core.model.token import Token


class FullContentTokenizer(Tokenizer):
    def tokenize(self, file: File) -> List[Token]:
        return [Token(file=file, content=file.content, span=[0, file.length])]
