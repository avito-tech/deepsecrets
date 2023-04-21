from deepsecrets.core.tokenizers.lexer import LexerTokenizer
from deepsecrets.core.tokenizers.per_line import PerLineTokenizer

fallback_ladder = {LexerTokenizer: PerLineTokenizer}
