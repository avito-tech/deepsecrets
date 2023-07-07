import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_swift_1():
    path = 'tests/fixtures/1.swift'
    return File(path=path, relative_path=path)


def test_suppress(file_swift_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    vars = lex.tokenize(file_swift_1, post_filter=True)

    assert len(vars) == 0



