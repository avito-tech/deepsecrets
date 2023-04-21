import regex as re
from typing import Dict, Optional, Tuple

from deepsecrets import logger
from deepsecrets.core.utils.fs import get_abspath


class File:
    relative_path: str
    path: str
    content: str = ''
    length: int
    line_offsets: Dict[int, Tuple[int, int]] = {}
    line_contents_cache: Dict[int, str] = {}
    empty: bool
    extension: Optional[str]

    def __init__(
        self,
        path: str,
        relative_path: Optional[str] = None,
        content: Optional[str] = None,
        offsets: Optional[Dict] = None,
    ) -> None:
        self.line_offsets = {}
        self.line_contents_cache = {}

        if path is not None:
            self.path = get_abspath(path)

        self.relative_path = relative_path if relative_path is not None else self.path

        if content is not None:
            self.content = content
        else:
            try:
                self.content = self._get_contents()
            except Exception as e:
                logger.error('Error during fetching file contents')

        self.length = len(self.content)

        self.extension = self._get_extension()
        self.empty = True if self.length == 0 else False

        if offsets is not None:
            self.line_offsets = offsets

        if not self.empty and len(self.line_offsets) == 0:
            self._calc_offsets()

    def _get_extension(self) -> Optional[str]:
        by_dot = self.path.split('.')
        if len(by_dot) == 1:
            return None

        return by_dot[-1]

    def _calc_offsets(self) -> None:
        line_breaks = [i.start() for i in re.finditer('\n', self.content)]
        for i, lb in enumerate(line_breaks):
            start = line_breaks[i - 1] + 1 if i > 0 else 0
            self.line_offsets[i + 1] = (start, lb)

        if len(self.line_offsets) == 0 and self.length > 0:
            self.line_offsets[1] = (0, self.length)

    def _get_contents(self) -> str:
        with open(self.path) as f:
            raw = f.read()
            if raw[-1] != '\n':
                raw += '\n'
            return raw

    def get_line_number(self, position: int) -> Optional[int]:
        return self._get_line_number_for_position(position=position)

    def _get_line_number_for_position(self, position: int) -> Optional[int]:
        for linum, offsets in self.line_offsets.items():
            if offsets[1] < position:
                continue
            return linum
        return None

    def get_line_contents(self, line_number: int) -> Optional[str]:
        if line_number is None:
            return

        if line_number not in self.line_contents_cache:
            self.line_contents_cache[line_number] = self.content[
                self.line_offsets[line_number][0]:self.line_offsets[line_number][1]
            ]
        return self.line_contents_cache[line_number]

    def get_full_line_for_position(self, span_end: int) -> Optional[str]:
        linum = self._get_line_number_for_position(span_end)
        if linum is None:
            return None

        return self.get_line_contents(linum)

    def get_span_for_string(self, str: str, between: Optional[Tuple[int, int]] = None) -> Optional[Tuple[int, int]]:
        if between is None:
            between = (0, self.length)

        search_window = self.content[between[0] : between[1]]

        pattern = re.escape(str)
        pattern = pattern.replace('\\\n', '\n').replace('\\\t', '\t')
        detects = re.finditer(pattern, search_window)
        for detect in detects:
            span = detect.span()
            return (between[0] + span[0], between[0] + span[1])
        return None

    def __repr__(self) -> str:  # pragma: no cover
        return self.path
