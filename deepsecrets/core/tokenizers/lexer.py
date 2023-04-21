from typing import List, Sequence, Set, Type, Union

from ordered_set import OrderedSet
from pygments import highlight
from pygments.formatters import RawTokenFormatter
from pygments.lexers import get_lexer_for_filename
from pygments.lexers.special import Lexer, RawTokenLexer
from pygments.token import Token as PygmentsToken
from pygments.util import ClassNotFound

from deepsecrets.core.model.file import File
from deepsecrets.core.model.semantic import Variable
from deepsecrets.core.model.token import Semantic, SemanticType, Token
from deepsecrets.core.tokenizers.helpers.semantic.language import Language
from deepsecrets.core.tokenizers.helpers.semantic.var_detection.rules import VariableDetectionRules
from deepsecrets.core.tokenizers.helpers.spot_improvements import SpotImprovements
from deepsecrets.core.tokenizers.helpers.type_stream import (
    token_to_typestream_item,
    types_to_filter_after,
    types_to_filter_before,
)
from deepsecrets.core.tokenizers.itokenizer import Tokenizer

empty_tokens = ['\n', '\t', "'", "''", '"', '""']


class LexerTokenizer(Tokenizer):
    token_stream: str
    lexer: Lexer
    language: Language

    def _get_types_for_token(self, token: PygmentsToken) -> List[Type]:  # type: ignore
        types = []
        types.append(token)
        if token.parent is not None:
            if token.parent == PygmentsToken:
                return types
            deep = self._get_types_for_token(token.parent)
            types.extend(deep)
        return types

    def sanitize(self, content: str) -> Union[str, bool]:
        quotes = ["'", "''", '"', '""']

        whitespace_cleaned = content.replace(' ', '')
        if 0 <= len(whitespace_cleaned) == 0:
            return False

        # some lexers (eq. TextLexer) leave \n
        # at the end of a Token
        if len(content) > 1 and content[-1] == '\n':
            content = content[:-1]

        if content[0] == content[-1]:
            if content[0] in quotes:
                content = content[1:-1]

        if content in quotes:
            return False

        return content

    def tokenize(self, file: File, post_filter=True) -> List[Token]:
        self.token_stream = ''
        # TODO: don't trust the extension, use 'file' utility ?
        try:
            self.lexer = get_lexer_for_filename(file.path)
        except ClassNotFound:
            self.lexer = None

        if not self.lexer:
            return self.tokens

        try:
            self.language: Language = Language.from_text(self.lexer.filenames[0])
        except ValueError:
            self.language: Language = Language.from_text(file.extension)

        result = highlight(file.content, self.lexer, RawTokenFormatter())
        raw_tokens = list(RawTokenLexer().get_tokens(result))
        token_improver = SpotImprovements(lang=self.language)

        current_position = 0

        for i, raw_token in enumerate(raw_tokens):
            content: str = raw_token[1]
            types: List[Type] = self._get_types_for_token(raw_token[0])
            start = current_position
            end = start + len(content)
            current_position = end

            try:
                content = self.sanitize(content)
                if not content:
                    continue

                span = file.get_span_for_string(content, between=[start - 1, end + 1])
                token = Token(file=file, content=content, span=span)
                token.set_type(types)

                improved_tokens = token_improver.improve_token(self.tokens, self.token_stream, token)

                self.tokens.extend(improved_tokens)
                self.add_to_token_stream(improved_tokens)
            except Exception as e:
                str(e)

        tokens_to_be_excluded = []
        if self.settings.deep_token_inspection is True:  # type: ignore
            tokens_to_be_excluded = self.deep_analyze()

        return self.final_cleanup(self.tokens, tokens_to_be_excluded) if post_filter else list(self.tokens)

    def add_to_token_stream(self, tokens: List[Token]) -> None:
        for token in tokens:
            self.token_stream += token_to_typestream_item(token=token)

    def final_cleanup(self, tokens_all: Sequence[Token], tokens_to_be_excluded: Sequence[Token]) -> List[Token]:
        if not isinstance(tokens_all, OrderedSet):
            tokens_all = OrderedSet(tokens_all)

        tokens_all = tokens_all - tokens_to_be_excluded
        final = []
        for token in tokens_all:
            if any(type in token.type for type in types_to_filter_before):  # type: ignore
                continue

            if any(type in token.type for type in types_to_filter_after):  # type: ignore
                continue

            if token.content in empty_tokens:
                continue

            final.append(token)

        return final

    def deep_analyze(self) -> Set[Token]:
        tokens_all = OrderedSet(self.tokens)
        if self.language is None:
            return tokens_all

        exclude_after = set()

        true_detections: List[Variable] = []
        rules = VariableDetectionRules.for_language(self.language)
        for rule in rules:
            true_detections.extend(rule.match(self.tokens, self.token_stream))

        for var in true_detections:
            var.value.semantic = Semantic(
                type=SemanticType.VAR,
                name=var.name.content,
                creds_probability=var.found_by.creds_probability,
            )
            exclude_after.add(var.name)

        return exclude_after

    def get_variables(self) -> List[Token]:
        vars = []
        if len(self.tokens) == 0:
            return []

        for token in self.tokens:
            if token.semantic is None:
                continue

            if token.semantic.type != SemanticType.VAR:
                continue

            vars.append(token)

        return vars

    def print_token_type_stream(self) -> None:
        print(self.token_stream)
