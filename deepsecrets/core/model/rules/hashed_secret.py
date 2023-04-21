from typing import Any, Dict

import mmh3
from pydantic import root_validator
from deepsecrets.core.model.rules.hashing import HashingAlgorithm

from deepsecrets.core.model.rules.rule import Rule


class HashedSecretRule(Rule):
    hashed_val: str
    token_length: int
    algorithm: HashingAlgorithm

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, HashedSecretRule):
            return False

        if other.hashed_val == self.hashed_val:
            return True

        if other.id == self.id:
            return True

        return False

    def __hash__(self) -> int:  # pragma: nocover
        return hash(self.hashed_val)

    @root_validator(pre=True)
    def fill_id(cls, values: Dict) -> Dict:
        hashed_val = values.get('hashed_val', None)
        if hashed_val is None:
            return values

        algorithm = values.get('algorithm', None)
        
        if algorithm is None:
            values['algorithm'] = HashingAlgorithm.SHA_512
        else:
            try:
                values['algorithm'] = HashingAlgorithm(algorithm)
            except:
                raise Exception(f'Unsupported hashing algorithm: {algorithm}')


        if values.get('id', None) is None:
            int_hash = abs(mmh3.hash(hashed_val))
            first_3 = str(int_hash)[:3]
            last_2 = str(int_hash)[-2:]
            values['id'] = f'S{first_3}{last_2}'

        return values
