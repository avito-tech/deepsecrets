import json
import tarfile
from os.path import exists

from deepsecrets.core.model.rules.hashed_secret import HashedSecretRule
from deepsecrets.core.rulesets.ibuilder import IRulesetBuilder


class HashedSecretsRulesetBuilder(IRulesetBuilder):
    rule_model = HashedSecretRule
    ruleset_name = 'hashed'

    def with_rules_from_file(self, file: str, compressed: bool = False) -> object:
        rules_raw = None
        true_file = file
        if compressed:
            if not exists(file):
                return

            with tarfile.open(file, 'r:gz') as tar:
                true_file = tar.extractfile('secrets').read()

        with open(true_file) as sec:
            rules_raw = json.load(sec)

        rules_set = set()
        for secret in rules_raw:
            path = secret.get('path')
            if path is not None:
                path = '/'.join(path.split('/')[1:3])
                if 'non-prod' in path:
                    continue

            rules_set.add(
                HashedSecretRule(
                    id=None,  # calculated inside the constructor  # type: ignore
                    name=f'{path}:{secret["name"]}',
                    hashed_val=secret['hash'],
                    algorithm=secret['algorithm'],
                    token_length=secret['length'],
                    confidence=9,
                )
            )

        self.rules = list(rules_set)
        return self
