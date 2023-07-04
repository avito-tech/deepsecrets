import argparse
import json
import logging
import sys
from argparse import RawTextHelpFormatter
from typing import List

from deepsecrets import MODULE_NAME, logger, set_logging_level
from deepsecrets.config import Config, Output
from deepsecrets.core.engines.regex import RegexEngine
from deepsecrets.core.engines.semantic import SemanticEngine
from deepsecrets.core.model.finding import Finding, FindingResponse
from deepsecrets.core.rulesets.false_findings import FalseFindingsBuilder
from deepsecrets.core.rulesets.hashed_secrets import HashedSecretsRulesetBuilder
from deepsecrets.core.rulesets.regex import RegexRulesetBuilder
from deepsecrets.core.utils.fs import get_abspath, get_path_inside_package
from deepsecrets.scan_modes.cli import CliScanMode

DISABLED = 'disabled'
FINDINGS_DETECTED_RETURN_CODE = 66


class DeepSecretsCliTool:
    argparser: argparse.ArgumentParser

    def __init__(self, args: List[str]):
        self.args = args
        self._build_argparser()

    def say_hello(self) -> None:
        bar = '-'
        logger.info('')
        logger.info(f'{" "*8}{bar*25} DeepSecrets {bar*25}')
        logger.info(f'{" "*10}A better tool for secret scanning')
        logger.info(f'{" "*10}version 1.1')
        logger.info(f'')
        logger.info(f'{" "*8}{bar*63}')


    def _build_argparser(self) -> None:
        parser = argparse.ArgumentParser(
            prog=MODULE_NAME,
            description='DeepSecrets - a better tool for secrets search',
            formatter_class=RawTextHelpFormatter,
        )

        parser.add_argument(
            '--target-dir',
            required=True,
            type=str,
            help="Path to the directory with code you'd like to analyze",
        )

        parser.add_argument(
            '--regex-rules',
            nargs='*',
            type=str,
            help='Paths to your Regex Rulesets.\n'
            "- Set 'disable' to turn off regex checks\n"
            '- Ignore this argument to use the built-in ruleset.\n'
            "- Using your own rulesets disables the default one. Add 'built-in' to the args list to enable it\n"
            'eq. --regex-rules built-in /root/my_regex_rules.json\n',
            default=['built-in'],
        )

        parser.add_argument(
            '--hashed-values',
            nargs='*',
            type=str,
            help='Path to your Hashed Values set.\n' "Don't set any value to disable this checks\n",
        )

        parser.add_argument(
            '--semantic-analysis',
            nargs='*',
            type=str,
            help='Controls semantic checks (enabled by default)\n'
            "- Set 'disable' to turn off semantic checks (not recommended)\n"
            'eq. --semantic-analysis disable',
            default=['built-in'],
        )

        parser.add_argument(
            '--excluded-paths',
            nargs='*',
            type=str,
            help='Paths to your Excluded Paths file.\n'
            "- Set 'disable' to scan everything (may affect performance)\n"
            '- Ignore this argument to use the built-in ruleset.\n'
            "- Using your own rulesets disables the default one. Add 'built-in' to the args list to enable it\n"
            'eq. --excluded-paths built-in /root/my_excluded_paths.json\n',
            default=['built-in'],
        )

        parser.add_argument(
            '--false-findings',
            nargs='*',
            type=str,
            help='Paths to your False Findings file.\n'
            'Use to filter findings you sure are false positives\n'
            'File syntax is the same as in regex rules\n'
            'eq. --false-findings /root/my_false_findings.json\n',
        )

        parser.add_argument(
            '-v',
            '--verbose',
            action='store_true',
            help='Verbose mode',
        )

        parser.add_argument(
            '--reflect-findings-in-return-code',
            action='store_true',
            help='Return code of 66 if any findings are detected during scan',
        )

        parser.add_argument(
            '--process-count',
            type=int,
            default=0,
            help='Number of processes in a pool for file analysis (one process per file)\n'
            'Default: number of processor cores of your machine or cpu limit of your container from cgroup.\n'
            'If all checks are failed the fallback value is 4'
        )

        parser.add_argument('--outfile', required=True, type=str)
        parser.add_argument('--outformat', default='json', type=str, choices=['json'])
        self.argparser = parser

    def parse_arguments(self) -> None:
        user_args = self.argparser.parse_args(args=self.args[1:])
        self.say_hello()

        if user_args.verbose:
            set_logging_level(logging.DEBUG)

        self.config = Config()
        self.config.set_workdir(user_args.target_dir)
        self.config.set_process_count(user_args.process_count)
        self.config.output = Output(type=user_args.outformat, path=user_args.outfile)

        if user_args.reflect_findings_in_return_code:
            self.config.return_code_if_findings = True

        EXCLUDE_PATHS_BUILTIN = get_path_inside_package('rules/excluded_paths.json')
        if user_args.excluded_paths is not None:
            rules = [rule.replace('built-in', EXCLUDE_PATHS_BUILTIN) for rule in user_args.excluded_paths]
            self.config.set_global_exclusion_paths(rules)

        self.config.engines = []

        REGEX_BUILTIN_RULESET = get_path_inside_package('rules/regexes.json')
        if user_args.regex_rules is not None:
            rules = [rule.replace('built-in', REGEX_BUILTIN_RULESET) for rule in user_args.regex_rules]
            self.config.engines.append(RegexEngine)
            self.config.add_ruleset(RegexRulesetBuilder, rules)

        conf_semantic_analysis = user_args.semantic_analysis
        if conf_semantic_analysis is not None and conf_semantic_analysis != DISABLED:
            self.config.engines.append(SemanticEngine)

        conf_hashed_ruleset = user_args.hashed_values
        if conf_hashed_ruleset is not None and conf_hashed_ruleset != DISABLED:
            self.config.engines.append(RegexEngine)
            self.config.add_ruleset(HashedSecretsRulesetBuilder, conf_hashed_ruleset)

        conf_false_findings_ruleset = user_args.false_findings
        if conf_false_findings_ruleset is not None:
            self.config.add_ruleset(FalseFindingsBuilder, conf_false_findings_ruleset)

    def start(self) -> None:  # pragma: nocover
        try:
            self.parse_arguments()
        except Exception as e:
            logger.exception(e)
            sys.exit(1)

        logger.info(f'Starting scan against {self.config.workdir_path} using {self.config.process_count} processes...')
        if self.config.return_code_if_findings is True:
            logger.info(f'[!] The tool will return code of {FINDINGS_DETECTED_RETURN_CODE} if any findings are detected\n')

        logger.info(80 * '=')
        findings: List[Finding] = CliScanMode(config=self.config).run()
        logger.info(80 * '=')
        logger.info('Scanning finished')
        logger.info(f'{len(findings)} potential secrets found')
        report_path = get_abspath(self.config.output.path)

        logger.info(f'Writing report to {report_path}')
        with open(report_path, 'w+') as f:
            json.dump(FindingResponse.from_list(findings), f)

        logger.info('Done')

        if len(findings) > 0 and self.config.return_code_if_findings:
            sys.exit(FINDINGS_DETECTED_RETURN_CODE)