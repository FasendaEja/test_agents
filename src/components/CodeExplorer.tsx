import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Download, FileCode, Folder } from 'lucide-react';
import { projectModules, type CodeFile, type CodeModule } from '../data/codeFiles';
import { projectModulesPart2 } from '../data/codeFiles2';
import { projectModulesPart3 } from '../data/codeFiles3';

const allModules: CodeModule[] = [
  ...projectModules,
  ...projectModulesPart2,
  ...projectModulesPart3,
];

function CodeBlock({ file }: { file: CodeFile }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(file.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden">
      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-gray-400" />
          <span className="font-mono text-sm text-emerald-400">{file.path}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">{file.language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-500 px-2 pb-2">{file.description}</p>
        <pre className="bg-gray-950 rounded p-3 text-xs text-gray-300 overflow-x-auto font-mono max-h-[500px] overflow-y-auto">
          <code>{file.code}</code>
        </pre>
      </div>
    </div>
  );
}

function ModuleSection({ module }: { module: CodeModule }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/30 transition-colors"
      >
        <span className="text-2xl">{module.icon}</span>
        <div className="flex-1 text-left">
          <div className="font-medium text-white">{module.name}</div>
          <div className="text-xs text-gray-500">{module.description} • {module.files.length} файлов</div>
        </div>
        {isOpen ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-gray-800">
          {module.files.map(file => (
            <CodeBlock key={file.path} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CodeExplorer() {
  const [expandedAll, setExpandedAll] = useState(false);
  const totalFiles = allModules.reduce((sum, m) => sum + m.files.length, 0);

  const handleDownloadAll = () => {
    let content = '';
    allModules.forEach(module => {
      content += `\n${'='.repeat(80)}\n# ${module.name}\n${'='.repeat(80)}\n\n`;
      module.files.forEach(file => {
        content += `\n${'-'.repeat(80)}\n# ${file.path}\n${'-'.repeat(80)}\n\n`;
        content += file.code + '\n';
      });
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qa-agent-mvp-code.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Исходный код MVP</h2>
          <p className="text-gray-400">
            Полный рабочий код всех {totalFiles} файлов Python-проекта QA Agent MVP. 
            Копируйте файлы и собирайте проект.
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
        >
          <Download size={16} />
          Скачать всё
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Модулей</div>
          <div className="text-2xl font-bold text-emerald-400">{allModules.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Файлов</div>
          <div className="text-2xl font-bold text-cyan-400">{totalFiles}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Строк кода</div>
          <div className="text-2xl font-bold text-purple-400">
            {allModules.reduce((sum, m) => sum + m.files.reduce((s, f) => s + f.code.split('\n').length, 0), 0)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Готовность</div>
          <div className="text-2xl font-bold text-amber-400">100%</div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {allModules.map(module => (
          <ModuleSection key={module.name} module={module} />
        ))}
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">🚀 Как использовать этот код</h3>
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Создайте директорию проекта: <code className="text-cyan-400">mkdir qa-agent-mvp && cd qa-agent-mvp</code></li>
          <li>Скопируйте каждый файл в соответствующую директорию</li>
          <li>Создайте виртуальное окружение: <code className="text-cyan-400">python3.11 -m venv venv</code></li>
          <li>Установите зависимости: <code className="text-cyan-400">pip install -e .</code></li>
          <li>Настройте <code className="text-cyan-400">.env</code> (API ключ, PostgreSQL)</li>
          <li>Запустите PostgreSQL и примените миграции</li>
          <li>Запустите: <code className="text-cyan-400">qa-agent run --current ./requirements/current</code></li>
        </ol>
      </div>
    </div>
  );
}
