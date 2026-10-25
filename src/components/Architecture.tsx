export function Architecture() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Архитектура системы</h2>
        <p className="text-gray-400">
          Компонентная архитектура MVP с разделением ответственности и возможностью расширения.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-6">Схема компонентов</h3>
        <div className="space-y-4">
          {/* CLI Layer */}
          <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5">
            <div className="text-xs text-blue-400 font-medium mb-2">🖥️ CLI Layer (Typer)</div>
            <div className="flex flex-wrap gap-2">
              {['run', 'runs list', 'run show', 'stage show', 'stage approve', 'stage reject', 'stage rerun'].map(cmd => (
                <span key={cmd} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded border border-blue-500/20">
                  {cmd}
                </span>
              ))}
            </div>
          </div>

          {/* Graph Layer */}
          <div className="border border-emerald-500/30 rounded-lg p-4 bg-emerald-500/5">
            <div className="text-xs text-emerald-400 font-medium mb-2">🔗 Graph Layer (LangGraph)</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['state.py', 'nodes.py', 'edges.py', 'pipeline.py'].map(f => (
                <span key={f} className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/20">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Agents Layer */}
          <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
            <div className="text-xs text-purple-400 font-medium mb-2">🤖 Agents Layer</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Requirement Intake',
                'Requirement Diff',
                'Requirement Analysis',
                'Mind-Map',
                'Checklist',
              ].map(a => (
                <span key={a} className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded border border-purple-500/20">
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Services Layer */}
          <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
            <div className="text-xs text-amber-400 font-medium mb-2">⚙️ Services Layer</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                'Human Review Service',
                'Rationale Service',
                'Markdown Service',
                'Report Service',
                'Snapshot Service',
                'Stage Gate',
                'History Store',
              ].map(s => (
                <span key={s} className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded border border-amber-500/20">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Infrastructure Layer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-500/5">
              <div className="text-xs text-cyan-400 font-medium mb-2">🤖 LLM Client</div>
              <div className="space-y-1 text-xs text-gray-400">
                <p>OpenAI-compatible API</p>
                <p>Модель: qwen3.8</p>
                <p>JSON валидация через Pydantic</p>
                <p>Retry логика</p>
              </div>
            </div>
            <div className="border border-rose-500/30 rounded-lg p-4 bg-rose-500/5">
              <div className="text-xs text-rose-400 font-medium mb-2">🗄️ Database</div>
              <div className="space-y-1 text-xs text-gray-400">
                <p>PostgreSQL 15+</p>
                <p>SQLAlchemy 2.x</p>
                <p>Alembic миграции</p>
                <p>Repository pattern</p>
              </div>
            </div>
            <div className="border border-teal-500/30 rounded-lg p-4 bg-teal-500/5">
              <div className="text-xs text-teal-400 font-medium mb-2">📁 File Storage</div>
              <div className="space-y-1 text-xs text-gray-400">
                <p>workspace/runs/{'{run_id}'}/</p>
                <p>input/ (current + baseline)</p>
                <p>artifacts/ (JSON + MD)</p>
                <p>rationale/ (объяснения)</p>
              </div>
            </div>
          </div>

          {/* Parsers Layer */}
          <div className="border border-gray-600/30 rounded-lg p-4 bg-gray-800/30">
            <div className="text-xs text-gray-400 font-medium mb-2">📄 Parsers Layer</div>
            <div className="flex flex-wrap gap-2">
              {['txt', 'md', 'json', 'yaml', 'csv', 'docx', 'xlsx'].map(f => (
                <span key={f} className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded border border-gray-600/30">
                  .{f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Поток данных</h3>
        <div className="space-y-3">
          {[
            { from: 'CLI', to: 'Pipeline', desc: 'Запуск с параметрами (current, baseline)' },
            { from: 'Pipeline', to: 'Intake Agent', desc: 'Передача путей к файлам' },
            { from: 'Intake Agent', to: 'Parsers', desc: 'Чтение и нормализация файлов' },
            { from: 'Parsers', to: 'State', desc: 'Нормализованные требования → GraphState' },
            { from: 'Diff Agent', to: 'LLM', desc: 'Семантическое сравнение версий' },
            { from: 'LLM', to: 'Pydantic', desc: 'JSON → валидация → DeltaItem[]' },
            { from: 'Stage Gate', to: 'Human Review', desc: 'Ожидание подтверждения' },
            { from: 'Human Review', to: 'Repository', desc: 'Сохранение решения в БД' },
            { from: 'Repository', to: 'File Storage', desc: 'Сохранение артефактов' },
          ].map((flow, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700 min-w-[100px] text-center">
                {flow.from}
              </span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 border border-gray-700 min-w-[100px] text-center">
                {flow.to}
              </span>
              <span className="text-gray-400 text-xs">{flow.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extension Points */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Точки расширения (post-MVP)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'DoQA Context Stage', desc: 'Сбор контекста из DoQA', status: 'future' },
            { name: 'Codebase Agent', desc: 'Анализ кодовой базы', status: 'future' },
            { name: 'Impact Analysis', desc: 'Влияние изменений', status: 'future' },
            { name: 'Test Case Generation', desc: 'Генерация тест-кейсов', status: 'future' },
            { name: 'DoQA Review', desc: 'Ревью по правилам DoQA v1.10.0', status: 'future' },
            { name: 'DoQA Import', desc: 'Импорт в DoQA', status: 'future' },
            { name: 'Redmine Integration', desc: 'Интеграция с Redmine', status: 'future' },
            { name: 'Web UI', desc: 'Веб-интерфейс', status: 'future' },
          ].map((ext) => (
            <div key={ext.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <span className="px-2 py-0.5 text-[10px] rounded bg-gray-700 text-gray-400 uppercase">{ext.status}</span>
              <div>
                <div className="text-sm font-medium text-gray-300">{ext.name}</div>
                <div className="text-xs text-gray-500">{ext.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
