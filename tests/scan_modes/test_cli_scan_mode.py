import pytest

from deepsecrets.config import Config, Output
from deepsecrets.core.engines.regex import RegexEngine
from deepsecrets.core.rulesets.false_findings import FalseFindingsBuilder
from deepsecrets.core.rulesets.regex import RegexRulesetBuilder
from deepsecrets.scan_modes.cli import CliScanMode


@pytest.fixture(scope='module')
def config():
    config = Config()
    config.set_workdir('tests/fixtures')
    config.engines.append(RegexEngine)
    config.add_ruleset(RegexRulesetBuilder, ['tests/fixtures/regexes.json'])
    config.add_ruleset(FalseFindingsBuilder, ['tests/fixtures/false_findings.json'])
    config.output = Output(type='json', path='tests/1.json')
    return config


def test_cli_scan_mode(config: Config):
    mode = CliScanMode(config=config)
    findings = []
    for file in mode.filepaths:
        findings.extend(mode._per_file_analyzer(mode.analyzer_bundle(), file))

    assert len(findings) == 3

    # checking through the 'run' method
    # false findings checked at the end
    findings = []
    findings = mode.run()

    assert len(findings) == 2
