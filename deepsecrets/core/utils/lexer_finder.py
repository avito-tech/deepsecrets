from typing import Dict, List, Optional

from deepsecrets.core.model.file import File
from deepsecrets.core.utils.guess_filetype import FileTypeGuesser
from pygments.lexers import load_lexer_from_file, get_lexer_for_filename, get_lexer_by_name
from pygments.util import ClassNotFound
from jsx import lexer as lexer_mod


class LexerFinder:

    file: File
    extension: str
    distinguishing_feature: List[str]

    alias_exceptions: Dict
    probes: Dict

    def __init__(self) -> None:
        self._init_custom_lexers()
        self._init_alias_exceptions()
        self._init_probes()

    def _init_custom_lexers(self):
        load_lexer_from_file(lexer_mod.__file__, "JsxLexer")
    
    def _init_alias_exceptions(self):
        self.alias_exceptions = {
            'js+react': 'react'
        }
    
    def _init_probes(self):
        self.probes = {
            'js': [
                _probe_react
            ]
        }

    def find(self, file: File):
        self.file = file
        self.extension = self._determine_extension()
        self.distinguishing_feature = self._determine_distinguishing_feature()
        
        filename = self._projected_filename()
        alias = self._projected_alias()
        lexer = None

        try:
            lexer = get_lexer_by_name(alias)
            return lexer
        except ClassNotFound as e:
            pass

        try:
            lexer = get_lexer_for_filename(filename, file.content)
            return lexer
        except ClassNotFound as e:
            pass

        return lexer
    
    def _determine_extension(self):
        if self.file.extension is None:
            return self._try_guess_extension()
        
        return self.file.extension
    
    def _try_guess_extension(self) -> Optional[str]:
        return FileTypeGuesser().guess(self.file.content)
    
    def _determine_distinguishing_feature(self):
        applicable_strategies = self.probes.get(self.extension, [])
        for strategy in applicable_strategies:
            f = strategy(self.file)
            if f is None:
                continue
            return f
        
    def _projected_alias(self):
        alias = self.extension
        if self.distinguishing_feature is not None:
            alias += f'+{self.distinguishing_feature}'
        
        return self.alias_exceptions.get(alias, alias)
    
    def _projected_filename(self):
        filename = self.file.name
        if self.extension is not None:
            filename += f'.{self.extension}'
        
        return filename
        

def _probe_react(file: File):
    # very simple approach at the moment
    evidences = [
        'import React',
        'ReactDOM',
    ]
    if any(evidence in file.content for evidence in evidences):
        return 'react'
    return None