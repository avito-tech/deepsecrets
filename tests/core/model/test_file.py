import pytest

from deepsecrets.core.model.file import File

LINE_BREAK = '\n'


@pytest.fixture(scope='module')
def model() -> File:
    path = 'tests/fixtures/4.go'
    return File(path=path, relative_path=path)


def test_basic_info(model):
    assert model.path == '/app/tests/fixtures/4.go'
    assert model.relative_path == 'tests/fixtures/4.go'
    assert model.extension == 'go'
    assert model.length == 395
    assert len(model.line_offsets) == 15


def test_line_offsets(model):
    assert model.line_offsets[1] == (0, 48)
    assert model.content[48] == LINE_BREAK

    assert model.line_offsets[2] == (49, 152)
    assert model.content[152] == LINE_BREAK

    assert model.line_offsets[3] == (153, 154)
    assert model.content[154] == LINE_BREAK

    assert model.line_offsets[4] == (155, 194)
    assert model.content[194] == LINE_BREAK

    assert model.line_offsets[5] == (195, 240)
    assert model.content[240] == LINE_BREAK

    assert model.line_offsets[6] == (241, 293)
    assert model.content[293] == LINE_BREAK

    assert model.line_offsets[7] == (294, 294)
    assert model.content[294] == LINE_BREAK

    assert model.line_offsets[8] == (295, 311)
    assert model.content[311] == LINE_BREAK

    assert model.line_offsets[9] == (312, 325)
    assert model.content[325] == LINE_BREAK

    assert model.line_offsets[10] == (326, 328)
    assert model.content[328] == LINE_BREAK

    assert model.line_offsets[11] == (329, 358)
    assert model.content[358] == LINE_BREAK

    assert model.line_offsets[12] == (359, 375)
    assert model.content[375] == LINE_BREAK

    assert model.line_offsets[13] == (376, 389)
    assert model.content[389] == LINE_BREAK

    assert model.line_offsets[14] == (390, 392)
    assert model.content[392] == LINE_BREAK

    assert model.line_offsets[15] == (393, 394)
    assert model.content[394] == LINE_BREAK

    assert (
        model.content[-1]
        == model.content[model.length - 1]
        == model.content[394]
        == '\n'
    )


def test_caching(model: File):
    LINUM = 4
    line_contents = model.get_line_contents(LINUM)
    assert line_contents == '''\ttest2 := os.Getenv(`TEST_TEST`, "lol")'''
    assert model.line_contents_cache[LINUM] == line_contents


def test_get_full_line_for_position(model: File):
    POSITION = 94
    projected_line_number = 2
    line_contents = model.get_full_line_for_position(POSITION)
    assert (
        line_contents
        == '\tos.Setenv("RABBITMQ_URL", "amqp://fake_user:TESTSECRET1234@rabbitmq-esp01.miami.example.com:5672/esp")'
    )
    assert projected_line_number in model.line_contents_cache.keys()


def test_get_line_number(model: File):
    POSITION = 94
    projected_line_number = 2
    line_number = model.get_line_number(POSITION)
    assert line_number == projected_line_number


def test_1_span_for_string(model: File):
    looking_for = 'rabbitmq-esp01'
    span = model.get_span_for_string(looking_for)
    assert span == (109, 123)


def test_2_span_for_string(model: File):
    looking_for = 'rabbitmq-esp01'
    span = model.get_span_for_string(looking_for, between=(130, 150))
    assert span is None
