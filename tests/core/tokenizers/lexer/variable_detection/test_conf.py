import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file_toml_1():
    path = 'tests/fixtures/1.toml'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_json_1():
    path = 'tests/fixtures/1.json'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_json_2_broken():
    path = 'tests/fixtures/2.json'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_yaml_1():
    path = 'tests/fixtures/1.yaml'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_ini_1():
    path = 'tests/fixtures/1.ini'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def file_pp_1():
    path = 'tests/fixtures/1.pp'
    return File(path=path, relative_path=path)


def test_1(file_toml_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_toml_1, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 50


def test_2(file_json_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_json_1, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 1


def test_3(file_yaml_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_yaml_1, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 4


def test_4(file_ini_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_ini_1, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 9


def test_5(file_pp_1):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_pp_1, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 37

def test_6(file_json_2_broken):
    lex = LexerTokenizer(deep_token_inspection=True)
    lex.tokenize(file_json_2_broken, post_filter=False)

    variables = lex.get_variables()
    assert len(variables) == 6