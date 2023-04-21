import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers import PerLineTokenizer


@pytest.fixture(scope='module')
def file_toml_1():
    path = 'tests/fixtures/1.toml'
    return File(path=path, relative_path=path)


def test_per_line(file_toml_1: File):
    tokenizer = PerLineTokenizer()
    tokens = tokenizer.tokenize(file=file_toml_1)
    assert len(tokens) == 76
