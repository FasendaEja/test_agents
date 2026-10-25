import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Overview } from './components/Overview';
import { Pipeline } from './components/Pipeline';
import { Architecture } from './components/Architecture';
import { Schemas } from './components/Schemas';
import { ProjectStructure } from './components/ProjectStructure';
import { Config } from './components/Config';
import { Demo } from './components/Demo';
import { Tests } from './components/Tests';
import { Deployment } from './components/Deployment';
import { PromptsEditor } from './components/PromptsEditor';
import { Roadmap } from './components/Roadmap';
import { CodeExplorer } from './components/CodeExplorer';

export type Section = 'overview' | 'pipeline' | 'architecture' | 'schemas' | 'structure' | 'config' | 'demo' | 'tests' | 'deployment' | 'prompts' | 'roadmap' | 'code';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <Overview />;
      case 'pipeline': return <Pipeline />;
      case 'architecture': return <Architecture />;
      case 'schemas': return <Schemas />;
      case 'structure': return <ProjectStructure />;
      case 'config': return <Config />;
      case 'demo': return <Demo />;
      case 'tests': return <Tests />;
      case 'deployment': return <Deployment />;
      case 'prompts': return <PromptsEditor />;
      case 'roadmap': return <Roadmap />;
      case 'code': return <CodeExplorer />;
      default: return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} isOpen={sidebarOpen} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
