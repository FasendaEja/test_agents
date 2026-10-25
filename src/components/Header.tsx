import { Menu, X, Bot } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4 sticky top-0 z-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">QA Agent MVP</h1>
          <p className="text-xs text-gray-400">Агентная система анализа требований • v0.2</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          MVP-0.2
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Python 3.11+
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          LangGraph
        </span>
      </div>
    </header>
  );
}
