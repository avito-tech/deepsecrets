import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_js_3():
    path = 'tests/fixtures/3.js'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_jsx_1():
    path = 'tests/fixtures/1.jsx'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_jsx_2():
    path = 'tests/fixtures/2.jsx'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_jsx_3():
    path = 'tests/fixtures/3.jsx'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_js_4():
    path = 'tests/fixtures/4.js'
    return File(path=path, relative_path=path)



def test_1(file_js_3):
    lex = LexerTokenizer(deep_token_inspection=True)
    tokens = lex.tokenize(file_js_3, post_filter=True)
    assert lex.lexer.name == 'react'

    variables = lex.get_variables(tokens)
    assert len(variables) == 2


def test_2_jsx(file_jsx_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    tokens = lex.tokenize(file_jsx_1, post_filter=True)
    assert lex.lexer.name == 'react'

    variables = lex.get_variables(tokens)
    assert len(variables) == 1


def test_3_jsx(file_jsx_2):
    lex = LexerTokenizer(deep_token_inspection=True)
    tokens = lex.tokenize(file_jsx_2, post_filter=True)
    assert lex.lexer.name == 'react'

    variables = lex.get_variables(tokens)
    assert len(variables) == 0


def test_4_jsx(file_jsx_3):
    lex = LexerTokenizer(deep_token_inspection=True)
    tokens = lex.tokenize(file_jsx_3, post_filter=True)
    assert lex.lexer.name == 'react'

    variables = lex.get_variables(tokens)
    assert len(variables) == 0


def test_5_js(file_js_4):
    lex = LexerTokenizer(deep_token_inspection=True)
    tokens = lex.tokenize(file_js_4, post_filter=True)

    variables = lex.get_variables(tokens)
    assert len(variables) == 0