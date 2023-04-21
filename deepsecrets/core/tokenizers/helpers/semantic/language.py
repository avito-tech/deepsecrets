from enum import Enum


class Language(Enum):
    PYTHON = 'py'
    GOLANG = 'go'
    PHP = 'php'
    JS = 'js'
    TOML = 'toml'
    JSON = 'json'
    YAML = 'yaml'
    INI = 'ini'
    PUPPET = 'pp'
    SHELL = 'sh'
    CSHARP = 'cs'
    JAVA = 'java'
    KOTLIN = 'kt'

    ANY = 'any'
    UNKNOWN = 'unknown'

    @classmethod
    def from_text(cls, text: str) -> object:
        ext = text.split('.')[-1]
        return cls(ext)

    @classmethod
    def _missing_(cls, value: str) -> object:
        return Language.UNKNOWN
