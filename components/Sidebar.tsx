import React from 'react';
import { HistoryItem, TaskType } from '../types';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onOpenSettings: () => void;
  currentTab: TaskType;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  history, onSelectHistory, onDeleteHistoryItem, onClearHistory, onOpenSettings, isOpen, toggleSidebar
}) => {
  const { t } = useApp();

  const getIcon = (type: TaskType) => {
    switch (type) {
      case TaskType.RESEARCH: return 'science';
      case TaskType.IMAGE: return 'image';
      case TaskType.VIDEO: return 'movie';
      case TaskType.OUTLINE: return 'format_list_bulleted';
      case TaskType.MUSIC: return 'music_note';
      default: return 'edit';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed md:relative z-30 w-72 h-[100dvh] flex flex-col transition-transform duration-300 bg-surface border-r border-border
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-purple-600 rounded-xl shadow-lg shadow-primary/20">
              <span className="material-symbols-rounded text-white text-xl">auto_awesome</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-white dark:to-slate-400 font-heading tracking-tight">
              PromptCraft
            </span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-secondary hover:text-white transition-colors">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-thin">
          <div className="flex items-center justify-between px-2">
            <span className="text-base font-bold text-slate-700 dark:text-primary uppercase tracking-widest">{t('sidebar.history')}</span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-sm uppercase font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-rounded text-base">delete_sweep</span>
                {t('common.delete')}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {history.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 mx-2">
                <span className="material-symbols-rounded text-4xl text-white/10 mb-2">history</span>
                <p className="text-secondary text-sm italic">{t('sidebar.empty')}</p>
              </div>
            )}
            {history.map((item) => {
              const date = new Date(item.createdAt);
              const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
              const categoryName = item.subtype || item.type;

              return (
                <div
                  key={item.id}
                  className="group relative w-full text-left p-3 rounded-xl transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onSelectHistory(item);
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    <div className="p-2 rounded-md bg-black/5 dark:bg-white/5 text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                      <span className="material-symbols-rounded text-lg">
                        {getIcon(item.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                      <p className="text-sm font-medium text-main/80 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-white truncate w-full text-left transition-colors">
                        {categoryName}
                      </p>
                      <p className="text-xs text-secondary group-hover:text-main/60 dark:group-hover:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        {timeStr}
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        {dateStr}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all translate-x-2 group-hover:translate-x-0"
                    title={t('common.delete')}
                  >
                    <span className="material-symbols-rounded text-sm">close</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings Footer */}
        <div className="p-4 mt-auto">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-700 dark:text-slate-400 hover:text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all group"
          >
            <span className="material-symbols-rounded group-hover:rotate-45 transition-transform duration-500">settings</span>
            <span className="text-sm font-medium">{t('sidebar.settings')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
