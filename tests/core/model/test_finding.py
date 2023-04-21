import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.model.finding import Finding
from deepsecrets.core.model.rules.rule import Rule
from deepsecrets.core.model.token import Token

TEST_TOKEN_CONTENTS = (
    '"amqp://fake_user:TESTSECRET1234@rabbitmq-esp01.miami.example.com:5672/esp"'
)
TOKEN_SPAN = (76, 151)

FINDING_CONTENT = 'TESTSECRET1234'
FINDING_SPAN_INSIDE_TOKEN = (18, 32)


@pytest.fixture(scope='module')
def file() -> File:
    path = 'tests/fixtures/4.go'
    return File(path=path, relative_path=path)


@pytest.fixture(scope='module')
def rule() -> Rule:
    return Rule(id='test')


@pytest.fixture(scope='module')
def token(file: File) -> Token:
    return Token(
        file=file,
        content=TEST_TOKEN_CONTENTS,
        span=file.get_span_for_string(TEST_TOKEN_CONTENTS),
    )


def test_1_finding(file: File, token: Token, rule: Rule):
    assert file.content[token.span[0] : token.span[1]] == TEST_TOKEN_CONTENTS

    new_finding = Finding(
        file=file,
        rules=[rule],
        start_pos=FINDING_SPAN_INSIDE_TOKEN[0],
        end_pos=FINDING_SPAN_INSIDE_TOKEN[1],
        detection=token.content[
            FINDING_SPAN_INSIDE_TOKEN[0] : FINDING_SPAN_INSIDE_TOKEN[1]
        ],
    )

    assert new_finding.detection == FINDING_CONTENT
    new_finding.map_on_file(relative_start=token.span[0])

    assert new_finding.start_pos == TOKEN_SPAN[0] + FINDING_SPAN_INSIDE_TOKEN[0]
    assert new_finding.end_pos == TOKEN_SPAN[0] + FINDING_SPAN_INSIDE_TOKEN[1]
