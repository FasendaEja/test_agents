import { useState, useEffect } from 'react';
import { Save, RotateCcw, Copy, Check, Edit3, Eye } from 'lucide-react';

interface AgentPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  variables: string[];
}

const defaultPrompts: AgentPrompt[] = [
  {
    id: 'intake',
    name: 'Requirement Intake Agent',
    description: 'Агент приема требований: читает файлы, нормализует текст, формирует объекты версий требований.',
    prompt: `Ты — агент для приема и нормализации требований.

Твоя задача:
1. Прочитать все файлы из указанных источников
2. Извлечь текст требований
3. Нормализовать структуру и формат
4. Сформировать объект RequirementVersion

Входные данные:
- current_path: путь к новой версии требований
- baseline_path: путь к старой версии требований (опционально)
- file_masks: маски файлов для обработки

Требования к результату:
- Верни JSON с полями: content, sources, metadata
- content должен быть нормализованным текстом
- sources — список обработанных файлов
- metadata — дополнительная информация

Если файл не поддерживается или пуст, пропусти его с предупреждением.
Не выдумывай данные, работай только с реальным содержимым файлов.`,
    variables: ['current_path', 'baseline_path', 'file_masks'],
  },
  {
    id: 'diff',
    name: 'Requirement Diff Agent',
    description: 'Агент сравнения версий: определяет типы изменений (added, changed, removed, moved, renamed), формирует дельту.',
    prompt: `Ты — агент для сравнения двух версий требований.

Твоя задача:
1. Сравнить baseline_requirements с current_requirements
2. Определить тип каждого изменения:
   - added: новое требование
   - changed: измененное требование
   - removed: удаленное требование
   - unchanged: без изменений
   - moved: перемещено между разделами
   - renamed: переименовано
   - unclear: неясно

3. Для каждого изменения укажи:
   - delta_id: уникальный идентификатор
   - type: тип изменения
   - title: краткое описание
   - old_text: текст в старой версии (если есть)
   - new_text: текст в новой версии (если есть)
   - semantic_change: true/false — есть ли смысловое изменение
   - formatting_only: true/false — только форматирование
   - impact_areas: затронутые области
   - rationale: объяснение почему это изменение
   - recommended_action: рекомендуемое действие

Важно:
- Сравнивай смысловое содержание, а не только текст
- Учитывай переформулировки без изменения смысла
- Учитывай переносы между разделами
- Учитывай изменения нумерации и форматирования

Если baseline отсутствует, пометь все элементы как "added" или "unclear".

Верни JSON со структурой:
{
  "items": [
    {
      "delta_id": "...",
      "type": "added|changed|removed|unchanged|moved|renamed|unclear",
      "title": "...",
      "old_text": "...",
      "new_text": "...",
      "semantic_change": true/false,
      "formatting_only": true/false,
      "impact_areas": [],
      "rationale": "...",
      "recommended_action": "..."
    }
  ]
}`,
    variables: ['baseline_requirements', 'current_requirements'],
  },
  {
    id: 'analysis',
    name: 'Requirement Analysis Agent',
    description: 'Агент анализа требований: проверяет полноту, тестируемость, противоречия, риски, формирует вопросы.',
    prompt: `Ты — агент для анализа требований на тестируемость и полноту.

Твоя задача:
1. Проанализировать требования по следующим критериям:
   - Полнота: все ли необходимые детали указаны
   - Однозначность: нет ли двусмысленности
   - Тестируемость: можно ли проверить требование
   - Критерии приемки: указаны ли условия успеха
   - Позитивные сценарии: описаны ли основные случаи
   - Негативные сценарии: описаны ли ошибочные случаи
   - Граничные условия: учтены ли крайние случаи
   - Противоречия: нет ли конфликтов между требованиями
   - Отсутствующие сценарии: что не описано
   - Влияние на существующую функциональность
   - Риски: потенциальные проблемы

2. Для каждой проблемы укажи:
   - type: тип проблемы (completeness, ambiguity, testability, contradiction, missing_scenario, risk)
   - severity: high/medium/low
   - description: описание проблемы
   - location: где найдена проблема
   - recommendation: как исправить

3. Оцени:
   - completeness_score: 0.0-1.0
   - testability_score: 0.0-1.0

4. Сформируй:
   - questions: вопросы для уточнения
   - risks: список рисков
   - missing_scenarios: отсутствующие сценарии
   - affected_areas: затронутые области

Верни JSON со структурой:
{
  "summary": "...",
  "completeness_score": 0.0,
  "testability_score": 0.0,
  "problems": [
    {
      "type": "...",
      "severity": "high|medium|low",
      "description": "...",
      "location": "...",
      "recommendation": "..."
    }
  ],
  "questions": ["..."],
  "risks": ["..."],
  "missing_scenarios": ["..."],
  "affected_areas": ["..."],
  "recommendation": "..."
}`,
    variables: ['requirements', 'delta', 'human_comments'],
  },
  {
    id: 'mindmap',
    name: 'Mind-Map Agent',
    description: 'Агент формирования mind-map: создает структуру доработки в Markdown и Mermaid с привязкой к delta_id.',
    prompt: `Ты — агент для формирования mind-map доработки.

Твоя задача:
1. Проанализировать требования, дельту и анализ
2. Построить структуру доработки:
   - Основная тема
   - Функциональные блоки
   - Затронутые модули
   - Новые области (из delta type=added)
   - Измененные области (из delta type=changed)
   - Удаленные области (из delta type=removed)
   - Риски и открытые вопросы

3. Для каждого узла mind-map:
   - Укажи заголовок
   - Опиши содержание
   - Привяжи к delta_id (если связано с изменением)
   - Укажи тип (new/changed/removed/risk/question)

4. Сформируй результат в двух форматах:

Формат 1 — Markdown:
\`\`\`markdown
# Доработка

## Добавлено
- [delta_id] Элемент 1
- [delta_id] Элемент 2

## Изменено
- [delta_id] Элемент 3

## Удалено
- [delta_id] Элемент 4

## Риски
- Риск 1
- Риск 2

## Открытые вопросы
- Вопрос 1
\`\`\`

Формат 2 — Mermaid (опционально):
\`\`\`mermaid
mindmap
  root((Доработка))
    Добавлено
      Элемент 1
      Элемент 2
    Изменено
      Элемент 3
    Удалено
      Элемент 4
    Риски
      Риск 1
\`\`\`

Верни JSON со структурой:
{
  "markdown": "...",
  "mermaid": "...",
  "nodes": [
    {
      "id": "...",
      "title": "...",
      "type": "new|changed|removed|risk|question",
      "delta_id": "...",
      "description": "...",
      "children": []
    }
  ]
}`,
    variables: ['requirements', 'delta', 'analysis'],
  },
  {
    id: 'checklist',
    name: 'Checklist Agent',
    description: 'Агент формирования чек-листа: создает список проверок с категориями и приоритетами.',
    prompt: `Ты — агент для формирования чек-листа проверок.

Твоя задача:
1. На основе требований, дельты, анализа и mind-map сформировать чек-лист проверок

2. Для каждой проверки укажи:
   - id: уникальный идентификатор
   - title: название проверки
   - category: категория проверки
   - priority: приоритет (high/medium/low)
   - related_delta_ids: связанные изменения
   - rationale: обоснование почему эта проверка нужна

3. Категории проверок:
   - positive: позитивные сценарии
   - negative: негативные сценарии
   - boundary: граничные условия
   - regression: регрессионные проверки
   - integration: проверки интеграций
   - access: проверки прав доступа
   - data: проверки данных
   - ui: проверки интерфейса

4. Приоритеты:
   - high: критически важные проверки
   - medium: важные проверки
   - low: дополнительные проверки

5. Правила формирования:
   - Для каждого delta type=added: минимум 2 positive проверки
   - Для каждого delta type=changed: минимум 1 positive + 1 regression проверка
   - Для каждого delta type=removed: минимум 1 regression проверка
   - Учитывай проблемы из анализа
   - Учитывай риски из анализа
   - Добавляй boundary проверки для числовых полей
   - Добавляй negative проверки для валидации

6. Сортируй по приоритету: high → medium → low

Верни JSON со структурой:
{
  "items": [
    {
      "id": "check_001",
      "title": "Проверить что...",
      "category": "positive|negative|boundary|regression|integration|access|data|ui",
      "priority": "high|medium|low",
      "related_delta_ids": ["delta_001"],
      "rationale": "Эта проверка нужна потому что..."
    }
  ],
  "summary": {
    "total": 0,
    "by_category": {},
    "by_priority": {}
  }
}`,
    variables: ['requirements', 'delta', 'analysis', 'mindmap'],
  },
];

export function PromptsEditor() {
  const [prompts, setPrompts] = useState<AgentPrompt[]>(() => {
    const saved = localStorage.getItem('qa-agent-prompts');
    return saved ? JSON.parse(saved) : defaultPrompts;
  });
  
  const [selectedAgent, setSelectedAgent] = useState<string>(prompts[0]?.id || '');
  const [editMode, setEditMode] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const agent = prompts.find(p => p.id === selectedAgent);
    if (agent) {
      setEditedPrompt(agent.prompt);
    }
  }, [selectedAgent, prompts]);

  const handleSave = () => {
    const updated = prompts.map(p => 
      p.id === selectedAgent ? { ...p, prompt: editedPrompt } : p
    );
    setPrompts(updated);
    localStorage.setItem('qa-agent-prompts', JSON.stringify(updated));
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultAgent = defaultPrompts.find(p => p.id === selectedAgent);
    if (defaultAgent) {
      setEditedPrompt(defaultAgent.prompt);
      setEditMode(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAgent = prompts.find(p => p.id === selectedAgent);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Редактор промптов агентов</h2>
        <p className="text-gray-400">
          Настройте системные промпты для каждого агента. Изменения сохраняются в localStorage браузера.
        </p>
      </div>

      {/* Agent Selection */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Выберите агента</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prompts.map(agent => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent.id);
                setEditMode(false);
              }}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedAgent === agent.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-sm mb-1">{agent.name}</div>
              <div className="text-xs text-gray-500 line-clamp-2">{agent.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Editor */}
      {currentAgent && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{currentAgent.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{currentAgent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  <Edit3 size={16} />
                  Редактировать
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw size={16} />
                    Сбросить
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                  >
                    {saved ? <Check size={16} /> : <Save size={16} />}
                    {saved ? 'Сохранено' : 'Сохранить'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Variables */}
          <div className="px-6 py-3 border-b border-gray-800 bg-gray-800/30">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Переменные:</span>
              {currentAgent.variables.map(v => (
                <span key={v} className="px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                  {`{${v}}`}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt Content */}
          <div className="p-6">
            {editMode ? (
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full h-96 px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono resize-none focus:outline-none focus:border-emerald-500/50"
                placeholder="Введите промпт агента..."
              />
            ) : (
              <div className="relative">
                <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                  {currentAgent.prompt}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
                  title="Копировать"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Example */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Как использовать промпты</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">1. В коде Python:</h4>
            <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-x-auto">
{`from llm.prompts import get_agent_prompt

# Загрузка промпта
prompt_template = get_agent_prompt("diff")

# Подстановка переменных
prompt = prompt_template.format(
    baseline_requirements=baseline_text,
    current_requirements=current_text
)

# Вызов LLM
response = llm_client.complete(prompt)`}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">2. Структура файла prompts.py:</h4>
            <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-x-auto">
{`PROMPTS = {
    "intake": """...""",
    "diff": """...""",
    "analysis": """...""",
    "mindmap": """...""",
    "checklist": """..."""
}

def get_agent_prompt(agent_id: str) -> str:
    return PROMPTS.get(agent_id, "")`}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">3. Переменные в промпте:</h4>
            <p className="text-sm text-gray-400">
              Используйте <code className="text-cyan-400">{'{variable_name}'}</code> для мест, куда будут подставлены данные. 
              Список переменных для каждого агента показан выше.
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Eye size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <strong className="text-blue-400">Примечание:</strong> Изменения промптов сохраняются в localStorage браузера и используются только в демо-режиме. 
            В реальном приложении промпты хранятся в файле <code className="text-cyan-400">llm/prompts.py</code> или в базе данных.
          </div>
        </div>
      </div>
    </div>
  );
}
