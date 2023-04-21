import pytest

from deepsecrets.cli import DeepSecretsCliTool


@pytest.fixture(scope='module')
def args():
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


def test_1_cli(args):
    tool = DeepSecretsCliTool(args=args)
    tool.parse_arguments()

    assert tool.config is not None
    assert len(tool.config.rulesets) == 2
    assert len(tool.config.engines) == 2
    assert tool.config.output.path == './fdsafad.json'
    assert tool.config.workdir_path == '/app/tests/fixtures/'
