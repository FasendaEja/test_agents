import { useState } from 'react';
import { Play, CheckCircle, XCircle, RotateCcw, Pause, ArrowRight, AlertCircle } from 'lucide-react';

type StageStatus = 'idle' | 'running' | 'waiting' | 'approved' | 'rejected';

interface StageState {
  name: string;
  num: number;
  status: StageStatus;
  result?: string;
  iteration: number;
}

const initialStages: StageState[] = [
  { name: 'Получение требований', num: 1, status: 'idle', iteration: 0 },
  { name: 'Формирование дельты', num: 2, status: 'idle', iteration: 0 },
  { name: 'Подтверждение дельты', num: 3, status: 'idle', iteration: 0 },
  { name: 'Анализ требований', num: 4, status: 'idle', iteration: 0 },
  { name: 'Mind-map', num: 5, status: 'idle', iteration: 0 },
  { name: 'Чек-лист', num: 6, status: 'idle', iteration: 0 },
];

const stageResults: Record<number, string> = {
  1: '✅ Загружено 3 файла: requirements.md, api-spec.json, changelog.txt\n📄 Нормализовано 47 требований\n⚠️ Пропущен 1 файл: image.png (неподдерживаемый формат)',
  2: '📊 Найдено 12 изменений:\n  • 4 добавлено\n  • 5 изменено\n  • 2 удалено\n  • 1 перемещён\n\n🔍 Семантическое сравнение завершено',
  3: '👤 Ожидание подтверждения дельты...\n\nДоступные действия:\n  • approve — принять дельту\n  • reject — отклонить\n  • rerun — перезапустить с комментарием',
  4: '📋 Анализ завершён:\n  • Полнота: 78%\n  • Тестируемость: 82%\n  • Проблем: 5\n  • Вопросов: 3\n  • Рисков: 2\n\n📝 Markdown-отчёт сформирован',
  5: '🗺️ Mind-map сформирован:\n  • 4 основных блока\n  • 12 узлов\n  • Привязка к delta_id: 10/12\n\nФорматы: Markdown + Mermaid',
  6: '✅ Чек-лист готов:\n  • 24 проверки\n  • Категории: positive(8), negative(6), boundary(4), regression(4), integration(2)\n  • Приоритеты: high(8), medium(10), low(6)\n\n🏁 MVP завершён!',
};

const statusConfig: Record<StageStatus, { icon: React.ReactNode; color: string; label: string }> = {
  idle: { icon: <div className="w-3 h-3 rounded-full bg-gray-600" />, color: 'text-gray-400', label: 'Ожидает' },
  running: { icon: <RotateCcw size={14} className="animate-spin text-blue-400" />, color: 'text-blue-400', label: 'Выполняется' },
  waiting: { icon: <Pause size={14} className="text-amber-400" />, color: 'text-amber-400', label: 'Ожидает подтверждения' },
  approved: { icon: <CheckCircle size={14} className="text-emerald-400" />, color: 'text-emerald-400', label: 'Подтверждён' },
  rejected: { icon: <XCircle size={14} className="text-red-400" />, color: 'text-red-400', label: 'Отклонён' },
};

export function Demo() {
  const [stages, setStages] = useState<StageState[]>(initialStages);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [comment, setComment] = useState('');

  const runStage = (stageNum: number) => {
    setIsRunning(true);
    setActiveStage(stageNum);
    
    // Set running
    setStages(prev => prev.map(s => 
      s.num === stageNum ? { ...s, status: 'running', iteration: s.iteration + 1 } : s
    ));

    // Simulate processing
    setTimeout(() => {
      setStages(prev => prev.map(s => 
        s.num === stageNum ? { ...s, status: 'waiting', result: stageResults[stageNum] } : s
      ));
      setIsRunning(false);
    }, 1500);
  };

  const approveStage = (stageNum: number) => {
    setStages(prev => prev.map(s => 
      s.num === stageNum ? { ...s, status: 'approved' } : s
    ));
    setActiveStage(null);
  };

  const rejectStage = (stageNum: number) => {
    setStages(prev => prev.map(s => 
      s.num === stageNum ? { ...s, status: 'rejected' } : s
    ));
    setActiveStage(null);
  };

  const rerunStage = (stageNum: number) => {
    if (!comment.trim()) return;
    setComment('');
    runStage(stageNum);
  };

  const resetDemo = () => {
    setStages(initialStages);
    setActiveStage(null);
    setIsRunning(false);
    setComment('');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Демо процесса</h2>
          <p className="text-gray-400">
            Интерактивная демонстрация прохождения этапов MVP. Нажмите «Запустить» для каждого этапа.
          </p>
        </div>
        <button
          onClick={resetDemo}
          className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
        >
          Сбросить
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-1">
          {stages.map((stage, i) => (
            <div key={stage.num} className="flex items-center flex-1">
              <div className={`flex-1 h-2 rounded-full ${
                stage.status === 'approved' ? 'bg-emerald-500' :
                stage.status === 'running' ? 'bg-blue-500 animate-pulse' :
                stage.status === 'waiting' ? 'bg-amber-500' :
                stage.status === 'rejected' ? 'bg-red-500' :
                'bg-gray-700'
              }`} />
              {i < stages.length - 1 && <div className="w-1" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {stages.map(stage => (
            <span key={stage.num} className="text-[10px] text-gray-500">#{stage.num}</span>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {stages.map((stage) => {
          const config = statusConfig[stage.status];
          const canRun = stage.status === 'idle' && (stage.num === 1 || stages[stage.num - 2].status === 'approved');
          const isWaiting = stage.status === 'waiting';
          
          return (
            <div key={stage.num} className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${
              activeStage === stage.num ? 'border-emerald-500/50' : 'border-gray-800'
            }`}>
              <div className="flex items-center gap-4 p-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  stage.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                  stage.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  stage.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                  stage.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {stage.num}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{stage.name}</div>
                  <div className={`text-xs flex items-center gap-1 ${config.color}`}>
                    {config.icon}
                    {config.label}
                    {stage.iteration > 0 && <span className="text-gray-500 ml-2">(итерация {stage.iteration})</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canRun && (
                    <button
                      onClick={() => runStage(stage.num)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      <Play size={12} />
                      Запустить
                    </button>
                  )}
                  {isWaiting && (
                    <>
                      <button
                        onClick={() => approveStage(stage.num)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                      >
                        <CheckCircle size={12} />
                        Подтвердить
                      </button>
                      <button
                        onClick={() => rejectStage(stage.num)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                      >
                        <XCircle size={12} />
                        Отклонить
                      </button>
                    </>
                  )}
                  {stage.status === 'rejected' && (
                    <button
                      onClick={() => runStage(stage.num)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Перезапустить
                    </button>
                  )}
                </div>
              </div>

              {/* Result */}
              {stage.result && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap bg-gray-950 rounded-lg p-3">
                    {stage.result}
                  </pre>
                </div>
              )}

              {/* Rerun with comment */}
              {isWaiting && stage.num === 3 && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-400" />
                    <span className="text-xs text-gray-400">Перезапуск с комментарием:</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Введите комментарий..."
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                      onClick={() => rerunStage(stage.num)}
                      disabled={!comment.trim()}
                      className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MVP Stop */}
      {stages.every(s => s.status === 'approved') && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🏁</div>
          <h3 className="text-xl font-bold text-emerald-400 mb-2">MVP завершён!</h3>
          <p className="text-gray-400 text-sm">
            Все 6 этапов пройдены. Система остановлена. Дальнейшие этапы (DoQA, генерация кейсов) не реализованы в MVP.
          </p>
        </div>
      )}
    </div>
  );
}
