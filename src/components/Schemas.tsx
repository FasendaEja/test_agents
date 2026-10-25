import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SchemaField {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface Schema {
  name: string;
  description: string;
  fields: SchemaField[];
}

const schemas: Schema[] = [
  {
    name: 'Run',
    description: 'Запуск пайплайна',
    fields: [
      { name: 'run_id', type: 'UUID', description: 'Уникальный идентификатор запуска', required: true },
      { name: 'created_at', type: 'datetime', description: 'Дата создания', required: true },
      { name: 'updated_at', type: 'datetime', description: 'Дата обновления', required: true },
      { name: 'status', type: 'str', description: 'Статус запуска (running, completed, failed)', required: true },
      { name: 'current_stage', type: 'str', description: 'Текущий этап', required: true },
      { name: 'config', type: 'dict', description: 'Конфигурация запуска', required: false },
    ],
  },
  {
    name: 'RequirementVersion',
    description: 'Версия требований',
    fields: [
      { name: 'version_id', type: 'UUID', description: 'Идентификатор версии', required: true },
      { name: 'run_id', type: 'UUID', description: 'Ссылка на запуск', required: true },
      { name: 'type', type: 'str', description: 'current | baseline', required: true },
      { name: 'content', type: 'str', description: 'Нормализованный текст', required: true },
      { name: 'sources', type: 'list[Source]', description: 'Источники', required: true },
      { name: 'metadata', type: 'dict', description: 'Метаданные', required: false },
    ],
  },
  {
    name: 'RequirementDelta',
    description: 'Дельта изменений между версиями',
    fields: [
      { name: 'run_id', type: 'UUID', description: 'Ссылка на запуск', required: true },
      { name: 'baseline_version', type: 'str', description: 'Идентификатор базовой версии', required: false },
      { name: 'new_version', type: 'str', description: 'Идентификатор новой версии', required: true },
      { name: 'items', type: 'list[DeltaItem]', description: 'Элементы дельты', required: true },
    ],
  },
  {
    name: 'DeltaItem',
    description: 'Отдельное изменение в требованиях',
    fields: [
      { name: 'delta_id', type: 'str', description: 'Идентификатор изменения', required: true },
      { name: 'type', type: 'str', description: 'added | changed | removed | unchanged | moved | renamed | unclear', required: true },
      { name: 'title', type: 'str', description: 'Заголовок изменения', required: true },
      { name: 'old_text', type: 'str', description: 'Текст в старой версии', required: false },
      { name: 'new_text', type: 'str', description: 'Текст в новой версии', required: false },
      { name: 'source_baseline', type: 'str', description: 'Источник в базовой версии', required: false },
      { name: 'source_current', type: 'str', description: 'Источник в текущей версии', required: false },
      { name: 'semantic_change', type: 'bool', description: 'Есть ли смысловое изменение', required: true },
      { name: 'formatting_only', type: 'bool', description: 'Только форматирование', required: true },
      { name: 'impact_areas', type: 'list[str]', description: 'Затронутые области', required: false },
      { name: 'rationale', type: 'str', description: 'Объяснение', required: true },
      { name: 'recommended_action', type: 'str', description: 'Рекомендуемое действие', required: false },
      { name: 'human_decision', type: 'str', description: 'pending | approved | rejected', required: true },
    ],
  },
  {
    name: 'AnalysisReport',
    description: 'Отчет об анализе требований',
    fields: [
      { name: 'run_id', type: 'UUID', description: 'Ссылка на запуск', required: true },
      { name: 'summary', type: 'str', description: 'Краткое описание', required: true },
      { name: 'completeness_score', type: 'float', description: 'Оценка полноты (0-1)', required: true },
      { name: 'testability_score', type: 'float', description: 'Оценка тестируемости (0-1)', required: true },
      { name: 'problems', type: 'list[Problem]', description: 'Найденные проблемы', required: true },
      { name: 'questions', type: 'list[str]', description: 'Вопросы для уточнения', required: true },
      { name: 'risks', type: 'list[Risk]', description: 'Риски', required: true },
      { name: 'missing_scenarios', type: 'list[str]', description: 'Отсутствующие сценарии', required: true },
      { name: 'affected_areas', type: 'list[str]', description: 'Затронутые области', required: true },
      { name: 'related_delta_ids', type: 'list[str]', description: 'Связанные delta_id', required: true },
      { name: 'recommendation', type: 'str', description: 'Рекомендация', required: true },
    ],
  },
  {
    name: 'ChecklistItem',
    description: 'Пункт чек-листа проверок',
    fields: [
      { name: 'id', type: 'str', description: 'Идентификатор', required: true },
      { name: 'title', type: 'str', description: 'Название проверки', required: true },
      { name: 'category', type: 'str', description: 'positive | negative | boundary | regression | integration | access | data | ui', required: true },
      { name: 'priority', type: 'str', description: 'high | medium | low', required: true },
      { name: 'related_delta_ids', type: 'list[str]', description: 'Связанные delta_id', required: true },
      { name: 'rationale', type: 'str', description: 'Обоснование', required: true },
    ],
  },
  {
    name: 'StageState',
    description: 'Состояние этапа',
    fields: [
      { name: 'run_id', type: 'UUID', description: 'Ссылка на запуск', required: true },
      { name: 'stage', type: 'str', description: 'Идентификатор этапа', required: true },
      { name: 'status', type: 'str', description: 'pending | running | waiting_for_human | approved | rejected | needs_rerun | failed | skipped', required: true },
      { name: 'iteration', type: 'int', description: 'Номер итерации', required: true },
      { name: 'max_iterations', type: 'int', description: 'Максимум итераций', required: true },
      { name: 'result_path', type: 'str', description: 'Путь к результату', required: false },
      { name: 'rationale_path', type: 'str', description: 'Путь к объяснению', required: false },
      { name: 'error', type: 'str', description: 'Сообщение об ошибке', required: false },
    ],
  },
  {
    name: 'HumanReview',
    description: 'Решение человека по этапу',
    fields: [
      { name: 'review_id', type: 'UUID', description: 'Идентификатор ревью', required: true },
      { name: 'run_id', type: 'UUID', description: 'Ссылка на запуск', required: true },
      { name: 'stage', type: 'str', description: 'Этап', required: true },
      { name: 'iteration', type: 'int', description: 'Итерация', required: true },
      { name: 'decision', type: 'str', description: 'approve | reject | rerun_with_comments', required: true },
      { name: 'comment', type: 'str', description: 'Комментарий', required: false },
      { name: 'created_at', type: 'datetime', description: 'Дата решения', required: true },
    ],
  },
  {
    name: 'Rationale',
    description: 'Объяснение результата этапа',
    fields: [
      { name: 'run_id', type: 'UUID', description: 'Ссылка на запуск', required: true },
      { name: 'stage', type: 'str', description: 'Этап', required: true },
      { name: 'summary', type: 'str', description: 'Краткое описание', required: true },
      { name: 'used_sources', type: 'list[str]', description: 'Использованные источники', required: true },
      { name: 'used_fragments', type: 'list[str]', description: 'Учтённые фрагменты', required: true },
      { name: 'assumptions', type: 'list[str]', description: 'Допущения', required: true },
      { name: 'missing_information', type: 'list[str]', description: 'Отсутствующая информация', required: true },
      { name: 'risks', type: 'list[str]', description: 'Риски', required: true },
      { name: 'confidence', type: 'str', description: 'Уровень уверенности', required: true },
      { name: 'changes_from_previous_iteration', type: 'list[str]', description: 'Изменения от предыдущей итерации', required: true },
    ],
  },
];

export function Schemas() {
  const [expandedSchema, setExpandedSchema] = useState<string | null>('DeltaItem');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Схемы данных (Pydantic v2)</h2>
        <p className="text-gray-400">
          Все сущности описаны с помощью Pydantic v2 со strict typing. JSON-ответы от LLM валидируются через эти схемы.
        </p>
      </div>

      <div className="space-y-3">
        {schemas.map((schema) => (
          <div key={schema.name} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedSchema(expandedSchema === schema.name ? null : schema.name)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                {'{}'}
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm font-medium text-white">{schema.name}</div>
                <div className="text-xs text-gray-400">{schema.description}</div>
              </div>
              <span className="text-xs text-gray-500">{schema.fields.length} полей</span>
              {expandedSchema === schema.name ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </button>

            {expandedSchema === schema.name && (
              <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="pb-2 pr-4">Поле</th>
                        <th className="pb-2 pr-4">Тип</th>
                        <th className="pb-2 pr-4">Описание</th>
                        <th className="pb-2">Req</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.fields.map((field) => (
                        <tr key={field.name} className="border-t border-gray-800/50">
                          <td className="py-2 pr-4 font-mono text-cyan-300">{field.name}</td>
                          <td className="py-2 pr-4 font-mono text-purple-300 text-xs">{field.type}</td>
                          <td className="py-2 pr-4 text-gray-400">{field.description}</td>
                          <td className="py-2">
                            {field.required !== false && (
                              <span className="text-red-400 text-xs">*</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enums */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Перечисления (Enums)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">DeltaType</h4>
            <div className="flex flex-wrap gap-1">
              {['added', 'changed', 'removed', 'unchanged', 'moved', 'renamed', 'unclear'].map(v => (
                <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-300 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">StageStatus</h4>
            <div className="flex flex-wrap gap-1">
              {['pending', 'running', 'waiting_for_human', 'approved', 'rejected', 'needs_rerun', 'failed', 'skipped'].map(v => (
                <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-300 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">HumanDecision</h4>
            <div className="flex flex-wrap gap-1">
              {['approve', 'reject', 'rerun_with_comments'].map(v => (
                <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-300 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">ChecklistCategory</h4>
            <div className="flex flex-wrap gap-1">
              {['positive', 'negative', 'boundary', 'regression', 'integration', 'access', 'data', 'ui'].map(v => (
                <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-300 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Priority</h4>
            <div className="flex flex-wrap gap-1">
              {['high', 'medium', 'low'].map(v => (
                <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-300 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Confidence</h4>
            <div className="flex flex-wrap gap-1">
              {['high', 'medium', 'low'].map(v => (
                <span key={v} className="px-1.5 py-0.5 text-[10px] bg-gray-800 text-gray-300 rounded font-mono">{v}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
