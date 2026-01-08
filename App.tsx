import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Workspace from './features/Workspace';
import PromptLibsWorkspace from './features/PromptLibsWorkspace';
import SettingsModal from './components/SettingsModal';
import ApiKeyModal from './components/ApiKeyModal';
import { getHistory, clearHistory, deleteHistoryItem } from './services/db';
import { TaskType, HistoryItem, AppMode } from './types';
import { usePWAInstall } from './hooks/usePWAInstall';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<TaskType>(TaskType.RESEARCH);
  const [loadedHistoryItem, setLoadedHistoryItem] = useState<any>(null);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.CRAFT);

  const { isInstallable, installApp } = usePWAInstall();

  useEffect(() => {
    refreshHistory();
  }, []);

  const refreshHistory = async () => {
    const items = await getHistory();
    setHistory(items);
  };

  const handleClearHistory = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?")) {
      await clearHistory();
      refreshHistory();
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    // Set activeTab first to ensure proper form renders
    if (item.type) {
      setActiveTab(item.type);
    }
    setLoadedHistoryItem(item.data);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteHistoryItem(id);
    refreshHistory();
  };

  const handleToggleAppMode = () => {
    setAppMode(prev => prev === AppMode.CRAFT ? AppMode.LIBS : AppMode.CRAFT);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background relative transition-colors duration-300">
      {/* Background decoration pattern */}
      <div className="absolute inset-0 opacity-0 dark:opacity-10 pointer-events-none mix-blend-overlay bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <Sidebar
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onOpenSettings={() => setSettingsOpen(true)}
        currentTab={activeTab}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        appMode={appMode}
        onToggleAppMode={handleToggleAppMode}
      />

      <div className="flex-1 flex flex-col h-full relative z-10 glass-effect rounded-l-3xl overflow-hidden ml-0 md:ml-4 my-0 md:my-4 mr-0 md:mr-4 border border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Mobile floating buttons */}
        <div className="md:hidden fixed bottom-28 left-6 z-50 flex flex-col gap-3">
          {isInstallable && (
            <button
              className="p-3 rounded-full bg-gradient-to-r from-primary to-purple-600 border border-white/20 text-white shadow-lg shadow-primary/30 backdrop-blur-xl active:scale-95 transition-transform"
              onClick={installApp}
              title="Tải App"
            >
              <span className="material-symbols-rounded text-2xl">download</span>
            </button>
          )}
          <button
            className="p-3 rounded-full bg-primary/90 border border-white/20 text-white shadow-lg shadow-primary/30 backdrop-blur-xl active:scale-95 transition-transform"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-rounded text-2xl">menu</span>
          </button>
        </div>

        {/* Conditional Workspace Render */}
        {appMode === AppMode.CRAFT ? (
          <Workspace
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onRefreshHistory={refreshHistory}
            initialData={loadedHistoryItem}
            onMissingKey={() => setApiKeyModalOpen(true)}
          />
        ) : (
          <PromptLibsWorkspace />
        )}
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenKeyManager={() => setApiKeyModalOpen(true)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onKeySaved={() => { }}
      />
    </div>
  );
};

export default App;