import React from 'react';
import { useApp } from '../contexts/AppContext';
import { AppLanguage } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenKeyManager: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenKeyManager }) => {
    const { settings, updateSettings, t } = useApp();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
            <div className="bg-surface/90 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-primary/10 overflow-hidden">
                <div className="p-4 border-b border-border dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                    <h2 className="text-lg font-bold text-main/90 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-rounded">settings</span> {t('settings.title')}
                    </h2>
                    <button onClick={onClose} className="text-main/50 dark:text-slate-400 hover:text-main dark:hover:text-white transition-colors">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* API Key Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-secondary uppercase">{t('settings.account')}</h3>
                        <div className="bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <span className="material-symbols-rounded">key</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-main/90 dark:text-white">Gemini API Key</p>
                                    <p className="text-xs text-secondary">{t('settings.key_manager')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { onClose(); onOpenKeyManager(); }}
                                className="text-xs bg-white border border-border dark:bg-white/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-main dark:text-white px-3 py-1.5 rounded-lg transition shadow-sm"
                            >
                                {t('settings.manage')}
                            </button>
                        </div>
                    </div>

                    {/* General Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-secondary uppercase">{t('settings.interface')}</h3>

                        {/* Theme */}
                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-main/80">{t('settings.theme')}</span>
                            <div className="flex bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => updateSettings({ theme: 'dark' })}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${settings.theme === 'dark' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-main/50 dark:text-slate-400 hover:text-main dark:hover:text-white'}`}
                                >
                                    <span className="material-symbols-rounded text-sm">dark_mode</span>
                                    {t('settings.theme.dark')}
                                </button>
                                <button
                                    onClick={() => updateSettings({ theme: 'light' })}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${settings.theme === 'light' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-main/50 dark:text-slate-400 hover:text-main dark:hover:text-white'}`}
                                >
                                    <span className="material-symbols-rounded text-sm">light_mode</span>
                                    {t('settings.theme.light')}
                                </button>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between py-1">
                            <span className="text-sm text-main/80">{t('settings.language')}</span>
                            <div className="flex bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => updateSettings({ language: AppLanguage.VI })}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${settings.language === AppLanguage.VI ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-main/50 dark:text-slate-400 hover:text-main dark:hover:text-white'}`}
                                >
                                    Tiếng Việt
                                </button>
                                <button
                                    onClick={() => updateSettings({ language: AppLanguage.EN })}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${settings.language === AppLanguage.EN ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-main/50 dark:text-slate-400 hover:text-main dark:hover:text-white'}`}
                                >
                                    English
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border dark:border-white/10 text-center">
                        <p className="text-xs text-secondary">PromptCraft v1.1.0 (PWA)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
