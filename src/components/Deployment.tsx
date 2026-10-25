import { useState } from 'react';
import { Copy, Check, Terminal, Package, Database, Settings, Play, AlertCircle, CheckCircle } from 'lucide-react';

interface CodeBlockProps {
  title: string;
  language: string;
  code: string;
  showCopy?: boolean;
}

function CodeBlock({ title, language, code, showCopy = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden my-4">
      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-gray-400" />
          <span className="font-mono text-sm text-emerald-400">{title}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">{language}</span>
        </div>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
          </button>
        )}
      </div>
      <pre className="p-4 text-xs text-gray-300 overflow-x-auto font-mono bg-gray-950">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Deployment() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Инструкция по развертыванию и запуску</h2>
        <p className="text-gray-400">
          Полное руководство по установке и запуску QA Agent MVP локально на вашем компьютере.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Содержание</h3>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex items-center gap-2"><span className="text-emerald-400">1.</span> Системные требования</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">2.</span> Установка зависимостей</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">3.</span> Клонирование репозитория</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">4.</span> Создание виртуального окружения</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">5.</span> Установка Python-пакетов</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">6.</span> Настройка PostgreSQL</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">7.</span> Конфигурация приложения</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">8.</span> Инициализация базы данных</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">9.</span> Запуск приложения</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">10.</span> Использование CLI</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">11.</span> Запуск через Docker</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">12.</span> Тестирование</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">13.</span> Решение проблем</li>
          <li className="flex items-center gap-2"><span className="text-emerald-400">14.</span> Отладка в PyCharm</li>
        </ol>
      </div>

      {/* 1. System Requirements */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-400" />
          1. Системные требования
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Обязательные:</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-200">Python 3.11 или выше</span>
                  <div className="text-xs text-gray-500">Проверка: <code className="text-cyan-400">python --version</code></div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-200">PostgreSQL 15 или выше</span>
                  <div className="text-xs text-gray-500">Или Docker для запуска PostgreSQL в контейнере</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-200">Git</span>
                  <div className="text-xs text-gray-500">Проверка: <code className="text-cyan-400">git --version</code></div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-200">pip (Python package manager)</span>
                  <div className="text-xs text-gray-500">Обычно устанавливается вместе с Python</div>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Опциональные:</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-200">Docker и Docker Compose</span>
                  <div className="text-xs text-gray-500">Для запуска в контейнерах</div>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-200">Доступ к OpenAI-compatible API</span>
                  <div className="text-xs text-gray-500">Для работы LLM (qwen3.8 или аналог)</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <strong className="text-amber-400">Рекомендация:</strong> Для разработки используйте виртуальное окружение Python и локальную PostgreSQL. Для production — Docker.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Installation */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-400" />
          2. Установка зависимостей
        </h3>
        
        <h4 className="text-sm font-medium text-gray-300 mb-2">Ubuntu/Debian:</h4>
        <CodeBlock
          title="Установка системных зависимостей"
          language="bash"
          code={`# Обновление пакетов
sudo apt update

# Установка Python 3.11+
sudo apt install -y python3.11 python3.11-venv python3-pip

# Установка PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-client-15

# Установка Git
sudo apt install -y git

# Проверка версий
python3.11 --version
psql --version
git --version`}
        />

        <h4 className="text-sm font-medium text-gray-300 mb-2 mt-6">macOS:</h4>
        <CodeBlock
          title="Установка через Homebrew"
          language="bash"
          code={`# Установка Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установка Python
brew install python@3.11

# Установка PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Установка Git (обычно уже есть)
brew install git

# Проверка версий
python3.11 --version
psql --version
git --version`}
        />

        <h4 className="text-sm font-medium text-gray-300 mb-2 mt-6">Windows:</h4>
        <div className="text-sm text-gray-400 space-y-2">
          <p>Скачайте и установите:</p>
          <ul className="space-y-1 ml-4">
            <li>• <a href="https://www.python.org/downloads/" className="text-cyan-400 hover:underline" target="_blank" rel="noopener">Python 3.11+</a> (отметьте "Add to PATH")</li>
            <li>• <a href="https://www.postgresql.org/download/windows/" className="text-cyan-400 hover:underline" target="_blank" rel="noopener">PostgreSQL 15+</a></li>
            <li>• <a href="https://git-scm.com/download/win" className="text-cyan-400 hover:underline" target="_blank" rel="noopener">Git for Windows</a></li>
          </ul>
        </div>
      </div>

      {/* 3. Clone Repository */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Terminal size={20} className="text-emerald-400" />
          3. Клонирование репозитория
        </h3>
        <CodeBlock
          title="Клонирование и переход в директорию"
          language="bash"
          code={`# Клонирование репозитория
git clone https://github.com/your-org/qa-agent-mvp.git

# Переход в директорию проекта
cd qa-agent-mvp

# Проверка структуры
ls -la`}
        />
      </div>

      {/* 4. Virtual Environment */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Terminal size={20} className="text-emerald-400" />
          4. Создание виртуального окружения
        </h3>
        <CodeBlock
          title="Создание и активация venv"
          language="bash"
          code={`# Создание виртуального окружения
python3.11 -m venv venv

# Активация (Linux/macOS)
source venv/bin/activate

# Активация (Windows)
venv\\Scripts\\activate

# Проверка (должно показать путь к venv)
which python  # Linux/macOS
where python  # Windows`}
        />
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <strong className="text-blue-400">Примечание:</strong> После активации все команды Python и pip будут выполняться в виртуальном окружении.
            </div>
          </div>
        </div>
      </div>

      {/* 5. Install Python Packages */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-400" />
          5. Установка Python-пакетов
        </h3>
        <CodeBlock
          title="Установка зависимостей"
          language="bash"
          code={`# Обновление pip
pip install --upgrade pip

# Установка проекта в режиме разработки
pip install -e .

# Или установка основных зависимостей напрямую
pip install -r requirements.txt

# Проверка установки
pip list | grep -E "langgraph|pydantic|sqlalchemy|alembic|typer"`}
        />
      </div>

      {/* 6. PostgreSQL Setup */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-emerald-400" />
          6. Настройка PostgreSQL
        </h3>
        
        <h4 className="text-sm font-medium text-gray-300 mb-2">Вариант A: Локальная PostgreSQL</h4>
        <CodeBlock
          title="Создание базы данных и пользователя"
          language="bash"
          code={`# Подключение к PostgreSQL
psql -U postgres

# В PostgreSQL shell:
CREATE USER qa_agent WITH PASSWORD 'qa_agent';
CREATE DATABASE qa_agent OWNER qa_agent;
GRANT ALL PRIVILEGES ON DATABASE qa_agent TO qa_agent;
\\q

# Проверка подключения
psql -U qa_agent -d qa_agent -h localhost`}
        />

        <h4 className="text-sm font-medium text-gray-300 mb-2 mt-6">Вариант B: PostgreSQL в Docker</h4>
        <CodeBlock
          title="Запуск PostgreSQL в Docker"
          language="bash"
          code={`# Запуск PostgreSQL контейнера
docker run -d \\
  --name qa-agent-postgres \\
  -e POSTGRES_USER=qa_agent \\
  -e POSTGRES_PASSWORD=qa_agent \\
  -e POSTGRES_DB=qa_agent \\
  -p 5432:5432 \\
  postgres:15

# Проверка статуса
docker ps | grep qa-agent-postgres

# Остановка (когда не нужна)
docker stop qa-agent-postgres

# Запуск (когда нужна снова)
docker start qa-agent-postgres`}
        />
      </div>

      {/* 7. Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings size={20} className="text-emerald-400" />
          7. Конфигурация приложения
        </h3>
        <CodeBlock
          title="Создание .env файла"
          language="bash"
          code={`# Копирование примера конфигурации
cp .env.example .env

# Редактирование .env
nano .env  # или vim, code, любой редактор`}
        />

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Минимальная конфигурация .env:</h4>
          <CodeBlock
            title=".env"
            language="env"
            code={`# LLM Configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_MODEL=qwen3.8
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=8000
LLM_TIMEOUT=120
LLM_MAX_RETRIES=3

# Database Configuration
DATABASE_URL=postgresql+psycopg://qa_agent:qa_agent@localhost:5432/qa_agent
DB_ECHO=false
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30

# Workspace
WORKSPACE_PATH=./workspace

# Requirements Source
REQUIREMENTS_SOURCE_TYPE=folder
REQUIREMENTS_CURRENT_PATH=./requirements/current
REQUIREMENTS_BASELINE_PATH=
REQUIREMENTS_FILE_MASKS=*.md,*.txt,*.json,*.yaml,*.yml,*.csv,*.docx,*.xlsx

# Human Review
HUMAN_REVIEW_MODE=cli
MAX_STAGE_ITERATIONS=5`}
          />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <strong className="text-amber-400">Важно:</strong> Замените <code className="text-cyan-400">your-api-key-here</code> на реальный API-ключ для вашей OpenAI-compatible модели.
            </div>
          </div>
        </div>
      </div>

      {/* 8. Database Initialization */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database size={20} className="text-emerald-400" />
          8. Инициализация базы данных
        </h3>
        <CodeBlock
          title="Применение миграций Alembic"
          language="bash"
          code={`# Проверка статуса миграций
alembic current

# Применение всех миграций
alembic upgrade head

# Проверка создания таблиц
psql -U qa_agent -d qa_agent -c "\\dt"

# Ожидаемые таблицы:
# - runs
# - stage_states
# - human_reviews
# - requirement_versions
# - requirement_deltas`}
        />
      </div>

      {/* 9. Run Application */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Play size={20} className="text-emerald-400" />
          9. Запуск приложения
        </h3>
        
        <h4 className="text-sm font-medium text-gray-300 mb-2">Вариант A: Прямой запуск</h4>
        <CodeBlock
          title="Запуск через Python"
          language="bash"
          code={`# Запуск основного скрипта
python main.py

# Или через модуль
python -m qa_agent`}
        />

        <h4 className="text-sm font-medium text-gray-300 mb-2 mt-6">Вариант B: Через CLI</h4>
        <CodeBlock
          title="Использование CLI"
          language="bash"
          code={`# Запуск пайплайна с требованиями
qa-agent run --current ./requirements/current --baseline ./requirements/baseline

# Просмотр списка запусков
qa-agent runs list

# Детали конкретного запуска
qa-agent run show --run-id <run-id>

# Просмотр этапа
qa-agent stage show --run-id <run-id> --stage intake_requirements

# Подтверждение этапа
qa-agent stage approve --run-id <run-id> --stage intake_requirements

# Отклонение этапа
qa-agent stage reject --run-id <run-id> --stage intake_requirements

# Перезапуск этапа с комментарием
qa-agent stage rerun --run-id <run-id> --stage intake_requirements --comment "Добавьте больше деталей"}`}
        />
      </div>

      {/* 10. CLI Usage */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Terminal size={20} className="text-emerald-400" />
          10. Использование CLI
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Подготовка тестовых требований:</h4>
            <CodeBlock
              title="Создание тестовых файлов"
              language="bash"
              code={`# Создание директорий
mkdir -p requirements/current
mkdir -p requirements/baseline

# Создание примера требований (новая версия)
cat > requirements/current/requirements.md << 'EOF'
# Требования к системе

## Функция 1: Фильтр по статусу
Пользователь может фильтровать список по статусу.

## Функция 2: Пустое состояние
При отсутствии данных показывать сообщение "Нет данных".

## Функция 3: Сортировка
Список можно сортировать по дате создания.
EOF

# Создание примера требований (старая версия)
cat > requirements/baseline/requirements.md << 'EOF'
# Требования к системе

## Функция 1: Сортировка
Список можно сортировать по дате создания.
EOF

# Проверка
ls -la requirements/current/
ls -la requirements/baseline/`}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Запуск полного пайплайна:</h4>
            <CodeBlock
              title="Полный цикл работы"
              language="bash"
              code={`# 1. Запуск пайплайна
qa-agent run --current ./requirements/current --baseline ./requirements/baseline

# Система выполнит этап 1 (intake) и остановится
# Выведет run_id, например: abc123-def456-ghi789

# 2. Просмотр результата этапа 1
qa-agent stage show --run-id abc123-def456-ghi789 --stage intake_requirements

# 3. Подтверждение этапа 1
qa-agent stage approve --run-id abc123-def456-ghi789 --stage intake_requirements

# 4. Система автоматически перейдет к этапу 2 (compare)
# Просмотр результата
qa-agent stage show --run-id abc123-def456-ghi789 --stage compare_requirements

# 5. Подтверждение дельты (этап 3)
qa-agent stage approve --run-id abc123-def456-ghi789 --stage confirm_delta

# 6. Продолжение до этапа 6 (checklist)
# ... повторяем для всех этапов

# 7. Просмотр финального отчета
qa-agent run show --run-id abc123-def456-ghi789`}
            />
          </div>
        </div>
      </div>

      {/* 11. Docker */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package size={20} className="text-emerald-400" />
          11. Запуск через Docker
        </h3>
        
        <CodeBlock
          title="Запуск через Docker Compose"
          language="bash"
          code={`# Сборка и запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f app

# Остановка
docker-compose down

# Пересборка после изменений
docker-compose up -d --build`}
        />

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">docker-compose.yml:</h4>
          <CodeBlock
            title="docker-compose.yml"
            language="yaml"
            code={`version: "3.8"

services:
  app:
    build: .
    env_file: .env
    volumes:
      - ./workspace:/app/workspace
      - ./requirements:/app/requirements
    depends_on:
      - db
    command: python main.py
    stdin_open: true  # Для интерактивного CLI
    tty: true

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
  pgdata:`}
          />
        </div>
      </div>

      {/* 12. Testing */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-emerald-400" />
          12. Тестирование
        </h3>
        <CodeBlock
          title="Запуск тестов"
          language="bash"
          code={`# Установка тестовых зависимостей
pip install pytest pytest-cov pytest-asyncio

# Запуск всех тестов
pytest

# Запуск с покрытием
pytest --cov=. --cov-report=html

# Запуск конкретного теста
pytest tests/test_parsers.py

# Запуск с подробным выводом
pytest -v

# Просмотр отчета о покрытии
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux`}
        />
      </div>

      {/* 13. Troubleshooting */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-amber-400" />
          13. Решение проблем
        </h3>
        
        <div className="space-y-4">
          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Ошибка: "Connection refused" при подключении к PostgreSQL</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong className="text-gray-300">Причина:</strong> PostgreSQL не запущен или недоступен.</p>
              <p><strong className="text-gray-300">Решение:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• Проверьте, что PostgreSQL запущен: <code className="text-cyan-400">sudo systemctl status postgresql</code></li>
                <li>• Запустите: <code className="text-cyan-400">sudo systemctl start postgresql</code></li>
                <li>• Проверьте DATABASE_URL в .env</li>
                <li>• Для Docker: <code className="text-cyan-400">docker ps | grep postgres</code></li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Ошибка: "ModuleNotFoundError"</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong className="text-gray-300">Причина:</strong> Зависимости не установлены или venv не активирован.</p>
              <p><strong className="text-gray-300">Решение:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• Активируйте venv: <code className="text-cyan-400">source venv/bin/activate</code></li>
                <li>• Переустановите: <code className="text-cyan-400">pip install -e .</code></li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Ошибка: "LLM API timeout" или "Invalid API key"</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong className="text-gray-300">Причина:</strong> Проблема с API-ключом или сетью.</p>
              <p><strong className="text-gray-300">Решение:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• Проверьте OPENAI_API_KEY в .env</li>
                <li>• Проверьте OPENAI_BASE_URL</li>
                <li>• Увеличьте LLM_TIMEOUT в .env</li>
                <li>• Проверьте доступ к API: <code className="text-cyan-400">curl $OPENAI_BASE_URL/models</code></li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Ошибка: "Alembic migration failed"</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong className="text-gray-300">Причина:</strong> База данных в неконсистентном состоянии.</p>
              <p><strong className="text-gray-300">Решение:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• Проверьте статус: <code className="text-cyan-400">alembic current</code></li>
                <li>• Откатите: <code className="text-cyan-400">alembic downgrade base</code></li>
                <li>• Примените заново: <code className="text-cyan-400">alembic upgrade head</code></li>
              </ul>
            </div>
          </div>

          <div className="border border-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-400 mb-2">Ошибка: "Permission denied" при создании workspace</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong className="text-gray-300">Причина:</strong> Нет прав на запись в директорию.</p>
              <p><strong className="text-gray-300">Решение:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• Создайте директорию: <code className="text-cyan-400">mkdir -p workspace</code></li>
                <li>• Измените права: <code className="text-cyan-400">chmod 755 workspace</code></li>
                <li>• Или измените WORKSPACE_PATH в .env</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 14. PyCharm Debug */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings size={20} className="text-emerald-400" />
          14. Отладка в PyCharm
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.1. Открытие проекта в PyCharm</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Откройте PyCharm Professional Edition (Community Edition не поддерживает отладку Python)</li>
                <li>File → Open → выберите директорию <code className="text-cyan-400">qa-agent-mvp</code></li>
                <li>Дождитесь индексации проекта</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.2. Настройка Python интерпретатора</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <ol className="space-y-2 ml-4 list-decimal">
                <li>PyCharm → Settings (Ctrl+Alt+S) → Project: qa-agent-mvp → Python Interpreter</li>
                <li>Нажмите шестерёнку → Add Interpreter → Add Local Interpreter</li>
                <li>Выберите "Virtualenv Environment"</li>
                <li>Выберите "Existing environment"</li>
                <li>Укажите путь: <code className="text-cyan-400">./venv/bin/python</code> (Linux/macOS) или <code className="text-cyan-400">.\venv\Scripts\python.exe</code> (Windows)</li>
                <li>Нажмите OK</li>
              </ol>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-3">
              <div className="text-xs text-gray-300">
                <strong className="text-blue-400">Совет:</strong> PyCharm автоматически обнаружит venv, если он находится в корне проекта.
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.3. Установка необходимых плагинов</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p>Убедитесь, что установлены следующие плагины:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong className="text-gray-200">Python</strong> — базовая поддержка Python (обычно предустановлен)</li>
                <li>• <strong className="text-gray-200">EnvFile</strong> — поддержка .env файлов (опционально, но рекомендуется)</li>
                <li>• <strong className="text-gray-200">Database Navigator</strong> — для работы с PostgreSQL (опционально)</li>
              </ul>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              <p>Установка плагинов: Settings → Plugins → Marketplace → поиск → Install</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.4. Создание Run Configuration для main.py</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Run → Edit Configurations (или Shift+Alt+F10 → Edit Configurations)</li>
                <li>Нажмите "+" → Python</li>
                <li>Заполните поля:
                  <ul className="space-y-1 ml-4 mt-1">
                    <li>• <strong className="text-gray-200">Name:</strong> <code className="text-cyan-400">QA Agent - Main</code></li>
                    <li>• <strong className="text-gray-200">Script path:</strong> <code className="text-cyan-400">main.py</code></li>
                    <li>• <strong className="text-gray-200">Working directory:</strong> <code className="text-cyan-400">$PROJECT_FILE_DIR$</code></li>
                    <li>• <strong className="text-gray-200">Python interpreter:</strong> выберите ваш venv</li>
                  </ul>
                </li>
                <li>В разделе "Environment variables" нажмите на иконку папки и выберите ваш <code className="text-cyan-400">.env</code> файл</li>
                <li>Нажмите Apply → OK</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.5. Создание Run Configuration для CLI</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Run → Edit Configurations → "+" → Python</li>
                <li>Заполните поля:
                  <ul className="space-y-1 ml-4 mt-1">
                    <li>• <strong className="text-gray-200">Name:</strong> <code className="text-cyan-400">QA Agent - CLI</code></li>
                    <li>• <strong className="text-gray-200">Module name:</strong> <code className="text-cyan-400">qa_agent.cli.main</code></li>
                    <li>• <strong className="text-gray-200">Parameters:</strong> <code className="text-cyan-400">run --current ./requirements/current --baseline ./requirements/baseline</code></li>
                    <li>• <strong className="text-gray-200">Working directory:</strong> <code className="text-cyan-400">$PROJECT_FILE_DIR$</code></li>
                  </ul>
                </li>
                <li>Добавьте переменные окружения из .env</li>
                <li>Нажмите Apply → OK</li>
              </ol>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
              <div className="text-xs text-gray-300">
                <strong className="text-amber-400">Важно:</strong> Для интерактивного CLI добавьте в конфигурацию: "Modify options" → "Emulate terminal in output console"
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.6. Создание Run Configuration для pytest</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <ol className="space-y-2 ml-4 list-decimal">
                <li>Run → Edit Configurations → "+" → pytest</li>
                <li>Заполните поля:
                  <ul className="space-y-1 ml-4 mt-1">
                    <li>• <strong className="text-gray-200">Name:</strong> <code className="text-cyan-400">QA Agent - Tests</code></li>
                    <li>• <strong className="text-gray-200">Target:</strong> <code className="text-cyan-400">tests/</code></li>
                    <li>• <strong className="text-gray-200">Working directory:</strong> <code className="text-cyan-400">$PROJECT_FILE_DIR$</code></li>
                    <li>• <strong className="text-gray-200">Additional Arguments:</strong> <code className="text-cyan-400">-v --tb=short</code></li>
                  </ul>
                </li>
                <li>Добавьте переменные окружения из .env</li>
                <li>Нажмите Apply → OK</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.7. Использование отладчика</h4>
            <div className="text-sm text-gray-400 space-y-3">
              <div>
                <p className="mb-2"><strong className="text-gray-200">Установка breakpoints:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• Кликните на номер строки слева от кода — появится красный кружок</li>
                  <li>• Или нажмите <code className="text-cyan-400">Ctrl+F8</code> (Cmd+F8 на Mac)</li>
                  <li>• Для условного breakpoint: правый клик на breakpoint → Condition</li>
                </ul>
              </div>

              <div>
                <p className="mb-2"><strong className="text-gray-200">Запуск в режиме отладки:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• Выберите конфигурацию в верхнем правом углу</li>
                  <li>• Нажмите <code className="text-cyan-400">Shift+F9</code> (Debug) вместо <code className="text-cyan-400">Shift+F10</code> (Run)</li>
                  <li>• Или нажмите на иконку жука 🐞</li>
                </ul>
              </div>

              <div>
                <p className="mb-2"><strong className="text-gray-200">Управление отладкой:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• <code className="text-cyan-400">F8</code> — Step Over (перейти к следующей строке)</li>
                  <li>• <code className="text-cyan-400">F7</code> — Step Into (войти в функцию)</li>
                  <li>• <code className="text-cyan-400">Shift+F8</code> — Step Out (выйти из функции)</li>
                  <li>• <code className="text-cyan-400">Alt+F9</code> — Run to Cursor (выполнить до курсора)</li>
                  <li>• <code className="text-cyan-400">F9</code> — Resume Program (продолжить выполнение)</li>
                </ul>
              </div>

              <div>
                <p className="mb-2"><strong className="text-gray-200">Просмотр переменных:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• Панель "Variables" показывает текущие значения переменных</li>
                  <li>• Наведите курсор на переменную в коде — появится всплывающая подсказка</li>
                  <li>• Используйте "Watches" для отслеживания конкретных выражений</li>
                  <li>• "Evaluate Expression" (<code className="text-cyan-400">Alt+F8</code>) для выполнения произвольного кода</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.8. Отладка агентов</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p>Рекомендуемые точки для установки breakpoints:</p>
              <ul className="space-y-1 ml-4">
                <li>• <code className="text-cyan-400">agents/requirement_intake_agent.py</code> — метод <code className="text-cyan-400">run()</code></li>
                <li>• <code className="text-cyan-400">agents/requirement_diff_agent.py</code> — метод <code className="text-cyan-400">compare()</code></li>
                <li>• <code className="text-cyan-400">llm/client.py</code> — метод <code className="text-cyan-400">complete()</code> для отладки вызовов LLM</li>
                <li>• <code className="text-cyan-400">graph/nodes.py</code> — функции узлов графа</li>
                <li>• <code className="text-cyan-400">human/stage_gate.py</code> — метод <code className="text-cyan-400">can_proceed()</code></li>
              </ul>
            </div>
            <CodeBlock
              title="Пример: отладка LLM вызова"
              language="python"
              code={`# В llm/client.py добавьте breakpoint:

async def complete(self, prompt: str) -> str:
    # Breakpoint здесь для просмотра промпта
    import breakpoint; breakpoint()  # или установите через UI
    
    response = await self.client.chat.completions.create(
        model=self.config.model,
        messages=[{"role": "user", "content": prompt}],
        temperature=self.config.temperature,
    )
    
    # Breakpoint здесь для просмотра ответа
    result = response.choices[0].message.content
    return result`}
            />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.9. Полезные советы</h4>
            <div className="text-sm text-gray-400 space-y-3">
              <div className="border border-gray-700/50 rounded-lg p-3">
                <p className="mb-1"><strong className="text-gray-200">💡 Горячие клавиши:</strong></p>
                <ul className="space-y-1 ml-4 text-xs">
                  <li>• <code className="text-cyan-400">Ctrl+Shift+F10</code> — запустить текущий файл</li>
                  <li>• <code className="text-cyan-400">Ctrl+Shift+F9</code> — отладка текущего файла</li>
                  <li>• <code className="text-cyan-400">Alt+Shift+F10</code> — выбор конфигурации запуска</li>
                  <li>• <code className="text-cyan-400">Ctrl+Alt+L</code> — форматирование кода</li>
                  <li>• <code className="text-cyan-400">Ctrl+D</code> — дублировать строку</li>
                  <li>• <code className="text-cyan-400">Ctrl+/</code> — комментировать/раскомментировать</li>
                </ul>
              </div>

              <div className="border border-gray-700/50 rounded-lg p-3">
                <p className="mb-1"><strong className="text-gray-200">💡 Отладка с .env файлом:</strong></p>
                <p className="text-xs">Если установили плагин EnvFile, можете использовать:</p>
                <ul className="space-y-1 ml-4 text-xs mt-1">
                  <li>• Run Configuration → "EnvFile" tab → Enable EnvFile</li>
                  <li>• Добавьте ваш <code className="text-cyan-400">.env</code> файл</li>
                  <li>• Переменные автоматически загрузятся при запуске</li>
                </ul>
              </div>

              <div className="border border-gray-700/50 rounded-lg p-3">
                <p className="mb-1"><strong className="text-gray-200">💡 Отладка PostgreSQL:</strong></p>
                <p className="text-xs">Для отладки SQL запросов:</p>
                <ul className="space-y-1 ml-4 text-xs mt-1">
                  <li>• В <code className="text-cyan-400">.env</code> установите <code className="text-cyan-400">DB_ECHO=true</code></li>
                  <li>• SQLAlchemy будет логировать все SQL запросы в консоль</li>
                  <li>• Используйте Database Navigator для просмотра данных</li>
                </ul>
              </div>

              <div className="border border-gray-700/50 rounded-lg p-3">
                <p className="mb-1"><strong className="text-gray-200">💡 Профилирование:</strong></p>
                <p className="text-xs">Для анализа производительности:</p>
                <ul className="space-y-1 ml-4 text-xs mt-1">
                  <li>• Run → Profile (или Shift+Alt+F6)</li>
                  <li>• Выберите конфигурацию</li>
                  <li>• PyCharm покажет время выполнения функций</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">14.10. Пример конфигурации .run/qa_agent_cli.run.xml</h4>
            <CodeBlock
              title=".run/qa_agent_cli.run.xml"
              language="xml"
              code={`<component name="ProjectRunConfigurationManager">
  <configuration name="QA Agent - CLI" type="PythonConfigurationType" 
               factoryName="Python">
    <module name="qa-agent-mvp" />
    <option name="INTERPRETER_OPTIONS" value="" />
    <option name="PARENT_ENVS" value="true" />
    <envs>
      <env name="PYTHONUNBUFFERED" value="1" />
    </envs>
    <option name="SDK_HOME" value="$PROJECT_DIR$/venv/bin/python" />
    <option name="WORKING_DIRECTORY" value="$PROJECT_DIR$" />
    <option name="IS_MODULE_SDK_INHERITED" value="false" />
    <option name="ADD_CONTENT_ROOTS" value="true" />
    <option name="ADD_SOURCE_ROOTS" value="true" />
    <option name="SCRIPT_NAME" value="qa_agent.cli.main" />
    <option name="PARAMETERS" value="run --current ./requirements/current" />
    <option name="SHOW_COMMAND_LINE" value="false" />
    <option name="EMULATE_TERMINAL" value="true" />
    <option name="MODULE_MODE" value="true" />
  </configuration>
</component>`}
            />
          </div>
        </div>
      </div>

      {/* Quick Start Summary */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🚀 Быстрый старт (TL;DR)</h3>
        <CodeBlock
          title="Все команды в одном месте"
          language="bash"
          code={`# 1. Клонирование
git clone https://github.com/your-org/qa-agent-mvp.git
cd qa-agent-mvp

# 2. Виртуальное окружение
python3.11 -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\\Scripts\\activate  # Windows

# 3. Установка зависимостей
pip install -e .

# 4. PostgreSQL (Docker)
docker run -d --name qa-postgres -e POSTGRES_USER=qa_agent -e POSTGRES_PASSWORD=qa_agent -e POSTGRES_DB=qa_agent -p 5432:5432 postgres:15

# 5. Конфигурация
cp .env.example .env
# Отредактируйте .env (добавьте OPENAI_API_KEY)

# 6. Инициализация БД
alembic upgrade head

# 7. Запуск
qa-agent run --current ./requirements/current --baseline ./requirements/baseline

# 8. Тесты
pytest`}
        />
      </div>
    </div>
  );
}
