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
            <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-secondary hover:text-primary">
                    <span className="material-symbols-rounded">close</span>
                </button>

                <h2 className="text-xl font-bold text-main mb-2 flex items-center gap-2">
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
                                className="w-full bg-background border border-border rounded-lg p-3 text-main focus:ring-2 focus:ring-primary outline-none pr-10 placeholder-secondary/50"
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
                            className="px-4 py-2 bg-background border border-border hover:bg-surface text-main/80 rounded-lg transition text-sm font-medium disabled:opacity-50"
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
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status === 'success' ? 'bg-green-500/20 text-green-500' : status === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-background text-secondary'}`}>
                            {status === 'success' && <span className="material-symbols-rounded">check_circle</span>}
                            {status === 'error' && <span className="material-symbols-rounded">error</span>}
                            {status === 'idle' && <span className="material-symbols-rounded animate-spin">sync</span>}
                            {message}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-border text-xs text-secondary text-center">
                    {t('apikey.no_key')} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">{t('apikey.get_here')}</a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
