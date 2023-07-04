import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_js_3():
    path = 'tests/fixtures/3.js'
    return File(path=path, relative_path=path)


def test_1(file_js_3):
    lex = LexerTokenizer(deep_token_inspection=True)
    tokens = lex.tokenize(file_js_3, post_filter=True)
    assert lex.lexer.name == 'react'

    variables = lex.get_variables(tokens)
    assert len(variables) == 5
