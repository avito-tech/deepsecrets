import regex as re
from typing import Callable, List

from pygments.token import Token as PygmentsToken

from deepsecrets.core.model.token import Token
from deepsecrets.core.tokenizers.helpers.semantic.language import Language
from deepsecrets.core.tokenizers.helpers.type_stream import token_to_typestream_item


class SpotImprovements:
    language: Language
    acc: dict[Language, List[Callable]]

    def __init__(self, lang: Language) -> None:
        self.language = lang
        self.acc = {Language.SHELL: [self._curl_argstring_breakdown]}

    def improve_token(self, so_far_tokens: List[Token], so_far_type_stream: str, current_token: Token) -> List[Token]:
        tokens = []
        for improvement in self.acc.get(self.language, []):
            tokens.extend(improvement(so_far_tokens, so_far_type_stream, current_token))

        if len(tokens) == 0:
            return [current_token]

        return tokens

    def _curl_argstring_breakdown(
        self, so_far_tokens: List[Token], so_far_type_stream: str, current_token: Token
    ) -> List[Token]:
        projected_typestream = so_far_type_stream + token_to_typestream_item(current_token)
        rule = {'pattern': re.compile('(L)(L)$'), 'checks': {1: re.compile('^-u$')}}
        match: re.Match = rule['pattern'].search(projected_typestream)
        if not match:
            return [current_token]

        for group_i, pattern in rule['checks'].items():
            span = match.span(group_i)
            group_token: Token = so_far_tokens[span[0]]
            if not pattern.search(group_token.content):
                return [current_token]

        new_parts = current_token.content.split(':')

        final = []
        for part in new_parts:
            t = Token(
                file=current_token.file,
                content=part,
                span=current_token.file.get_span_for_string(part, between=current_token.span),
            )
            t.set_type([PygmentsToken.Text])
            final.append(t)

        return final
