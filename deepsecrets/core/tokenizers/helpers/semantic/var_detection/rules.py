import regex as re
from typing import List

from deepsecrets.core.tokenizers.helpers.semantic.language import Language
from deepsecrets.core.tokenizers.helpers.semantic.var_detection.detector import Match, VaribleDetector


class VariableDetectionRules:
    rules = [
        VaribleDetector(
            language=Language.PYTHON,
            stream_pattern=re.compile('(n)(o|p)(?:\n?)(L)(?:\n|p|\?)'),  # noqa
            match_rules={2: Match(values=['=', ':'])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.PYTHON,
            stream_pattern=re.compile('(L)(p)(L)(?:p|\n)'),
            match_rules={2: Match(values=[':'])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.PYTHON,
            stream_pattern=re.compile('(L)(p)(o)(L)'),
            match_rules={2: Match(values=[']']), 3: Match(values=['='])},
            match_semantics={1: 'name', 4: 'value'},
        ),
        # GOLANG
        VaribleDetector(
            language=Language.GOLANG,
            stream_pattern=re.compile('(n)(p)(L)(?:p|\n)?'),
            match_rules={2: Match(values=[':', '='])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.GOLANG,
            stream_pattern=re.compile('(n)(p)(L)(?:p|\n)?(L)(p)'),
            match_rules={
                1: Match(values=['Setenv']),
                2: Match(values=['(']),
                5: Match(values=[')']),
            },
            match_semantics={3: 'name', 4: 'value'},
        ),
        VaribleDetector(
            language=Language.GOLANG,
            stream_pattern=re.compile('(n)(?:p|n|u)?(o)(n|p){0,5}(L)'),
            match_rules={
                2: Match(values=[':=']),
                3: Match(not_values=['Getenv', 'Setenv']),
            },
            match_semantics={1: 'name', 4: 'value'},
        ),
        VaribleDetector(
            language=Language.GOLANG,
            stream_pattern=re.compile('(n)(?:o|p){1,3}(\?|u)p(L)p'),  # noqa
            match_rules={2: Match(values=['byte', 'string'])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        # PHP
        VaribleDetector(
            language=Language.PHP,
            stream_pattern=re.compile('(n|v|L)(o)(L)'),
            match_rules={2: Match(values=['=', '=>'])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.PHP,
            stream_pattern=re.compile('(L)(o)(n)(p)Lp(L)p'),
            match_rules={
                2: Match(values=['=>']),
                3: Match(values=['env']),
                4: Match(values=['(']),
            },
            match_semantics={1: 'name', 5: 'value'},
        ),
        # CONFIGS AND FORMATS
        VaribleDetector(
            language=Language.TOML,
            stream_pattern=re.compile('(n)(o)(L)\n'),
            match_rules={2: Match(values=['='])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.YAML,
            stream_pattern=re.compile('(L)(p)(L)'),
            match_rules={2: Match(values=[':'])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.INI,
            stream_pattern=re.compile('(n)(o)(L)'),
            match_rules={2: Match(values=['='])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.PUPPET,
            stream_pattern=re.compile('(v|n)(o)(L)'),
            match_rules={2: Match(values=['=>', '='])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.ANY,
            stream_pattern=re.compile('(v|n)(p|o)(L)'),
            match_rules={2: Match(values=[':', '='])},
            match_semantics={1: 'name', 3: 'value'},
        ),
        VaribleDetector(
            language=Language.SHELL,
            stream_pattern=re.compile('(L)(L)(L)(L)'),
            match_rules={
                1: Match(values=[re.compile('^curl$')]),
                2: Match(values=[re.compile('^-u$')]),
                4: Match(not_values=[re.compile('^\\$')]),
            },
            match_semantics={3: 'name', 4: 'value'},
            creds_probability=9,
        ),

        VaribleDetector(
            language=Language.CSHARP,
            stream_pattern=re.compile('(n).{0,6}(u|L)p(L)(p)'),
            match_rules={
                1: Match(values=[re.compile('^KeyValuePair$')]),
                4: Match(not_values=[re.compile('^}$')]),
            },
            match_semantics={2: 'name', 3: 'value'},
        ),

        VaribleDetector(
            language=Language.CSHARP,
            stream_pattern=re.compile('(p)(.)(p)(L)(p)'),
            match_rules={
                1: Match(values=[re.compile('^{$')]),
                3: Match(values=[re.compile('^,$')]),
                5: Match(values=[re.compile('^}$')]),
            },
            match_semantics={2: 'name', 4: 'value'},
        ),

        VaribleDetector(
            language=Language.JAVA,
            stream_pattern=re.compile('(n)(p)(.)(p)(L)'),
            match_rules={
                1: Match(values=[re.compile('^put$')]),
                2: Match(values=[re.compile('^\\($')]),
                4: Match(values=[re.compile('^,$')]),
            },
            match_semantics={3: 'name', 5: 'value'},
        ),

    ]

    @classmethod
    def for_language(cls, language: Language) -> List[VaribleDetector]:
        return list(filter(lambda x: x.language in [language, Language.ANY], cls.rules))
