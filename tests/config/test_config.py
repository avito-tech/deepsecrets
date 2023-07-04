from deepsecrets.config import Config, Output
from deepsecrets.core.engines.regex import RegexEngine
from deepsecrets.core.rulesets.regex import RegexRulesetBuilder
from deepsecrets.core.utils.exceptions import FileNotFoundException


def test_config():
    config = Config()
    config.set_workdir('tests')
    config.engines.append(RegexEngine)
    config.add_ruleset(RegexRulesetBuilder, ['tests/fixtures/1.conf'])
    config.output = Output(type='json', path='tests/1.json')
    config.set_global_exclusion_paths(['tests/fixtures/1.conf'])

    exception = None
    try:
        config.add_ruleset(RegexRulesetBuilder, ['tests/fixtures/0.conf'])
    except FileNotFoundException as e:
        exception = e

    assert exception is not None

    assert config.workdir_path == '/app/tests'
    assert len(config.engines) == 1
    assert len(config.rulesets) == 1
    assert config.rulesets[RegexRulesetBuilder] == ['/app/tests/fixtures/1.conf']