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
        fixed md:relative z-30 w-64 h-full bg-surface border-r border-border flex flex-col transition-transform duration-300 shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <span className="material-symbols-rounded">auto_awesome</span>
            <span>PromptCraft</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-secondary">
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 mb-2 mt-2">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{t('sidebar.history')}</span>
            {history.length > 0 && (
              <button onClick={onClearHistory} className="text-xs text-red-400 hover:text-red-300 dark:hover:text-red-400">{t('common.delete')}</button>
            )}
          </div>

          <div className="space-y-1">
            {history.length === 0 && (
              <div className="px-4 py-8 text-center text-secondary text-sm italic">
                {t('sidebar.empty')}
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
                  className="w-full text-left p-2 rounded hover:bg-background/80 group flex items-start gap-3 transition border border-transparent hover:border-border relative"
                >
                  <button
                    onClick={() => {
                      onSelectHistory(item);
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className="flex items-start gap-3 flex-1 text-left"
                  >
                    <span className="material-symbols-rounded text-secondary group-hover:text-primary mt-0.5 text-lg">
                      {getIcon(item.type)}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-sm text-main group-hover:text-primary truncate font-medium">
                        {categoryName}
                      </p>
                      <p className="text-xs text-secondary truncate">
                        {timeStr} - {dateStr}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteHistoryItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-red-500 p-1 shrink-0"
                    title={t('common.delete')}
                  >
                    <span className="material-symbols-rounded text-base">close</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-2 bg-background/30">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 p-2 rounded text-secondary hover:bg-background hover:text-primary transition"
          >
            <span className="material-symbols-rounded">settings</span>
            <span className="text-sm font-medium">{t('sidebar.settings')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
