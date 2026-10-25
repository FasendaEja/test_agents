import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, CheckCircle2, XCircle, RotateCcw, Pause } from 'lucide-react';

interface StageInfo {
  id: string;
  num: number;
  name: string;
  agent: string;
  description: string;
  inputs: string[];
  outputs: string[];
  statusOptions: string[];
  humanActions: string[];
}

const stages: StageInfo[] = [
  {
    id: 'intake_requirements',
    num: 1,
    name: 'Получение требований',
    agent: 'Requirement Intake Agent',
    description: 'Чтение файлов, нормализация текста, формирование объектов новой и старой версии требований, фиксация источников.',
    inputs: ['Текст / файл / папка', 'Старая версия (опционально)'],
    outputs: ['Нормализованный объект новой версии', 'Нормализованный объект старой версии', 'Список источников', 'Список обработанных/пропущенных файлов'],
    statusOptions: ['pending', 'running', 'waiting_for_human', 'approved', 'rejected', 'needs_rerun', 'failed'],
    humanActions: ['approve', 'reject', 'rerun_with_comments'],
  },
  {
    id: 'compare_requirements',
    num: 2,
    name: 'Формирование дельты',
    agent: 'Requirement Diff Agent',
    description: 'Сравнение старой и новой версии, определение типов изменений, формирование дельты с объяснением.',
    inputs: ['Новая версия требований', 'Старая версия требований (или null)'],
    outputs: ['DeltaItem[] с типами изменений', 'Объяснение каждого изменения', 'Рекомендации по действиям'],
    statusOptions: ['pending', 'running', 'waiting_for_human', 'approved', 'rejected', 'needs_rerun', 'failed'],
    humanActions: ['approve', 'reject', 'rerun_with_comments'],
  },
  {
    id: 'confirm_delta',
    num: 3,
    name: 'Подтверждение дельты',
    agent: 'Human Review Service',
    description: 'Пользователь просматривает дельту и принимает решение: подтвердить, отклонить или перезапустить с комментариями.',
    inputs: ['Дельта требований', 'Комментарии человека (при rerun)'],
    outputs: ['Решение: approve/reject/rerun', 'История итераций'],
    statusOptions: ['waiting_for_human', 'approved', 'rejected', 'needs_rerun'],
    humanActions: ['approve', 'reject', 'rerun_with_comments'],
  },
  {
    id: 'analyze_requirements',
    num: 4,
    name: 'Анализ требований',
    agent: 'Requirement Analysis Agent',
    description: 'Анализ на полноту, однозначность, тестируемость, критерии приемки, позитивные/негативные сценарии, граничные условия, противоречия, риски.',
    inputs: ['Требования', 'Подтвержденная дельта'],
    outputs: ['Отчет об анализе (JSON + Markdown)', 'Оценки полноты и тестируемости', 'Список проблем и вопросов', 'Риски и рекомендации'],
    statusOptions: ['pending', 'running', 'waiting_for_human', 'approved', 'rejected', 'needs_rerun', 'failed'],
    humanActions: ['approve', 'reject', 'rerun_with_comments'],
  },
  {
    id: 'generate_mindmap',
    num: 5,
    name: 'Mind-map доработки',
    agent: 'Mind-Map Agent',
    description: 'Формирование структуры доработки: блоки, модули, новые/измененные/удаленные области, риски. Привязка к delta_id.',
    inputs: ['Требования', 'Дельта', 'Анализ'],
    outputs: ['Mind-map в Markdown', 'Mind-map в Mermaid (опционально)', 'Привязка к delta_id'],
    statusOptions: ['pending', 'running', 'waiting_for_human', 'approved', 'rejected', 'needs_rerun', 'failed'],
    humanActions: ['approve', 'reject', 'rerun_with_comments'],
  },
  {
    id: 'generate_checklist',
    num: 6,
    name: 'Чек-лист проверок',
    agent: 'Checklist Agent',
    description: 'Формирование чек-листа: позитивные, негативные, граничные, регрессионные, интеграционные проверки. Категоризация и приоритизация.',
    inputs: ['Требования', 'Дельта', 'Анализ', 'Mind-map'],
    outputs: ['Чек-лист в JSON', 'Чек-лист в Markdown', 'Категории и приоритеты'],
    statusOptions: ['pending', 'running', 'waiting_for_human', 'approved', 'rejected', 'needs_rerun', 'failed'],
    humanActions: ['approve', 'reject', 'rerun_with_comments'],
  },
];

const statusColors: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  waiting_for_human: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  needs_rerun: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  skipped: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  running: <RotateCcw size={12} className="animate-spin" />,
  waiting_for_human: <Pause size={12} />,
  approved: <CheckCircle2 size={12} />,
  rejected: <XCircle size={12} />,
  needs_rerun: <RotateCcw size={12} />,
  failed: <XCircle size={12} />,
  skipped: <Clock size={12} />,
};

export function Pipeline() {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Граф процесса (LangGraph)</h2>
        <p className="text-gray-400">
          Узлы графа и переходы между ними. После каждого продуктивного узла граф переходит в состояние waiting_for_human.
        </p>
      </div>

      {/* Visual Flow */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Визуальный поток</h3>
        <div className="flex items-center gap-1 min-w-max">
          {stages.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <div
                className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                  expandedStage === stage.id
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              >
                <div className="text-[10px] opacity-60">#{stage.num}</div>
                {stage.name}
              </div>
              {i < stages.length - 1 && (
                <div className="flex items-center mx-1">
                  <div className="w-4 h-px bg-gray-600" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center mx-1">
            <div className="w-4 h-px bg-gray-600" />
            <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-gray-600" />
          </div>
          <div className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <div className="text-[10px] opacity-60">MVP</div>
            STOP
          </div>
        </div>
      </div>

      {/* Stage Details */}
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                {stage.num}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{stage.name}</div>
                <div className="text-xs text-gray-400">{stage.agent}</div>
              </div>
              {expandedStage === stage.id ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
            </button>
            
            {expandedStage === stage.id && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-300">{stage.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">Входы</h4>
                    <ul className="space-y-1">
                      {stage.inputs.map((input, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          {input}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">Выходы</h4>
                    <ul className="space-y-1">
                      {stage.outputs.map((output, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {output}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">Статусы этапа</h4>
                  <div className="flex flex-wrap gap-2">
                    {stage.statusOptions.map((status) => (
                      <span key={status} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${statusColors[status]}`}>
                        {statusIcons[status]}
                        {status}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">Действия человека</h4>
                  <div className="flex flex-wrap gap-2">
                    {stage.humanActions.map((action) => (
                      <span key={action} className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rerun Logic */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Логика повторного запуска</h3>
        <div className="text-sm text-gray-300 space-y-3">
          <p>Каждый этап можно запустить повторно (максимум 5 итераций). При повторном запуске:</p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Используются исходные входные данные</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Учитывается предыдущий результат</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Применяются комментарии человека</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">•</span> Сохраняется история итераций</li>
          </ul>
          <p>Повторный результат содержит:</p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-start gap-2"><span className="text-cyan-400">•</span> Что изменено по сравнению с предыдущей версией</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400">•</span> Какие комментарии учтены</li>
            <li className="flex items-start gap-2"><span className="text-cyan-400">•</span> Какие допущения сделаны</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
