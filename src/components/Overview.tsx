import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export function Overview() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-3">QA Agent MVP</h2>
        <p className="text-gray-300 text-lg mb-4">
          Агентная система для анализа требований и подготовки первичных проверок
        </p>
        <p className="text-gray-400">
          Система позволяет загрузить требования, получить дельту изменений, проанализировать 
          тестируемость, сформировать mind-map и чек-лист проверок — с подтверждением каждого этапа человеком.
        </p>
      </div>

      {/* Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Что входит в MVP
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              'Прием требований из текста, файла или папки',
              'Поддержку старой версии требований',
              'Сравнение и формирование дельты',
              'Подтверждение дельты человеком',
              'Анализ на полноту, тестируемость, противоречия',
              'Формирование mind-map доработки',
              'Формирование чек-листа проверок',
              'Остановку после каждого этапа',
              'Повторный запуск с комментариями',
              'Сохранение в PostgreSQL',
              'Артефакты в файловой системе',
              'Минимальный CLI-интерфейс',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <XCircle size={20} />
            Что НЕ входит в MVP
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              'Интеграция с DoQA',
              'Получение кейсов из DoQA',
              'Импорт тест-кейсов',
              'Генерация тест-кейсов',
              'Ревью тест-кейсов по правилам DoQA',
              'Применение правил DoQA v1.10.0',
              'Интеграция с Redmine',
              'Доступ к кодовой базе',
              'Внешний агент кодовой базы',
              'Определение новых/устаревших кейсов',
              'Запуск автотестов',
              'Статусы "Ревью" и "Архив"',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pipeline Steps */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Этапы MVP</h3>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { num: 1, label: 'Получение требований', className: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' },
            { num: 2, label: 'Дельта изменений', className: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' },
            { num: 3, label: 'Подтверждение', className: 'bg-blue-500/20 border-blue-500/30 text-blue-400' },
            { num: 4, label: 'Анализ требований', className: 'bg-purple-500/20 border-purple-500/30 text-purple-400' },
            { num: 5, label: 'Mind-map', className: 'bg-amber-500/20 border-amber-500/30 text-amber-400' },
            { num: 6, label: 'Чек-лист', className: 'bg-rose-500/20 border-rose-500/30 text-rose-400' },
          ].map((step, i) => (
            <div key={step.num} className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${step.className}`}>
                <span className="text-xs opacity-70">#{step.num}</span> {step.label}
              </div>
              {i < 5 && <ArrowRight size={16} className="text-gray-600" />}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <AlertTriangle size={14} className="text-amber-400" />
          <span>После каждого этапа — остановка для подтверждения человеком</span>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Технологический стек</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Python 3.11+', desc: 'Основной язык', icon: '🐍' },
            { name: 'LangGraph', desc: 'Оркестрация', icon: '🔗' },
            { name: 'Pydantic v2', desc: 'Типизация', icon: '📐' },
            { name: 'PostgreSQL 15+', desc: 'СУБД', icon: '🗄️' },
            { name: 'SQLAlchemy 2.x', desc: 'ORM', icon: '⚡' },
            { name: 'Alembic', desc: 'Миграции', icon: '🔄' },
            { name: 'Typer/Click', desc: 'CLI', icon: '💻' },
            { name: 'OpenAI SDK', desc: 'LLM клиент', icon: '🤖' },
          ].map((tech) => (
            <div key={tech.name} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="text-2xl mb-1">{tech.icon}</div>
              <div className="text-sm font-medium text-white">{tech.name}</div>
              <div className="text-xs text-gray-400">{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Principles */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ключевые принципы</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Human-in-the-loop',
              desc: 'Каждый этап требует подтверждения человека. Автоматический переход запрещён.',
              icon: '👤',
            },
            {
              title: 'Объяснимость',
              desc: 'Каждый этап возвращает rationale: источники, допущения, риски, уверенность.',
              icon: '🔍',
            },
            {
              title: 'Расширяемость',
              desc: 'Архитектура готова к добавлению этапов 7-12 без переписывания.',
              icon: '🧩',
            },
          ].map((p) => (
            <div key={p.title} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
              <div className="text-2xl mb-2">{p.icon}</div>
              <h4 className="font-medium text-white mb-1">{p.title}</h4>
              <p className="text-sm text-gray-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
