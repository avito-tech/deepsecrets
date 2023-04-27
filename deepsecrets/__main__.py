import sys

from deepsecrets.cli import DeepSecretsCliTool

if __name__ == '__main__':
    sys.exit(DeepSecretsCliTool(sys.argv).start())
