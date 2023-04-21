import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_go_1():
    path = 'tests/fixtures/1.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_go_2():
    path = 'tests/fixtures/2.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_go_3():
    path = 'tests/fixtures/3.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_go_4():
    path = 'tests/fixtures/4.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_go_5():
    path = 'tests/fixtures/5.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_go_6():
    path = 'tests/fixtures/6.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_go_7():
    path = 'tests/fixtures/7.go'
    return File(path=path, relative_path=path)


def test_1(file_go_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_1, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 64


def test_2(file_go_2):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_2, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 87


def test_3(file_go_3):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_3, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 2


def test_4(file_go_4):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_4, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 3


def test_5(file_go_5):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_5, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 1


def test_6(file_go_6):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_6, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 4


def test_7(file_go_7):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_go_7, post_filter=False)
    variables = lex.get_variables()
    assert len(variables) == 1
