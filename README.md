# DeepSecrets - a better tool for secret scanning

## Yet another tool - why?
Existing tools don't really "understand" code. Instead, they mostly parse texts.

DeepSecrets expands classic regex-search approaches with semantic analysis, dangerous variable detection, and more efficient usage of entropy analysis. Code understanding supports 500+ languages and formats and is achieved by lexing and parsing - techniques commonly used in SAST tools.

DeepSecrets also introduces a new way to find secrets: just use hashed values of your known secrets and get them found plain in your code.

Under the hood story is in articles here: https://hackernoon.com/modernizing-secrets-scanning-part-1-the-problem 

## Mini-FAQ after release :)
> Pff, is it still regex-based?

Yes and no. Of course, it uses regexes and finds typed secrets like any other tool. But language understanding (the lexing stage) and variable detection also use regexes under the hood. So regexes is an instrument, not a problem.

> Why don't you build true abstract syntax trees? It's academically more correct!

DeepSecrets tries to keep a balance between complexity and effectiveness. Building a true AST is a pretty complex thing and simply an overkill for our specific task. So the tool still follows the generic SAST-way of code analysis but optimizes the AST part using a different approach.

> I'd like to build my own semantic rules. How do I do that?

Only through the code by the moment. Formalizing the rules and moving them into a flexible and user-controlled ruleset is in the plans.

> I still have a question

Feel free to communicate with the [maintainer](https://github.com/avito-tech/deepsecrets/blob/main/pyproject.toml#L6-L8)

## Installation

From Github via pip

`$ pip install git+https://github.com/avito-tech/deepsecrets.git`

From PyPi

`$ pip install deepsecrets`


## Scanning
The easiest way:

`$ deepsecrets --target-dir /path/to/your/code --outfile report.json`

This will run a scan against `/path/to/your/code` using the default configuration:
- Regex checks by the built-in ruleset
- Semantic checks (variable detection, entropy checks)

Report will be saved to `report.json`

### Fine-tuning
Run `deepsecrets --help` for details.

Basically, you can use your own ruleset by specifying `--regex-rules`. Paths to be excluded from scanning can be set via `--excluded-paths`.

## Building rulesets

### Regex

The built-in ruleset for regex checks is located in `/deepsecrets/rules/regexes.json`. You're free to follow the format and create a custom ruleset.

### HashedSecret

Example ruleset for regex checks is located in `/deepsecrets/rules/regexes.json`. You're free to follow the format and create a custom ruleset.


## Contributing

### Under the hood
There are several core concepts:

- `File`
- `Tokenizer`
- `Token`
- `Engine`
- `Finding`
- `ScanMode`

### File
Just a pythonic representation of a file with all needed methods for management.

### Tokenizer
A component able to break the content of a file into pieces - Tokens - by its logic. There are four types of tokenizers available:

- `FullContentTokenizer`: treats all content as a single token. Useful for regex-based search.
- `PerWordTokenizer`: breaks given content by words and line breaks.
- `LexerTokenizer`: uses language-specific smarts to break code into semantically correct pieces with additional context for each token.

### Token
A string with additional information about its semantic role, corresponding file, and location inside it.

### Engine
A component performing secrets search for a single token by its own logic. Returns a set of Findings. There are three engines available:

- `RegexEngine`: checks tokens' values through a special ruleset
- `SemanticEngine`: checks tokens produced by the LexerTokenizer using additional context - variable names and values
- `HashedSecretEngine`: checks tokens' values by hashing them and trying to find coinciding hashes inside a special ruleset

### Finding
This is a data structure representing a problem detected inside code. Features information about the precise location inside a file and a rule that found it.

### ScanMode
This component is responsible for the scan process.

- Defines the scope of analysis for a given work directory respecting exceptions
- Allows declaring a `PerFileAnalyzer` - the method called against each file, returning a list of findings. The primary usage is to initialize necessary engines, tokenizers, and rulesets.
- Runs the scan: a multiprocessing pool analyzes every file in parallel.
- Prepares results for output and outputs them.

The current implementation has a `CliScanMode` built by the user-provided config through the cli args.

### Local development

The project is supposed to be developed using VSCode and 'Remote containers' feature.

Steps:
1. Clone the repository
2. Open the cloned folder with VSCode
3. Agree with 'Reopen in container'
4. Wait until the container is built and necessary extensions are installed
5. You're ready
