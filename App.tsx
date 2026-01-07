import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Workspace from './features/Workspace';
import SettingsModal from './components/SettingsModal';
import ApiKeyModal from './components/ApiKeyModal';
import { getHistory, clearHistory, deleteHistoryItem } from './services/db';
import { TaskType, HistoryItem } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<TaskType>(TaskType.RESEARCH);
  const [loadedHistoryItem, setLoadedHistoryItem] = useState<any>(null);

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

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        history={history}
        onSelectHistory={handleSelectHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
        onOpenSettings={() => setSettingsOpen(true)}
        currentTab={activeTab}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full relative">
        <button
          className="md:hidden absolute top-3 left-4 z-20 bg-surface p-2 rounded-full shadow-lg border border-slate-700 text-slate-200"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="material-symbols-rounded">menu</span>
        </button>

        <Workspace
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefreshHistory={refreshHistory}
          initialData={loadedHistoryItem}
          onMissingKey={() => setApiKeyModalOpen(true)}
        />
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