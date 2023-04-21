import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.full_content import FullContentTokenizer


@pytest.fixture(scope='module')
def file_toml_1():
    path = 'tests/fixtures/1.toml'
    return File(path=path, relative_path=path)


def test_full_content(file_toml_1: File):
    tokenizer = FullContentTokenizer()
    tokens = tokenizer.tokenize(file=file_toml_1)
    assert len(tokens) == 1
    assert tokens[0].content == file_toml_1.content
