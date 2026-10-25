import { useState } from 'react';
import { Folder, File, ChevronDown, ChevronRight } from 'lucide-react';

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  description?: string;
  children?: TreeNode[];
}

const projectTree: TreeNode = {
  name: 'qa-agent-mvp/',
  type: 'folder',
  children: [
    { name: 'main.py', type: 'file', description: 'Точка входа' },
    { name: 'config.py', type: 'file', description: 'Конфигурация (pydantic-settings)' },
    { name: 'pyproject.toml', type: 'file', description: 'Зависимости проекта' },
    { name: '.env.example', type: 'file', description: 'Пример переменных окружения' },
    { name: 'Dockerfile', type: 'file', description: 'Docker образ' },
    { name: 'docker-compose.yml', type: 'file', description: 'PostgreSQL + приложение' },
    { name: 'README.md', type: 'file', description: 'Документация' },
    {
      name: 'schemas/', type: 'folder', description: 'Pydantic-схемы',
      children: [
        { name: 'run.py', type: 'file', description: 'Схема запуска' },
        { name: 'stage_state.py', type: 'file', description: 'Состояние этапа' },
        { name: 'human_review.py', type: 'file', description: 'Решение человека' },
        { name: 'rationale.py', type: 'file', description: 'Объяснение результата' },
        { name: 'requirement_version.py', type: 'file', description: 'Версия требований' },
        { name: 'requirement_delta.py', type: 'file', description: 'Дельта изменений' },
        { name: 'analysis_report.py', type: 'file', description: 'Отчет анализа' },
        { name: 'mindmap.py', type: 'file', description: 'Mind-map' },
        { name: 'checklist.py', type: 'file', description: 'Чек-лист' },
      ],
    },
    {
      name: 'agents/', type: 'folder', description: 'Агенты этапов',
      children: [
        { name: 'requirement_intake_agent.py', type: 'file', description: 'Прием требований' },
        { name: 'requirement_diff_agent.py', type: 'file', description: 'Сравнение версий' },
        { name: 'requirement_analysis_agent.py', type: 'file', description: 'Анализ требований' },
        { name: 'mindmap_agent.py', type: 'file', description: 'Формирование mind-map' },
        { name: 'checklist_agent.py', type: 'file', description: 'Формирование чек-листа' },
      ],
    },
    {
      name: 'graph/', type: 'folder', description: 'LangGraph оркестрация',
      children: [
        { name: 'state.py', type: 'file', description: 'GraphState — состояние графа' },
        { name: 'nodes.py', type: 'file', description: 'Узлы графа' },
        { name: 'edges.py', type: 'file', description: 'Рёбра и условия' },
        { name: 'pipeline.py', type: 'file', description: 'Сборка графа' },
      ],
    },
    {
      name: 'parsers/', type: 'folder', description: 'Парсеры файлов',
      children: [
        { name: 'base.py', type: 'file', description: 'Базовый интерфейс парсера' },
        { name: 'txt_parser.py', type: 'file', description: 'Парсер .txt' },
        { name: 'markdown_parser.py', type: 'file', description: 'Парсер .md' },
        { name: 'json_parser.py', type: 'file', description: 'Парсер .json' },
        { name: 'yaml_parser.py', type: 'file', description: 'Парсер .yaml/.yml' },
        { name: 'csv_parser.py', type: 'file', description: 'Парсер .csv' },
        { name: 'docx_parser.py', type: 'file', description: 'Парсер .docx' },
        { name: 'excel_parser.py', type: 'file', description: 'Парсер .xlsx' },
      ],
    },
    {
      name: 'human/', type: 'folder', description: 'Human-in-the-loop',
      children: [
        { name: 'review_service.py', type: 'file', description: 'Сервис подтверждения' },
        { name: 'stage_gate.py', type: 'file', description: 'Контроль переходов' },
        { name: 'history_store.py', type: 'file', description: 'Хранилище истории' },
      ],
    },
    {
      name: 'llm/', type: 'folder', description: 'LLM клиент',
      children: [
        { name: 'client.py', type: 'file', description: 'OpenAI-compatible клиент' },
        { name: 'prompts.py', type: 'file', description: 'Шаблоны промптов' },
        { name: 'json_parser.py', type: 'file', description: 'Парсинг JSON от LLM' },
      ],
    },
    {
      name: 'db/', type: 'folder', description: 'База данных',
      children: [
        { name: 'models.py', type: 'file', description: 'SQLAlchemy модели' },
        { name: 'session.py', type: 'file', description: 'Сессии и подключение' },
        { name: 'repository.py', type: 'file', description: 'Репозиторий данных' },
        {
          name: 'migrations/', type: 'folder', description: 'Alembic миграции',
          children: [
            { name: 'env.py', type: 'file', description: 'Alembic env' },
            { name: 'versions/', type: 'folder', description: 'Версии миграций' },
          ],
        },
      ],
    },
    {
      name: 'services/', type: 'folder', description: 'Бизнес-сервисы',
      children: [
        { name: 'requirement_snapshot_service.py', type: 'file', description: 'Снимки требований' },
        { name: 'rationale_service.py', type: 'file', description: 'Объяснимость' },
        { name: 'markdown_service.py', type: 'file', description: 'Генерация Markdown' },
        { name: 'report_service.py', type: 'file', description: 'Формирование отчетов' },
      ],
    },
    {
      name: 'cli/', type: 'folder', description: 'CLI интерфейс',
      children: [
        { name: 'main.py', type: 'file', description: 'Команды CLI (Typer)' },
      ],
    },
    {
      name: 'workspace/', type: 'folder', description: 'Файловое хранилище артефактов',
      children: [
        {
          name: 'runs/', type: 'folder', description: 'Запуски',
          children: [
            {
              name: '{run_id}/', type: 'folder', description: 'Конкретный запуск',
              children: [
                { name: 'input/current/', type: 'folder', description: 'Новая версия' },
                { name: 'input/baseline/', type: 'folder', description: 'Старая версия' },
                { name: 'artifacts/', type: 'folder', description: 'Результаты (JSON + MD)' },
                { name: 'rationale/', type: 'folder', description: 'Объяснения этапов' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'tests/', type: 'folder', description: 'Тесты (pytest)',
      children: [
        { name: 'test_parsers.py', type: 'file', description: 'Тесты парсеров' },
        { name: 'test_requirement_diff.py', type: 'file', description: 'Тесты дельты' },
        { name: 'test_stage_gate.py', type: 'file', description: 'Тесты stage gate' },
        { name: 'test_repository.py', type: 'file', description: 'Тесты репозитория' },
        { name: 'test_pipeline_smoke.py', type: 'file', description: 'Smoke-тесты пайплайна' },
      ],
    },
  ],
};

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.type === 'file') {
    return (
      <div className="flex items-center gap-2 py-1 hover:bg-gray-800/50 rounded px-2" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
        <File size={14} className="text-gray-500 flex-shrink-0" />
        <span className="font-mono text-sm text-gray-300">{node.name}</span>
        {node.description && <span className="text-xs text-gray-500 ml-2">— {node.description}</span>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1 hover:bg-gray-800/50 rounded px-2 w-full text-left"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        <Folder size={14} className="text-amber-400 flex-shrink-0" />
        <span className="font-mono text-sm text-amber-300 font-medium">{node.name}</span>
        {node.description && <span className="text-xs text-gray-500 ml-2">— {node.description}</span>}
      </button>
      {isOpen && node.children && (
        <div>
          {node.children.map((child, i) => (
            <TreeItem key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectStructure() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Структура проекта</h2>
        <p className="text-gray-400">
          Полная структура MVP с описанием каждого файла и директории.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">
        <TreeItem node={projectTree} />
      </div>

      {/* Key Files */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ключевые файлы</h3>
        <div className="space-y-4">
          {[
            {
              file: 'graph/state.py',
              desc: 'Определяет GraphState — TypedDict с полями для всех этапов. Используется LangGraph для передачи состояния между узлами.',
              code: `class GraphState(TypedDict):
    run_id: str
    current_requirements: RequirementVersion | None
    baseline_requirements: RequirementVersion | None
    delta: RequirementDelta | None
    delta_approved: bool
    analysis: AnalysisReport | None
    mindmap: MindMap | None
    checklist: Checklist | None
    current_stage: str
    stage_states: dict[str, StageState]
    human_reviews: list[HumanReview]
    errors: list[str]`,
            },
            {
              file: 'graph/pipeline.py',
              desc: 'Сборка LangGraph графа с узлами и условными рёбрами. После каждого продуктивного узла — переход в waiting_for_human.',
              code: `def build_pipeline() -> StateGraph:
    graph = StateGraph(GraphState)
    graph.add_node("intake", intake_requirements)
    graph.add_node("compare", compare_requirements)
    graph.add_node("confirm", confirm_delta)
    graph.add_node("analyze", analyze_requirements)
    graph.add_node("mindmap", generate_mindmap)
    graph.add_node("checklist", generate_checklist)
    graph.add_node("finalize", finalize_mvp)
    # edges with human gate...
    return graph.compile()`,
            },
            {
              file: 'human/stage_gate.py',
              desc: 'Контроль переходов между этапами. Запрещает автоматический переход без подтверждения человека.',
              code: `class StageGate:
    def can_proceed(self, run_id: str, stage: str) -> bool:
        state = self.repo.get_stage_state(run_id, stage)
        return state.status == "approved"
    
    def request_review(self, run_id: str, stage: str):
        self.repo.update_stage_status(
            run_id, stage, "waiting_for_human"
        )`,
            },
          ].map((item) => (
            <div key={item.file} className="border border-gray-700/50 rounded-lg overflow-hidden">
              <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50">
                <span className="font-mono text-sm text-emerald-400">{item.file}</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-3">{item.desc}</p>
                <pre className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto font-mono">
                  {item.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
