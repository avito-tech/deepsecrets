from deepsecrets.core.helpers.entropy import EntropyHelper


def test_high_entropy():
    test_string = 'qwertyuiopasdfghjklzxcvbnm,123456789'
    entropy = EntropyHelper.get_for_string(test_string)

    assert 5.16 <= entropy <= 5.17


def test_some_entropy():
    test_string = 'hello and very warm welcome, let\'s get the party started'
    entropy = EntropyHelper.get_for_string(test_string)

    assert 3.91 <= entropy <= 3.92


def test_password_entropy():
    test_string = 'v3ry$tongp@ssw0rd'
    entropy = EntropyHelper.get_for_string(test_string)

    assert 3.85 <= entropy <= 3.86


# Oops, it seems like the password has less entropy that a statement
