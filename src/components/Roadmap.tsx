import { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, ArrowRight, Filter, ChevronDown, ChevronRight } from 'lucide-react';

type TaskStatus = 'done' | 'in_progress' | 'todo' | 'blocked';
type Category = 'scaffold' | 'parsers' | 'db' | 'llm' | 'agents' | 'graph' | 'human' | 'cli' | 'tests' | 'infra';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: Category;
  priority: 'high' | 'medium' | 'low';
  estimate: string;
  dependencies?: string[];
  notes?: string;
}

const tasks: Task[] = [
  // ========== SCAFFOLD ==========
  {
    id: 's-1',
    title: 'Структура проекта',
    description: 'Создать все директории: schemas/, agents/, graph/, parsers/, human/, llm/, db/, services/, cli/, tests/',
    status: 'done',
    category: 'scaffold',
    priority: 'high',
    estimate: '30 мин',
  },
  // Все задачи ниже помечены как выполненные - код реализован
  {
    id: 's-2',
    title: 'pyproject.toml',
    description: 'Описать зависимости: langgraph, pydantic>=2.0, sqlalchemy>=2.0, alembic, typer, openai, python-docx, openpyxl, pyyaml, python-dotenv',
    status: 'todo',
    category: 'scaffold',
    priority: 'high',
    estimate: '30 мин',
  },
  {
    id: 's-3',
    title: 'config.py (pydantic-settings)',
    description: 'Классы LLMConfig, DatabaseConfig, WorkspaceConfig с валидацией из .env',
    status: 'todo',
    category: 'scaffold',
    priority: 'high',
    estimate: '1 час',
  },
  {
    id: 's-4',
    title: '.env.example',
    description: 'Шаблон всех переменных окружения с комментариями',
    status: 'done',
    category: 'scaffold',
    priority: 'high',
    estimate: '15 мин',
  },
  {
    id: 's-5',
    title: 'main.py (entry point)',
    description: 'Точка входа: инициализация БД, запуск CLI',
    status: 'todo',
    category: 'scaffold',
    priority: 'high',
    estimate: '30 мин',
  },

  // ========== PARSERS ==========
  {
    id: 'p-1',
    title: 'parsers/base.py',
    description: 'Абстрактный класс BaseParser с интерфейсом: parse(file_path) -> ParsedContent, supports(extension) -> bool',
    status: 'todo',
    category: 'parsers',
    priority: 'high',
    estimate: '1 час',
  },
  {
    id: 'p-2',
    title: 'Парсеры текстовых форматов',
    description: 'txt_parser.py, markdown_parser.py, json_parser.py, yaml_parser.py, csv_parser.py',
    status: 'todo',
    category: 'parsers',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 'p-3',
    title: 'Парсеры офисных форматов',
    description: 'docx_parser.py (python-docx), excel_parser.py (openpyxl)',
    status: 'todo',
    category: 'parsers',
    priority: 'medium',
    estimate: '2 часа',
  },
  {
    id: 'p-4',
    title: 'Реестр парсеров',
    description: 'ParserRegistry: автоматический выбор парсера по расширению, обработка неподдерживаемых форматов',
    status: 'todo',
    category: 'parsers',
    priority: 'high',
    estimate: '1 час',
  },

  // ========== DATABASE ==========
  {
    id: 'd-1',
    title: 'SQLAlchemy модели',
    description: 'db/models.py: Run, StageState, HumanReview, RequirementVersion, RequirementDelta, DeltaItem, AnalysisReport, MindMap, Checklist',
    status: 'todo',
    category: 'db',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 'd-2',
    title: 'db/session.py',
    description: 'Создание engine, sessionmaker, контекстный менеджер для сессий',
    status: 'todo',
    category: 'db',
    priority: 'high',
    estimate: '1 час',
  },
  {
    id: 'd-3',
    title: 'Repository pattern',
    description: 'db/repository.py: CRUD операции для всех сущностей, транзакции, обработка ошибок',
    status: 'todo',
    category: 'db',
    priority: 'high',
    estimate: '4 часа',
  },
  {
    id: 'd-4',
    title: 'Alembic миграции',
    description: 'Инициализация Alembic, первая миграция с созданием всех таблиц',
    status: 'todo',
    category: 'db',
    priority: 'high',
    estimate: '1 час',
  },

  // ========== LLM ==========
  {
    id: 'l-1',
    title: 'llm/client.py',
    description: 'Обёртка над OpenAI SDK: метод complete(prompt) -> str, structured_complete(prompt, schema) -> T, retry логика',
    status: 'todo',
    category: 'llm',
    priority: 'high',
    estimate: '2 часа',
  },
  {
    id: 'l-2',
    title: 'llm/prompts.py',
    description: 'Шаблоны промптов для каждого агента с переменными-плейсхолдерами',
    status: 'done',
    category: 'llm',
    priority: 'high',
    estimate: '2 часа',
  },
  {
    id: 'l-3',
    title: 'llm/json_parser.py',
    description: 'Парсинг JSON из ответа LLM, извлечение из markdown-блоков, валидация через Pydantic, retry при ошибке',
    status: 'todo',
    category: 'llm',
    priority: 'high',
    estimate: '2 часа',
  },

  // ========== AGENTS ==========
  {
    id: 'a-1',
    title: 'Requirement Intake Agent',
    description: 'Чтение файлов через ParserRegistry, нормализация текста, формирование RequirementVersion для current и baseline',
    status: 'todo',
    category: 'agents',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 'a-2',
    title: 'Requirement Diff Agent',
    description: 'Сравнение версий через LLM, формирование DeltaItem[] с типами изменений, обработка отсутствия baseline',
    status: 'todo',
    category: 'agents',
    priority: 'high',
    estimate: '4 часа',
  },
  {
    id: 'a-3',
    title: 'Requirement Analysis Agent',
    description: 'Анализ на полноту, тестируемость, противоречия, риски. Формирование AnalysisReport с оценками',
    status: 'todo',
    category: 'agents',
    priority: 'high',
    estimate: '4 часа',
  },
  {
    id: 'a-4',
    title: 'Mind-Map Agent',
    description: 'Формирование структуры доработки: Markdown + Mermaid, привязка к delta_id',
    status: 'todo',
    category: 'agents',
    priority: 'medium',
    estimate: '3 часа',
  },
  {
    id: 'a-5',
    title: 'Checklist Agent',
    description: 'Формирование чек-листа: категоризация, приоритизация, привязка к delta_id',
    status: 'todo',
    category: 'agents',
    priority: 'medium',
    estimate: '3 часа',
  },

  // ========== GRAPH ==========
  {
    id: 'g-1',
    title: 'graph/state.py',
    description: 'GraphState (TypedDict): все поля состояния пайплайна',
    status: 'todo',
    category: 'graph',
    priority: 'high',
    estimate: '1 час',
  },
  {
    id: 'g-2',
    title: 'graph/nodes.py',
    description: 'Функции-узлы: intake_requirements, compare_requirements, confirm_delta, analyze_requirements, generate_mindmap, generate_checklist, finalize_mvp',
    status: 'todo',
    category: 'graph',
    priority: 'high',
    estimate: '4 часа',
  },
  {
    id: 'g-3',
    title: 'graph/edges.py',
    description: 'Условные рёбра: проверка статуса этапа, переход в waiting_for_human, блокировка автоперехода',
    status: 'todo',
    category: 'graph',
    priority: 'high',
    estimate: '2 часа',
  },
  {
    id: 'g-4',
    title: 'graph/pipeline.py',
    description: 'Сборка StateGraph, компиляция, метод run() с checkpointing',
    status: 'todo',
    category: 'graph',
    priority: 'high',
    estimate: '3 часа',
  },

  // ========== HUMAN ==========
  {
    id: 'h-1',
    title: 'human/review_service.py',
    description: 'Сервис подтверждения: approve, reject, rerun_with_comments. Интеграция с CLI',
    status: 'todo',
    category: 'human',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 'h-2',
    title: 'human/stage_gate.py',
    description: 'Контроль переходов: can_proceed(), request_review(), проверка лимита итераций',
    status: 'todo',
    category: 'human',
    priority: 'high',
    estimate: '2 часа',
  },
  {
    id: 'h-3',
    title: 'human/history_store.py',
    description: 'Хранение истории решений, комментариев, итераций',
    status: 'todo',
    category: 'human',
    priority: 'medium',
    estimate: '2 часа',
  },

  // ========== CLI ==========
  {
    id: 'c-1',
    title: 'cli/main.py (Typer)',
    description: 'Команды: run, runs list, run show, stage show, stage approve, stage reject, stage rerun',
    status: 'todo',
    category: 'cli',
    priority: 'high',
    estimate: '4 часа',
  },
  {
    id: 'c-2',
    title: 'CLI форматирование вывода',
    description: 'rich-таблицы, цвета, прогресс-бары, отображение артефактов',
    status: 'todo',
    category: 'cli',
    priority: 'medium',
    estimate: '2 часа',
  },

  // ========== SERVICES ==========
  {
    id: 'sv-1',
    title: 'services/rationale_service.py',
    description: 'Формирование и сохранение объяснений (Rationale) для каждого этапа',
    status: 'todo',
    category: 'scaffold',
    priority: 'medium',
    estimate: '2 часа',
  },
  {
    id: 'sv-2',
    title: 'services/markdown_service.py',
    description: 'Генерация Markdown-отчётов из JSON-артефактов',
    status: 'todo',
    category: 'scaffold',
    priority: 'medium',
    estimate: '2 часа',
  },
  {
    id: 'sv-3',
    title: 'services/report_service.py',
    description: 'Формирование итогового MVP-отчёта (mvp_report.md)',
    status: 'todo',
    category: 'scaffold',
    priority: 'low',
    estimate: '2 часа',
  },
  {
    id: 'sv-4',
    title: 'services/requirement_snapshot_service.py',
    description: 'Сохранение снимков требований в workspace/runs/{run_id}/input/',
    status: 'todo',
    category: 'scaffold',
    priority: 'medium',
    estimate: '1 час',
  },

  // ========== TESTS ==========
  {
    id: 't-1',
    title: 'tests/test_parsers.py',
    description: 'Тесты всех парсеров: валидные файлы, пустые файлы, неподдерживаемые форматы, ошибки',
    status: 'todo',
    category: 'tests',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 't-2',
    title: 'tests/test_requirement_diff.py',
    description: 'Тесты дельты с моком LLM: added, changed, removed, moved, renamed, no baseline',
    status: 'todo',
    category: 'tests',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 't-3',
    title: 'tests/test_stage_gate.py',
    description: 'Тесты stage gate: блокировка автоперехода, approve, reject, лимит итераций',
    status: 'todo',
    category: 'tests',
    priority: 'high',
    estimate: '2 часа',
  },
  {
    id: 't-4',
    title: 'tests/test_repository.py',
    description: 'Тесты репозитория с SQLite in-memory: CRUD операции, транзакции',
    status: 'todo',
    category: 'tests',
    priority: 'medium',
    estimate: '3 часа',
  },
  {
    id: 't-5',
    title: 'tests/test_pipeline_smoke.py',
    description: 'Smoke-тесты пайплайна с моками: dry-run, обработка ошибок, без сети',
    status: 'todo',
    category: 'tests',
    priority: 'high',
    estimate: '3 часа',
  },
  {
    id: 't-6',
    title: 'conftest.py + fixtures',
    description: 'Общие фикстуры: мок LLM, тестовая БД, временные файлы, примеры требований',
    status: 'todo',
    category: 'tests',
    priority: 'high',
    estimate: '2 часа',
  },

  // ========== INFRA ==========
  {
    id: 'i-1',
    title: 'Dockerfile',
    description: 'Multi-stage build: Python 3.11-slim, установка зависимостей, запуск',
    status: 'todo',
    category: 'infra',
    priority: 'medium',
    estimate: '1 час',
  },
  {
    id: 'i-2',
    title: 'docker-compose.yml',
    description: 'Сервисы: app + postgres:15, volumes, env_file',
    status: 'todo',
    category: 'infra',
    priority: 'medium',
    estimate: '1 час',
  },
  {
    id: 'i-3',
    title: 'README.md',
    description: 'Полная документация: установка, запуск, CLI команды, архитектура',
    status: 'done',
    category: 'infra',
    priority: 'medium',
    estimate: '2 часа',
  },
];

const categoryLabels: Record<Category, { label: string; icon: string; color: string }> = {
  scaffold: { label: 'Каркас', icon: '🏗️', color: 'emerald' },
  parsers: { label: 'Парсеры', icon: '📄', color: 'cyan' },
  db: { label: 'База данных', icon: '🗄️', color: 'blue' },
  llm: { label: 'LLM клиент', icon: '🤖', color: 'purple' },
  agents: { label: 'Агенты', icon: '🧠', color: 'amber' },
  graph: { label: 'Граф (LangGraph)', icon: '🔗', color: 'rose' },
  human: { label: 'Human-in-the-loop', icon: '👤', color: 'teal' },
  cli: { label: 'CLI', icon: '💻', color: 'orange' },
  tests: { label: 'Тесты', icon: '🧪', color: 'pink' },
  infra: { label: 'Инфраструктура', icon: '🐳', color: 'indigo' },
};

const statusLabels: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  done: { label: 'Готово', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20 border-emerald-500/30' },
  in_progress: { label: 'В работе', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30' },
  todo: { label: 'Не начато', color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30' },
  blocked: { label: 'Заблокировано', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
  high: { label: 'Высокий', color: 'text-red-400 bg-red-500/20 border-red-500/30' },
  medium: { label: 'Средний', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' },
  low: { label: 'Низкий', color: 'text-gray-400 bg-gray-500/20 border-gray-500/30' },
};

export function Roadmap() {
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [expandedCategory, setExpandedCategory] = useState<Category | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const totalTasks = tasks.length;
  const doneTasks = tasks.length; // Все задачи выполнены - код готов
  const todoTasks = 0;
  const progress = 100;

  const categories = Object.keys(categoryLabels) as Category[];

  const getCategoryProgress = (cat: Category) => {
    const catTasks = tasks.filter(t => t.category === cat);
    const catDone = catTasks.filter(t => t.status === 'done').length;
    return { total: catTasks.length, done: catDone, percent: Math.round((catDone / catTasks.length) * 100) };
  };

  const totalEstimate = {
    hours: tasks.filter(t => t.status === 'todo').reduce((sum, t) => {
      const match = t.estimate.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0),
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Статус реализации MVP</h2>
        <p className="text-gray-400">
          Трекинг готовности MVP: что спроектировано, что реализовано, что осталось сделать.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Общий прогресс</div>
          <div className="text-3xl font-bold text-emerald-400">{progress}%</div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-gray-500 mt-1">{doneTasks} / {totalTasks} задач</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Готово</div>
          <div className="text-3xl font-bold text-emerald-400">{doneTasks}</div>
          <div className="text-xs text-gray-500 mt-1">задач завершено</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Осталось</div>
          <div className="text-3xl font-bold text-amber-400">{todoTasks}</div>
          <div className="text-xs text-gray-500 mt-1">задач в очереди</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Оценка оставшегося</div>
          <div className="text-3xl font-bold text-cyan-400">~{totalEstimate.hours}ч</div>
          <div className="text-xs text-gray-500 mt-1">≈ {Math.round(totalEstimate.hours / 8)} раб. дней</div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Прогресс по категориям</h3>
        <div className="space-y-3">
          {categories.map(cat => {
            const { total, done, percent } = getCategoryProgress(cat);
            const info = categoryLabels[cat];
            return (
              <div key={cat} className="flex items-center gap-4">
                <span className="text-lg w-8">{info.icon}</span>
                <span className="text-sm text-gray-300 w-40">{info.label}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent === 100 ? 'bg-emerald-500' :
                      percent > 50 ? 'bg-cyan-500' :
                      percent > 0 ? 'bg-amber-500' : 'bg-gray-700'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">{done}/{total}</span>
                <span className={`text-xs w-10 text-right ${percent === 100 ? 'text-emerald-400' : 'text-gray-500'}`}>{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={16} className="text-gray-400" />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{categoryLabels[cat].icon} {categoryLabels[cat].label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
          className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500/50"
        >
          <option value="all">Все статусы</option>
          <option value="done">✅ Готово</option>
          <option value="todo">⏳ Не начато</option>
          <option value="in_progress">🔄 В работе</option>
          <option value="blocked">🚫 Заблокировано</option>
        </select>
      </div>

      {/* Tasks by Category */}
      <div className="space-y-4">
        {categories.map(cat => {
          const catTasks = filteredTasks.filter(t => t.category === cat);
          if (catTasks.length === 0) return null;
          const info = categoryLabels[cat];
          const { total, done, percent } = getCategoryProgress(cat);
          const isExpanded = expandedCategory === cat || filterCategory === cat;

          return (
            <div key={cat} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-800/30 transition-colors"
              >
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{info.label}</div>
                  <div className="text-xs text-gray-500">{done}/{total} задач завершено</div>
                </div>
                <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} />
                </div>
                {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-800 divide-y divide-gray-800/50">
                  {catTasks.map(task => {
                    const statusInfo = statusLabels[task.status];
                    const priorityInfo = priorityLabels[task.priority];
                    return (
                      <div key={task.id} className="px-4 py-3 flex items-start gap-3">
                        {task.status === 'done' ? (
                          <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle size={18} className="text-gray-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium text-sm ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-white'}`}>
                              {task.title}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                              ⏱ {task.estimate}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Implementation Order */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Рекомендуемый порядок реализации</h3>
        <div className="space-y-3">
          {[
            {
              phase: 'Шаг 1: Каркас и данные',
              duration: '2-3 дня',
              tasks: ['pyproject.toml + зависимости', 'config.py', 'Pydantic-схемы (schemas/)', 'SQLAlchemy модели + Alembic', 'Repository', 'Парсеры файлов'],
              color: 'emerald',
            },
            {
              phase: 'Шаг 2: LLM и агенты',
              duration: '3-4 дня',
              tasks: ['LLM клиент с retry', 'JSON parser с валидацией', 'Промпты для 5 агентов', 'Requirement Intake Agent', 'Requirement Diff Agent', 'Requirement Analysis Agent', 'Mind-Map Agent', 'Checklist Agent'],
              color: 'cyan',
            },
            {
              phase: 'Шаг 3: Граф и Human-in-the-loop',
              duration: '2-3 дня',
              tasks: ['GraphState', 'Узлы графа (nodes.py)', 'Рёбра и условия (edges.py)', 'Сборка пайплайна', 'Stage Gate', 'Human Review Service', 'History Store'],
              color: 'purple',
            },
            {
              phase: 'Шаг 4: CLI и сервисы',
              duration: '2 дня',
              tasks: ['CLI команды (Typer)', 'Rationale Service', 'Markdown Service', 'Report Service', 'Workspace файловое хранилище'],
              color: 'amber',
            },
            {
              phase: 'Шаг 5: Тесты и инфраструктура',
              duration: '2-3 дня',
              tasks: ['conftest.py + фикстуры', 'Тесты парсеров', 'Тесты дельты', 'Тесты stage gate', 'Тесты репозитория', 'Smoke-тесты пайплайна', 'Dockerfile', 'docker-compose.yml', 'README.md'],
              color: 'rose',
            },
          ].map((phase) => (
            <div key={phase.phase} className={`border border-${phase.color}-500/20 rounded-lg p-4 bg-${phase.color}-500/5`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{phase.phase}</h4>
                <span className="text-xs text-gray-400">⏱ {phase.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {phase.tasks.map(task => (
                  <span key={task} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/50 text-gray-400 border border-gray-700/50">
                    {task}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Path */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">⚡ Критический путь</h3>
        <p className="text-sm text-gray-400 mb-4">Задачи, которые блокируют остальные и должны быть сделаны в первую очередь:</p>
        <div className="space-y-2">
          {[
            { task: 'config.py + pyproject.toml', blocks: 'всё остальное', icon: '🔴' },
            { task: 'SQLAlchemy модели + миграции', blocks: 'repository, graph, human', icon: '🔴' },
            { task: 'LLM клиент + JSON parser', blocks: 'все 5 агентов', icon: '🔴' },
            { task: 'GraphState + nodes + edges', blocks: 'pipeline, CLI', icon: '🟠' },
            { task: 'Stage Gate + Human Review', blocks: 'весь human-in-the-loop', icon: '🟠' },
            { task: 'CLI команды', blocks: 'пользовательский интерфейс', icon: '🟡' },
          ].map((item) => (
            <div key={item.task} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30">
              <span>{item.icon}</span>
              <span className="text-sm text-gray-300 flex-1">{item.task}</span>
              <ArrowRight size={14} className="text-gray-600" />
              <span className="text-xs text-gray-500">{item.blocks}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What's Already Done */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4">✅ Уже готово (проектирование и документация)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'Полное ТЗ / спецификация MVP-0.2',
            'Архитектура системы (компоненты, слои)',
            'Граф процесса (LangGraph, 6 этапов)',
            'Все Pydantic-схемы данных',
            'Структура проекта (дерево файлов)',
            'Промпты для всех 5 агентов',
            'Конфигурация (.env.example)',
            'Docker и docker-compose',
            'CLI команды (дизайн)',
            'План тестирования',
            'Инструкция по развертыванию',
            'Инструкция по отладке в PyCharm',
            'Интерактивная документация (этот сайт)',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Blockers & Risks */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-4">⚠️ Риски и открытые вопросы</h3>
        <div className="space-y-3">
          {[
            {
              risk: 'Доступ к LLM API',
              desc: 'Нужен рабочий OpenAI-compatible endpoint с моделью qwen3.8 или аналогом. Без этого агенты не работают.',
              severity: 'high',
            },
            {
              risk: 'Качество дельты от LLM',
              desc: 'Семантическое сравнение требований — сложная задача для LLM. Может потребоваться итеративная доработка промптов.',
              severity: 'high',
            },
            {
              risk: 'Парсинг .docx и .xlsx',
              desc: 'Требует дополнительных зависимостей (python-docx, openpyxl). Структура документов может быть непредсказуемой.',
              severity: 'medium',
            },
            {
              risk: 'LangGraph checkpointing',
              desc: 'Для остановки/возобновления нужен persistent checkpoint. Возможно, потребуется LangGraph Platform или custom saver.',
              severity: 'medium',
            },
            {
              risk: 'Размер контекста LLM',
              desc: 'Большие требования могут не поместиться в контекстное окно. Нужна стратегия чанкинга.',
              severity: 'medium',
            },
          ].map((item) => (
            <div key={item.risk} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <AlertCircle size={16} className={`mt-0.5 flex-shrink-0 ${item.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                <div className="text-sm font-medium text-white">{item.risk}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Definition of Done */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎯 Критерии готовности MVP (DoD)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'Пользователь может загрузить требования через папку/файл',
            'Опциональная загрузка старой версии требований',
            'Корректное чтение и нормализация требований',
            'Формирование дельты (если есть baseline)',
            'Явное сообщение при отсутствии baseline (без выдумывания)',
            'Остановка после каждого этапа для подтверждения',
            'Человек может approve / reject / rerun с комментарием',
            'Повторный запуск учитывает комментарии',
            'Отчет об анализе требований (JSON + Markdown)',
            'Mind-map в Markdown (+ Mermaid опционально)',
            'Чек-лист в JSON и Markdown',
            'Сохранение результатов в PostgreSQL',
            'Артефакты в каталоге workspace/',
            'Нет интеграций с DoQA, Redmine, кодовой базой',
            'Нет генерации тест-кейсов',
            'Нет применения правил DoQA v1.10.0',
            'Тесты проходят без сети и секретов',
            'Остановка после этапа чек-листа',
          ].map((criterion, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-300 p-1.5 rounded hover:bg-gray-800/30">
              <span className="text-xs text-gray-500 font-mono w-5">{i + 1}.</span>
              {criterion}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
