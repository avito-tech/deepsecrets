import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_py_1():
    path = 'tests/fixtures/1.py'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_py_2():
    path = 'tests/fixtures/2.py'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_py_3():
    path = 'tests/fixtures/3.py'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_py_4():
    path = 'tests/fixtures/4.py'
    return File(path=path, relative_path=path)


def test_1(file_py_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_py_1, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 5


def test_2(file_py_2):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_py_2, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 92


def test_3(file_py_3):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_py_3, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 3
    assert variables[1].semantic.name == 'password'
    assert variables[1].content == 'TESTSECRET1234'

    assert variables[2].semantic.name == 'pwd'
    assert variables[2].content == '2TESTSECRET1234'


def test_4(file_py_4):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_py_4, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 11
