import pytest

from deepsecrets.core.engines.semantic import SemanticEngine
from deepsecrets.core.model.file import File
from deepsecrets.core.tokenizers.lexer import LexerTokenizer
from deepsecrets.core.utils.file_analyzer import FileAnalyzer


@pytest.fixture(scope='module')
def file_toml_1():
    path = 'tests/fixtures/1.toml'
    return File(path=path, relative_path=path)


def test_file_analyzer(file_toml_1):
    file_analyzer = FileAnalyzer(file_toml_1)
    lex = LexerTokenizer(deep_token_inspection=True)
    semantic_engine = SemanticEngine(subengine=None)
    file_analyzer.add_engine(engine=semantic_engine, tokenizers=[lex])

    findings = file_analyzer.process()
    assert findings is not None
