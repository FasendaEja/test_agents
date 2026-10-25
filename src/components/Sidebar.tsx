import { Section } from '../App';
import {
  LayoutDashboard,
  GitBranch,
  Network,
  Database,
  FolderTree,
  Settings,
  Play,
  TestTube,
  Rocket,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  isOpen: boolean;
}

const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Обзор', icon: <LayoutDashboard size={18} /> },
  { id: 'pipeline', label: 'Граф процесса', icon: <GitBranch size={18} /> },
  { id: 'architecture', label: 'Архитектура', icon: <Network size={18} /> },
  { id: 'schemas', label: 'Схемы данных', icon: <Database size={18} /> },
  { id: 'structure', label: 'Структура проекта', icon: <FolderTree size={18} /> },
  { id: 'config', label: 'Конфигурация', icon: <Settings size={18} /> },
  { id: 'demo', label: 'Демо процесса', icon: <Play size={18} /> },
  { id: 'tests', label: 'Тесты', icon: <TestTube size={18} /> },
  { id: 'deployment', label: 'Развертывание', icon: <Rocket size={18} /> },
  { id: 'prompts', label: 'Промпты агентов', icon: <MessageSquare size={18} /> },
];

export function Sidebar({ activeSection, setActiveSection, isOpen }: SidebarProps) {
  return (
    <aside
      className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 overflow-hidden flex-shrink-0 ${
        isOpen ? 'w-64' : 'w-0'
      }`}
    >
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeSection === item.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {item.icon}
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 mt-auto border-t border-gray-800">
        <div className="text-xs text-gray-500 space-y-1">
          <p>Стек: Python + LangGraph</p>
          <p>LLM: qwen3.8 (OpenAI-compatible)</p>
          <p>СУБД: PostgreSQL 15+</p>
        </div>
      </div>
    </aside>
  );
}
