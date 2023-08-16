from typing import List

import pytest

from deepsecrets.core.engines.regex import RegexEngine
from deepsecrets.core.model.file import File
from deepsecrets.core.model.finding import Finding, FindingMerger, FindingResponse
from deepsecrets.core.rulesets.regex import RegexRulesetBuilder
from deepsecrets.core.tokenizers.full_content import FullContentTokenizer
from deepsecrets.core.tokenizers.lexer import LexerTokenizer
from deepsecrets.core.utils.fs import get_path_inside_package


@pytest.fixture(scope='module')
def file():
    path = 'tests/fixtures/regex_checks.txt'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_extless():
    path = 'tests/fixtures/extless/radius'
    return File(path=path, relative_path=path)

@pytest.fixture(scope='module')
def file_go_7():
    path = 'tests/fixtures/7.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def regex_engine():
    builder = RegexRulesetBuilder()
    builder.with_rules_from_file(get_path_inside_package('rules/regexes.json'))
    return RegexEngine(ruleset=builder.rules)


def test_1(file: File, regex_engine: RegexEngine):
    findings: List[Finding] = []
    tokens = FullContentTokenizer().tokenize(file)
    for token in tokens:
        token_findings = regex_engine.search(token)
        for finding in token_findings:
            finding.map_on_file(file=file, relative_start=token.span[0])
            findings.append(finding)

    for finding in findings:
        finding.map_on_file(file=file, relative_start=finding.start_pos)
        finding.choose_final_rule()

    assert len(findings) == 9
    assert findings[0].rules[0].id == 'S0'
    assert findings[1].rules[0].id == 'S0'
    assert findings[2].rules[0].id == 'S1'
    assert findings[3].rules[0].id == 'S2'
    assert findings[4].rules[0].id == 'S3'
    assert findings[5].rules[0].id == 'S4'
    assert findings[6].rules[0].id == 'S5'
    assert findings[7].rules[0].id == 'S19'
    assert findings[8].rules[0].id == 'S19'

    findings = FindingMerger(findings).merge()
    assert len(findings) == 9

    response = FindingResponse.from_list(findings)


def test_extless(file_extless: File, regex_engine: RegexEngine):
    findings: List[Finding] = []
    tokens = FullContentTokenizer().tokenize(file_extless)
    tokens_lex = LexerTokenizer(deep_token_inspection=True).tokenize(file_extless)

    for token in tokens:
        token_findings = regex_engine.search(token)
        for finding in token_findings:
            finding.map_on_file(file=file_extless, relative_start=token.span[0])
            findings.append(finding)

    for finding in findings:
        finding.map_on_file(file=file_extless, relative_start=finding.start_pos)
        finding.choose_final_rule()

    assert len(findings) == 1
    assert findings[0].rules[0].id == 'S28'



def test_go_7(file_go_7: File, regex_engine: RegexEngine):
    findings: List[Finding] = []
    tokens = FullContentTokenizer().tokenize(file_go_7)

    for token in tokens:
        token_findings = regex_engine.search(token)
        for finding in token_findings:
            finding.map_on_file(file=file_go_7, relative_start=token.span[0])
            findings.append(finding)

    for finding in findings:
        finding.map_on_file(file=file_go_7, relative_start=finding.start_pos)
        finding.choose_final_rule()

    assert len(findings) == 0
