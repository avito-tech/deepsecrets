import json
import tomllib
from typing import Optional


class FileTypeGuesser:

    def __init__(self) -> None:
        self.probes = {
            'json': self._is_json,
            'toml': self._is_toml,
        }

    def guess(self, content: str) -> Optional[str]:
        for ext, probe in self.probes.items():
            if probe(content):
                return ext
        
        # TODO: Guesslang
        '''
        ml_guesser = Guess()
        guess = ml_guesser.language_name(content)
        if not guess:
            return None

        for ext, name in ml_guesser._extension_map.items():
            if name == guess:
                return ext
        '''
        return None
        

    
    def _is_json(self, content: str):
        try:
            json.loads(content)
        except Exception as e:
            return False
        
        return True

    def _is_toml(self, content: str):
        try:
            tomllib.loads(content)
        except Exception as e:
            return False
        
        return True
        