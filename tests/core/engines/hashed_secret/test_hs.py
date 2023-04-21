from typing import List

import pytest

from deepsecrets.core.engines.hashed_secret import HashedSecretEngine
from deepsecrets.core.engines.regex import RegexEngine
from deepsecrets.core.model.file import File
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.rules.hashed_secret import HashedSecretRule
from deepsecrets.core.model.token import Token
from deepsecrets.core.rulesets.hashed_secrets import HashedSecretsRulesetBuilder
from deepsecrets.core.tokenizers.lexer import LexerTokenizer


@pytest.fixture(scope='module')
def file():
    path = 'tests/fixtures/1.py'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def engine():
    builder = HashedSecretsRulesetBuilder()
    builder.with_rules_from_file('tests/fixtures/hashed_secrets.json')
    return HashedSecretEngine(ruleset=builder.rules)


def test_1(file: File, engine: RegexEngine):
    findings: List[Finding] = []
    tokens: List[Token] = LexerTokenizer(deep_token_inspection=True).tokenize(file)
    for token in tokens:
        findings.extend(engine.search(token))

    assert len(findings) == 1
    assert isinstance(findings[0].rules[0], HashedSecretRule)
    assert findings[0].rules[0].hashed_val == '8c535f99d6d0fa55b64af0fae6e3b6829eda413b'


def test_2(engine: HashedSecretEngine):
    rules = engine.ruleset

    assert rules[0] == rules[0]
    assert rules[1] == rules[1]
    assert rules[1] != rules[0]
