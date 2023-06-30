import pytest

from deepsecrets.cli import DeepSecretsCliTool


@pytest.fixture(scope='module')
def args_1():
    return [
        '',
        '--target-dir',
        '/app/tests/fixtures/',
        '--false-findings',
        '/app/tests/fixtures/false_findings.json',
        '--outfile',
        './fdsafad.json',
        '--verbose',
    ]

@pytest.fixture(scope='module')
def args_2():
    return [
        '',
        '--target-dir',
        '/app/tests/fixtures/',
        '--false-findings',
        '/app/tests/fixtures/false_findings.json',
        '--excluded-paths',
        'built-in',
        '/app/tests/fixtures/false_findings.json',
        '--outfile',
        './fdsafad.json',
    ]


def test_1_cli(args_1):
    tool = DeepSecretsCliTool(args=args_1)
    tool.parse_arguments()

    assert tool.config is not None
    assert len(tool.config.rulesets) == 2
    assert len(tool.config.engines) == 2
    assert len(tool.config.global_exclusion_paths) == 1

    assert tool.config.output.path == './fdsafad.json'
    assert tool.config.workdir_path == '/app/tests/fixtures/'


def test_2_cli(args_2):
    tool = DeepSecretsCliTool(args=args_2)
    tool.parse_arguments()

    assert tool.config is not None
    assert len(tool.config.global_exclusion_paths) == 2