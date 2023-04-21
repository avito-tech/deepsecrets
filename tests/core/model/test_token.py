import pytest

from deepsecrets.core.model.file import File
from deepsecrets.core.model.semantic import Variable
from deepsecrets.core.model.token import Semantic, SemanticType, Token

TEST_TOKEN_CONTENTS = (
    '"amqp://fake_user:TESTSECRET1234@rabbitmq-esp01.miami.example.com:5672/esp"'
)
TOKEN_SPAN = (76, 151)


@pytest.fixture(scope='module')
def file() -> File:
    path = 'tests/fixtures/4.go'
    return File(path=path, relative_path=path)


def test_token(file: File):
    token = Token(
        file=file,
        content=TEST_TOKEN_CONTENTS,
        span=file.get_span_for_string(TEST_TOKEN_CONTENTS),
    )

    assert token.span == TOKEN_SPAN
    assert token.length == 75
    assert token.semantic is None
    assert len(token.type) == 0


def test_semantic_token(file: File):
    token = Token(
        file=file,
        content=TEST_TOKEN_CONTENTS,
        span=file.get_span_for_string(TEST_TOKEN_CONTENTS),
    )

    token.set_type(['Variable'])
    variable = Variable()
    variable.name = token
    variable.value = token

    token.semantic = Semantic(type=SemanticType.VAR, name=variable.name.content)

    assert token.span == TOKEN_SPAN
    assert token.length == 75
    assert token.semantic is not None
    assert len(token.type) == 1
