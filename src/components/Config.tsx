import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const envExample = `# LLM
OPENAI_API_KEY=
OPENAI_BASE_URL=
LLM_MODEL=qwen3.8
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=8000
LLM_TIMEOUT=120
LLM_MAX_RETRIES=3

# Database
DATABASE_URL=postgresql+psycopg://qa_agent:qa_agent@localhost:5432/qa_agent
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30

# Workspace
WORKSPACE_PATH=./workspace

# Requirements source
REQUIREMENTS_SOURCE_TYPE=folder
REQUIREMENTS_CURRENT_PATH=./requirements/current
REQUIREMENTS_BASELINE_PATH=
REQUIREMENTS_FILE_MASKS=*.md,*.txt,*.json,*.yaml,*.yml,*.csv,*.docx,*.xlsx

# Human review
HUMAN_REVIEW_MODE=cli
MAX_STAGE_ITERATIONS=5`;

const dockerCompose = `version: "3.8"

services:
  app:
    build: .
    env_file: .env
    volumes:
      - ./workspace:/app/workspace
    depends_on:
      - db
    command: python main.py

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: qa_agent
      POSTGRES_PASSWORD: qa_agent
      POSTGRES_DB: qa_agent
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`;

const dockerfile = `FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY . .

RUN alembic upgrade head

CMD ["python", "main.py"]`;

const cliCommands = `# Запуск пайплайна
qa-agent run --current ./requirements/current --baseline ./requirements/baseline

# Список запусков
qa-agent runs list

# Детали запуска
qa-agent run show --run-id <id>

# Детали этапа
qa-agent stage show --run-id <id> --stage <stage>

# Подтвердить этап
qa-agent stage approve --run-id <id> --stage <stage>

# Отклонить этап
qa-agent stage reject --run-id <id> --stage <stage>

# Перезапустить этап с комментарием
qa-agent stage rerun --run-id <id> --stage <stage> --comment "текст"`;

interface CodeBlockProps {
  title: string;
  language: string;
  code: string;
}

function CodeBlock({ title, language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-emerald-400">{title}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
        </button>
      </div>
      <pre className="p-4 text-xs text-gray-300 overflow-x-auto font-mono bg-gray-950 max-h-96 overflow-y-auto">
        {code}
      </pre>
    </div>
  );
}

export function Config() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Конфигурация</h2>
        <p className="text-gray-400">
          Переменные окружения, Docker-конфигурация и CLI-команды.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">.env.example</h3>
          <CodeBlock title=".env.example" language="env" code={envExample} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">docker-compose.yml</h3>
          <CodeBlock title="docker-compose.yml" language="yaml" code={dockerCompose} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Dockerfile</h3>
          <CodeBlock title="Dockerfile" language="dockerfile" code={dockerfile} />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">CLI команды</h3>
          <CodeBlock title="CLI" language="bash" code={cliCommands} />
        </div>
      </div>

      {/* Config Classes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Классы конфигурации (Python)</h3>
        <div className="space-y-4">
          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="font-mono text-sm text-cyan-400 mb-2">LLMConfig</h4>
            <pre className="text-xs text-gray-300 font-mono bg-gray-950 rounded p-3">
{`class LLMConfig(BaseSettings):
    api_key: str
    base_url: str
    model: str = "qwen3.8"
    temperature: float = 0.2
    max_tokens: int = 8000
    timeout: int = 120
    max_retries: int = 3`}
            </pre>
          </div>
          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="font-mono text-sm text-cyan-400 mb-2">DatabaseConfig</h4>
            <pre className="text-xs text-gray-300 font-mono bg-gray-950 rounded p-3">
{`class DatabaseConfig(BaseSettings):
    database_url: str
    echo: bool = False
    pool_size: int = 10
    max_overflow: int = 20
    pool_timeout: int = 30`}
            </pre>
          </div>
          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="font-mono text-sm text-cyan-400 mb-2">WorkspaceConfig</h4>
            <pre className="text-xs text-gray-300 font-mono bg-gray-950 rounded p-3">
{`class WorkspaceConfig(BaseSettings):
    workspace_path: str = "./workspace"
    current_path: str = "./requirements/current"
    baseline_path: str = ""
    file_masks: str = "*.md,*.txt,*.json,*.yaml,*.yml,*.csv,*.docx,*.xlsx"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
