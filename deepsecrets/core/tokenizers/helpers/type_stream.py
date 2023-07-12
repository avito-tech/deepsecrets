from pygments.token import Token as PygmentsToken

from deepsecrets.core.model.token import Token

types_to_filter_before = [
    PygmentsToken.Text.Whitespace,
    PygmentsToken.Error,
    PygmentsToken.Keyword,
    PygmentsToken.Generic,
    PygmentsToken.Literal.Date,
    PygmentsToken.Literal.Number,
    PygmentsToken.Literal.String.Char,
    PygmentsToken.Literal.String.Delimiter,
    PygmentsToken.Literal.String.Escape,
    PygmentsToken.Literal.String.Affix,
    PygmentsToken.Literal.String.Interpol,
    PygmentsToken.Comment.Hashbang,
    PygmentsToken.Name.Namespace,
    PygmentsToken.Name.Builtin.Pseudo,
]


types_to_filter_after = [
    PygmentsToken.Punctuation,
    PygmentsToken.Operator,
    PygmentsToken.Name,
]


acc = {
    PygmentsToken.Operator: 'o',
    PygmentsToken.Name: 'n',
    PygmentsToken.Name.Variable: 'v',
    PygmentsToken.Name.Variable.Global: 'v',
    PygmentsToken.Name.Variable.Instance: 'v',
    PygmentsToken.Name.Variable.Magic: 'v',
    PygmentsToken.Name.Other: 'n',
    PygmentsToken.Name.Tag: 'n',
    PygmentsToken.Name.Constant: 'n',
    PygmentsToken.Name.Attribute: 'n',
    PygmentsToken.Keyword.Constant: 'k',
    PygmentsToken.Punctuation: 'p',
    PygmentsToken.Punctuation.Indicator: 'p',
    PygmentsToken.Literal: 'L',
    PygmentsToken.Literal.Scalar.Plain: 'L',
    PygmentsToken.Literal.String: 'L',
    PygmentsToken.String: 'L',
    PygmentsToken.String.Single: 'L',
    PygmentsToken.String.Double: 'L',
    PygmentsToken.Text: 'L',
    PygmentsToken.Literal.String.Backtick: 'p',  # technically it's a punc
}


def token_to_typestream_item(token: Token) -> str:
    if token.content == '\n':
        return '\n'

    if any(type in token.type for type in types_to_filter_before):  # type: ignore
        return 'u'

    return acc.get(token.type[0], '?')  # type: ignore
