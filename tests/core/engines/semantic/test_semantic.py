from typing import List
import pytest

from deepsecrets.core.engines.semantic import SemanticEngine
from deepsecrets.core.model.file import File
from deepsecrets.core.model.finding import Finding, FindingMerger
from deepsecrets.core.model.token import SemanticType
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file() -> File:
    path = 'tests/fixtures/4.py'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_json_2() -> File:
    path = 'tests/fixtures/2.json'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_toml_1() -> File:
    path = 'tests/fixtures/1.toml'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_toml_2() -> File:
    path = 'tests/fixtures/2.toml'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_sh_2() -> File:
    path = 'tests/fixtures/2.sh'
    return File(path=path, relative_path=path)


def test_1_semantic_engine(file: File):
    tokens = LexerTokenizer(deep_token_inspection=True).tokenize(file)
    assert len(tokens) == 13

    assert tokens[3].semantic.type == SemanticType.VAR
    assert tokens[3].semantic.name == 'pass'

    engine = SemanticEngine(subengine=None)
    findings = engine.search(tokens[3])
    assert len(findings) == 1
    assert findings[0].rules[0].name == 'Var naming'


def test_2_semantic_engine(file_json_2: File):
    tokens = LexerTokenizer(deep_token_inspection=True).tokenize(file_json_2)
    assert len(tokens) == 6

    assert tokens[0].semantic.type == SemanticType.VAR
    assert tokens[0].semantic.name == 'access_Token'

    assert tokens[1].semantic.type == SemanticType.VAR
    assert tokens[1].semantic.name == 'accessToken'

    engine = SemanticEngine(subengine=None)

    findings = []
    for token in tokens:
        findings.extend(engine.search(token))
    
    assert len(findings) == 3
    assert findings[0].rules[0].name == 'Entropy+Var naming'
    assert findings[1].rules[0].name == 'Entropy+Var naming'
    assert findings[2].rules[0].name == 'Var naming'



def test_3_semantic_engine(file_toml_1: File):
    tokens = LexerTokenizer(deep_token_inspection=True).tokenize(file_toml_1)
    assert len(tokens) == 51

    assert tokens[50].semantic.type == SemanticType.VAR
    assert tokens[50].semantic.name == 'MATTERMOST_BOT_TOKEN'

    engine = SemanticEngine(subengine=None)

    findings = []
    for token in tokens:
        findings.extend(engine.search(token))
    
    assert len(findings) == 2
    assert findings[0].rules[0].name == 'Var naming'
    assert findings[1].rules[0].name == 'Var naming'



def test_4_semantic_engine(file_toml_2: File):
    tokens = LexerTokenizer(deep_token_inspection=True).tokenize(file_toml_2)
    assert len(tokens) == 11

    engine = SemanticEngine(subengine=None)

    findings = []
    findings.extend(engine.search(tokens[4]))
    findings.extend(engine.search(tokens[10]))

    assert len(findings) == 1
    assert findings[0].rules[0].name == 'Var naming'


def test_5_semantic_engine(file_sh_2: File):
    tokens = LexerTokenizer(deep_token_inspection=True).tokenize(file_sh_2)
    assert len(tokens) == 16

    engine = SemanticEngine(subengine=None)

    findings: List[Finding] = []
    for token in tokens:
        findings.extend(engine.search(token))

    for finding in findings:
        finding.map_on_file(file=file_sh_2, relative_start=finding.start_pos)
        finding.choose_final_rule()


    findings = FindingMerger(findings).merge()
    assert len(findings) == 1
    assert findings[0].final_rule.name == 'Dangerous condition'