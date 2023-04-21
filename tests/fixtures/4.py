# flake8: noqa
# fmt: off

CFAuthData = {'username': 'fdfsdfdsf-cf', 'pass': 'TESTSECRET1234', 'host': 'https://cf.example.com'}

CFAuthData['lol'] = 'valentin'

result = {'line': 'fdsfdsafdsafdsagfds'}
print('')


class SlackApproveTypes(Enum):
    USER_MARKED_AS_FALSE = 'user_marked_false'
    USER_MARKED_AS_FALSE_BAD_RULE = 'user_marked_false_bad_rule'
    USER_MARKED_AS_FALSE_UNAPPLICABLE = 'user_marked_false_unapplicable'
    USER_MARKED_AS_FALSE_OTHER = 'user_marked_false_other'

    ADMIN_MARKED_AS_FALSE = 'adm_marked_false'
    ADMIN_APPROVED = 'adm_approved'
