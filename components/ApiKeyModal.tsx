import React, { useState, useEffect } from 'react';
import { saveApiKey, getApiKey, deleteApiKey } from '../services/db';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../contexts/AppContext';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeySaved: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
    const [inputKey, setInputKey] = useState('');
    const [existingKey, setExistingKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const { t } = useApp();

    useEffect(() => {
        if (isOpen) {
            checkExistingKey();
            setStatus('idle');
            setMessage('');
            setInputKey('');
        }
    }, [isOpen]);

    const checkExistingKey = async () => {
        const key = await getApiKey();
        setExistingKey(!!key);
    };

    const handleSave = async () => {
        if (!inputKey.trim()) {
            setStatus('error');
            setMessage(t('common.required'));
            return;
        }

        setLoading(true);
        try {
            await saveApiKey(inputKey.trim());
            setExistingKey(true);
            setStatus('success');
            setMessage(t('apikey.msg_saved'));
            setTimeout(() => {
                onKeySaved();
                onClose();
            }, 1000);
        } catch (e) {
            setStatus('error');
            setMessage(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleTestKey = async () => {
        if (!inputKey.trim() && !existingKey) return;

        setLoading(true);
        setMessage("Checking...");
        setStatus('idle');

        try {
            const keyToTest = inputKey.trim() || await getApiKey();
            if (!keyToTest) throw new Error("No key found");

            // Simple test call with stable model
            const ai = new GoogleGenAI({ apiKey: keyToTest });
            const model = "gemini-3-flash-preview";
            await ai.models.generateContent({
                model: model,
                contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
            });

            setStatus('success');
            setMessage(t('apikey.msg_success'));
        } catch (e) {
            setStatus('error');
            setMessage(t('apikey.msg_error'));
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm(t('apikey.confirm_delete'))) {
            await deleteApiKey();
            setExistingKey(false);
            setInputKey('');
            setMessage("Deleted.");
            setStatus('idle');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-surface/90 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-primary/10 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-main/50 dark:text-slate-400 hover:text-main dark:hover:text-white transition-colors">
                    <span className="material-symbols-rounded">close</span>
                </button>

                <h2 className="text-xl font-bold text-main/90 dark:text-main mb-2 flex items-center gap-2">
                    <span className="material-symbols-rounded text-primary">key</span>
                    {t('apikey.title')}
                </h2>

                <p className="text-secondary text-sm mb-6">
                    {t('apikey.desc')}
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-secondary uppercase mb-1">API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                placeholder={existingKey ? t('apikey.placeholder_exist') : t('apikey.placeholder_empty')}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-3 text-main dark:text-white focus:ring-2 focus:ring-primary focus:bg-white/50 dark:focus:bg-white/10 outline-none pr-10 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                            />
                            {existingKey && !inputKey && (
                                <div className="absolute right-3 top-3 text-green-500 flex items-center gap-1 text-xs bg-green-500/10 px-2 py-0.5 rounded">
                                    <span className="material-symbols-rounded text-sm">check_circle</span>
                                    {t('apikey.saved')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={handleTestKey}
                            disabled={loading || (!inputKey && !existingKey)}
                            className="px-4 py-2 bg-white border border-border dark:bg-white/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-main dark:text-white rounded-lg transition text-sm font-medium disabled:opacity-50"
                        >
                            {t('apikey.test')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !inputKey}
                            className="flex-1 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition text-sm font-bold disabled:opacity-50"
                        >
                            {loading ? '...' : t('apikey.save_btn')}
                        </button>
                    </div>

                    {existingKey && (
                        <button
                            onClick={handleDelete}
                            className="w-full text-red-400 hover:text-red-500 text-xs py-2 hover:underline text-left"
                        >
                            {t('apikey.delete_btn')}
                        </button>
                    )}

                    {/* Status Message */}
                    {message && (
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status === 'success' ? 'bg-green-500/20 text-green-500' : status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-slate-300'}`}>
                            {status === 'success' && <span className="material-symbols-rounded">check_circle</span>}
                            {status === 'error' && <span className="material-symbols-rounded">error</span>}
                            {status === 'idle' && <span className="material-symbols-rounded animate-spin">sync</span>}
                            {message}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-border dark:border-white/10 text-xs text-secondary text-center">
                    {t('apikey.no_key')} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('apikey.get_here')}</a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
