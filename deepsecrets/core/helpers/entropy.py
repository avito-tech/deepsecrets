import math
import regex as re
from enum import Enum
from typing import Optional


class IteratorType(Enum):
    BASE64 = 'base64'
    HEX = 'hex'


class EntropyHelper:
    B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    B64_REGEX = re.compile(r'[A-Za-z0123456789+/=]{20,}')

    HEX_CHARS = '1234567890abcdefABCDEF'
    HEX_REGEX = re.compile(r'[A-Fa-f0123456789]{20,}')

    @classmethod
    def get_for_string(cls, str: str, with_iterator: Optional[str] = None) -> float:
        iterator = None
        i_type = None
        if with_iterator is not None:
            i_type = IteratorType(with_iterator)

        if i_type == IteratorType.BASE64:
            iterator = cls.B64_CHARS

        if i_type == IteratorType.HEX:
            iterator = cls.HEX_CHARS

        return cls._shannon_entropy(str, iterator)

    @classmethod
    def _shannon_entropy(cls, data: str, iterator: Optional[str] = None) -> float:
        """
        Borrowed from http://blog.dkbza.org/2007/05/scanning-data-for-entropy-anomalies.html
        """
        if not data:
            return 0
        entropy = 0
        if iterator:
            for x in iterator:
                p_x = float(data.count(x)) / len(data)
                if p_x > 0:
                    entropy += -p_x * math.log(p_x, 2)
            return entropy

        unique_base = set(data)
        M = len(data)
        entropy_list = []
        # Number of residues in column
        for base in unique_base:
            n_i = data.count(base)  # Number of residues of type i
            P_i = n_i / float(M)  # n_i(Number of residues of type i) / M(Number of residues in column)
            entropy_i = P_i * (math.log(P_i, 2))
            entropy_list.append(entropy_i)

        entropy = -(sum(entropy_list))

        return entropy
