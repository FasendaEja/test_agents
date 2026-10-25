import { useState } from 'react';
import { CheckCircle, XCircle, Circle, Play } from 'lucide-react';

interface TestCase {
  name: string;
  module: string;
  status: 'pass' | 'fail' | 'pending';
  description: string;
}

const testCases: TestCase[] = [
  // Parser tests
  { name: 'test_txt_parser_reads_file', module: 'test_parsers', status: 'pass', description: 'Парсер .txt корректно читает файл' },
  { name: 'test_md_parser_extracts_headers', module: 'test_parsers', status: 'pass', description: 'Парсер .md извлекает заголовки и текст' },
  { name: 'test_json_parser_validates', module: 'test_parsers', status: 'pass', description: 'Парсер .json валидирует структуру' },
  { name: 'test_yaml_parser_handles_arrays', module: 'test_parsers', status: 'pass', description: 'Парсер .yaml обрабатывает массивы' },
  { name: 'test_csv_parser_delimiter', module: 'test_parsers', status: 'pass', description: 'Парсер .csv определяет разделитель' },
  { name: 'test_docx_parser_extracts_text', module: 'test_parsers', status: 'pass', description: 'Парсер .docx извлекает текст из документа' },
  { name: 'test_excel_parser_reads_sheet', module: 'test_parsers', status: 'pass', description: 'Парсер .xlsx читает первый лист' },
  { name: 'test_unsupported_format_skipped', module: 'test_parsers', status: 'pass', description: 'Неподдерживаемый формат пропускается с предупреждением' },
  { name: 'test_empty_file_skipped', module: 'test_parsers', status: 'pass', description: 'Пустой файл пропускается с предупреждением' },
  { name: 'test_parser_error_does_not_crash', module: 'test_parsers', status: 'pass', description: 'Ошибка парсинга не завершает весь процесс' },

  // Diff tests
  { name: 'test_delta_added_items', module: 'test_requirement_diff', status: 'pass', description: 'Дельта корректно определяет добавленные элементы' },
  { name: 'test_delta_changed_items', module: 'test_requirement_diff', status: 'pass', description: 'Дельта определяет изменённые элементы' },
  { name: 'test_delta_removed_items', module: 'test_requirement_diff', status: 'pass', description: 'Дельта определяет удалённые элементы' },
  { name: 'test_delta_formatting_only', module: 'test_requirement_diff', status: 'pass', description: 'Изменения только форматирования помечаются' },
  { name: 'test_delta_semantic_change', module: 'test_requirement_diff', status: 'pass', description: 'Семантические изменения определяются' },
  { name: 'test_delta_no_baseline', module: 'test_requirement_diff', status: 'pass', description: 'Без baseline все элементы — новые' },
  { name: 'test_delta_renamed_item', module: 'test_requirement_diff', status: 'pass', description: 'Переименование определяется корректно' },
  { name: 'test_delta_moved_item', module: 'test_requirement_diff', status: 'pass', description: 'Перемещение между разделами определяется' },

  // Stage gate tests
  { name: 'test_stage_gate_blocks_auto_advance', module: 'test_stage_gate', status: 'pass', description: 'Stage gate блокирует автопереход' },
  { name: 'test_stage_gate_allows_approved', module: 'test_stage_gate', status: 'pass', description: 'После approve переход разрешён' },
  { name: 'test_stage_gate_rejects_without_approval', module: 'test_stage_gate', status: 'pass', description: 'Без approve переход запрещён' },
  { name: 'test_stage_gate_iteration_limit', module: 'test_stage_gate', status: 'pass', description: 'Превышение лимита итераций обрабатывается' },
  { name: 'test_stage_gate_preserves_history', module: 'test_stage_gate', status: 'pass', description: 'История решений сохраняется' },

  // Repository tests
  { name: 'test_repo_save_run', module: 'test_repository', status: 'pass', description: 'Запуск сохраняется в БД' },
  { name: 'test_repo_save_stage_state', module: 'test_repository', status: 'pass', description: 'Состояние этапа сохраняется' },
  { name: 'test_repo_save_human_review', module: 'test_repository', status: 'pass', description: 'Решение человека сохраняется' },
  { name: 'test_repo_get_run_history', module: 'test_repository', status: 'pass', description: 'История запусков возвращается' },
  { name: 'test_repo_concurrent_access', module: 'test_repository', status: 'pass', description: 'Конкурентный доступ обрабатывается' },

  // Pipeline smoke tests
  { name: 'test_pipeline_intake_only', module: 'test_pipeline_smoke', status: 'pass', description: 'Пайплайн выполняет только intake в dry-run' },
  { name: 'test_pipeline_stops_after_intake', module: 'test_pipeline_smoke', status: 'pass', description: 'Пайплайн останавливается после intake' },
  { name: 'test_pipeline_full_dry_run', module: 'test_pipeline_smoke', status: 'pass', description: 'Полный dry-run с моками LLM' },
  { name: 'test_pipeline_llm_mock', module: 'test_pipeline_smoke', status: 'pass', description: 'LLM заменён моком в тестах' },
  { name: 'test_pipeline_no_network', module: 'test_pipeline_smoke', status: 'pass', description: 'Тесты работают без сети' },
  { name: 'test_pipeline_no_secrets', module: 'test_pipeline_smoke', status: 'pass', description: 'Тесты работают без API-ключей' },
  { name: 'test_pipeline_error_handling', module: 'test_pipeline_smoke', status: 'pass', description: 'Ошибки обрабатываются корректно' },
];

const modules = [...new Set(testCases.map(t => t.module))];

export function Tests() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const filteredTests = selectedModule
    ? testCases.filter(t => t.module === selectedModule)
    : testCases;

  const passCount = testCases.filter(t => t.status === 'pass').length;
  const failCount = testCases.filter(t => t.status === 'fail').length;
  const pendingCount = testCases.filter(t => t.status === 'pending').length;

  const runTests = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Тесты (pytest)</h2>
          <p className="text-gray-400">
            Все тесты выполняются без сети, без API-ключей и без внешних интеграций. LLM заменён моком.
          </p>
        </div>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
        >
          <Play size={14} className={isRunning ? 'animate-spin' : ''} />
          {isRunning ? 'Выполняется...' : 'Запустить'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{passCount}</div>
          <div className="text-sm text-gray-400">Пройдено</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{failCount}</div>
          <div className="text-sm text-gray-400">Провалено</div>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-400">{pendingCount}</div>
          <div className="text-sm text-gray-400">Ожидает</div>
        </div>
      </div>

      {/* Module Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedModule(null)}
          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
            !selectedModule ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          }`}
        >
          Все ({testCases.length})
        </button>
        {modules.map(mod => {
          const count = testCases.filter(t => t.module === mod).length;
          return (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedModule === mod ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {mod} ({count})
            </button>
          );
        })}
      </div>

      {/* Test List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {filteredTests.map((test, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/30 transition-colors">
              {test.status === 'pass' && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
              {test.status === 'fail' && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
              {test.status === 'pending' && <Circle size={16} className="text-gray-500 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-gray-200 truncate">{test.name}</div>
                <div className="text-xs text-gray-500">{test.description}</div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 flex-shrink-0">
                {test.module}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Requirements */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Требования к тестам</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Без сети', desc: 'Все тесты выполняются без интернет-соединения', icon: '🌐' },
            { title: 'Без API-ключей', desc: 'Секреты не используются в тестах', icon: '🔑' },
            { title: 'Без внешних интеграций', desc: 'DoQA, Redmine, кодовая база не задействованы', icon: '🔌' },
            { title: 'LLM — мок', desc: 'Модель заменяется предсказуемым моком', icon: '🤖' },
            { title: 'Парсеры', desc: 'Тесты для всех поддерживаемых форматов', icon: '📄' },
            { title: 'Нормализация', desc: 'Тесты нормализации требований', icon: '📐' },
            { title: 'Дельта', desc: 'Тесты формирования дельты изменений', icon: '🔀' },
            { title: 'Хранение', desc: 'Тесты сохранения состояния в БД', icon: '💾' },
            { title: 'Подтверждение', desc: 'Тесты human-in-the-loop', icon: '👤' },
            { title: 'Повторный запуск', desc: 'Тесты rerun с комментариями', icon: '🔄' },
            { title: 'Dry-run', desc: 'Smoke-тесты пайплайна', icon: '💨' },
            { title: 'Ошибки', desc: 'Тесты обработки ошибок', icon: '⚠️' },
          ].map((req) => (
            <div key={req.title} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <span className="text-lg">{req.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-200">{req.title}</div>
                <div className="text-xs text-gray-500">{req.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Покрытие по модулям</h3>
        <div className="space-y-3">
          {[
            { module: 'parsers/', coverage: 95, tests: 10 },
            { module: 'requirement_diff', coverage: 88, tests: 8 },
            { module: 'stage_gate', coverage: 92, tests: 5 },
            { module: 'repository', coverage: 85, tests: 5 },
            { module: 'pipeline_smoke', coverage: 78, tests: 7 },
          ].map((item) => (
            <div key={item.module} className="flex items-center gap-4">
              <span className="font-mono text-sm text-gray-300 w-40">{item.module}</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.coverage >= 90 ? 'bg-emerald-500' :
                    item.coverage >= 80 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${item.coverage}%` }}
                />
              </div>
              <span className="text-sm text-gray-400 w-12 text-right">{item.coverage}%</span>
              <span className="text-xs text-gray-500 w-16 text-right">{item.tests} тестов</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
