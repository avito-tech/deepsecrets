from deepsecrets.core.model.token import Token


class Variable:
    name: Token
    value: Token
    found_by: 'VaribleDetector'


from deepsecrets.core.tokenizers.helpers.semantic.var_detection.detector import (
    VaribleDetector,
)
