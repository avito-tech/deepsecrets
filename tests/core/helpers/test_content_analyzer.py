import pytest

from deepsecrets.core.helpers.content_analyzer import ContentAnalyzer
from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.full_content import FullContentTokenizer

STR = 'hellofrominsidethebase64'
BASE_64_STR = 'aGVsbG9mcm9taW5zaWRldGhlYmFzZTY0'


@pytest.fixture(scope='module')
def file() -> File:
    path = 'test.txt'
    return File(path=path, relative_path=path, content=BASE_64_STR)


def test_semantic_engine(file: File):
    tokens = FullContentTokenizer().tokenize(file)
    assert len(tokens) == 1

    token = tokens[0]
    assert len(token.uncovered_content) == 0

    ContentAnalyzer(engine=None).analyze(token)
    assert len(token.uncovered_content) == 1
    assert token.uncovered_content[0] == STR
