import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_php_1():
    path = 'tests/fixtures/1.php'
    return File(path=path, relative_path=path)


def test_1(file_php_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_php_1, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 12
