import React, { useState, useEffect } from 'react';
import { TaskType, PromptOutput, PromptFormat } from '../types';
import { generateOptimizedPrompt } from '../services/gemini';
import { saveHistory } from '../services/db';
import FileUpload from '../components/FileUpload';
import { useApp } from '../contexts/AppContext';

interface WorkspaceProps {
    activeTab: TaskType;
    setActiveTab: (tab: TaskType) => void;
    onRefreshHistory: () => void;
    initialData?: PromptOutput | null;
    onMissingKey: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ activeTab, setActiveTab, onRefreshHistory, initialData, onMissingKey }) => {
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [subtype, setSubtype] = useState<string>('default');
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<PromptOutput | null>(null);
    const [outputMode, setOutputMode] = useState<PromptFormat>(PromptFormat.TEXT);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showMobileResult, setShowMobileResult] = useState(false);
    const { t, settings } = useApp();

    // Load initial data (from history)
    useEffect(() => {
        if (initialData) {
            try {
                setInputs(initialData.inputs_raw || {});
                setOutput(initialData);
                // Set subtype from meta, or infer default based on task type
                const taskType = initialData.meta?.type || activeTab;
                let defaultSubtype = 'default';
                if (taskType === TaskType.IMAGE) defaultSubtype = 'Generate';
                else if (taskType === TaskType.VIDEO) defaultSubtype = 'Prompt';
                setSubtype(initialData.meta?.subtype || defaultSubtype);
            } catch (e) {
                console.error('Error loading history:', e);
                setInputs({});
                setOutput(null);
            }
        } else {
            setInputs({});
            setOutput(null);
            if (activeTab === TaskType.IMAGE) setSubtype('Generate');
            else if (activeTab === TaskType.VIDEO) setSubtype('Prompt');
            else setSubtype('default');
            setShowAdvanced(false);
        }
    }, [initialData, activeTab]);

    const handleInputChange = (field: string, value: any) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Pass current language setting to Gemini
            const result = await generateOptimizedPrompt(activeTab, subtype, inputs, settings.language);
            setOutput(result);
            setShowMobileResult(true);

            const title = inputs.topic || inputs.description || inputs.prompt || `Prompt ${new Date().toLocaleTimeString()}`;
            await saveHistory({
                id: crypto.randomUUID(),
                title: typeof title === 'string' ? title.substring(0, 30) : 'Untitled',
                type: activeTab,
                subtype,
                createdAt: Date.now(),
                data: result
            });
            onRefreshHistory();

        } catch (error) {
            console.error(error);
            const errMsg = error instanceof Error ? error.message : String(error);

            if (errMsg.includes("MISSING_API_KEY")) {
                onMissingKey();
            } else {
                alert(t('error.general') + errMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExtendVideo = (basePrompt: string) => {
        setSubtype('Extend');
        setInputs({
            basePrompt: basePrompt,
            extensionIdea: "",
            keepConsistency: true,
            duration: "5s"
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(t('common.copied'));
    };

    // --- Render Helpers ---

    const renderTabs = () => (
        <div className="flex overflow-x-auto p-0 glass-panel border-b border-white/5 sticky top-0 z-10 w-full shadow-none no-scrollbar backdrop-blur-md">
            {Object.values(TaskType).filter(t => t !== TaskType.MARKETING && t !== TaskType.DATA).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-none px-6 py-4 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-transparent text-secondary hover:text-main hover:bg-white/5'
                        }`}
                >
                    <span className="leading-tight">
                        {tab === TaskType.RESEARCH && t('tab.research')}
                        {tab === TaskType.IMAGE && t('tab.image')}
                        {tab === TaskType.VIDEO && t('tab.video')}
                        {tab === TaskType.OUTLINE && t('tab.outline')}
                        {tab === TaskType.MUSIC && t('tab.music')}
                        {tab === TaskType.CODING && t('tab.coding')}
                        {tab === TaskType.WRITING && t('tab.writing')}
                    </span>
                </button>
            ))}
        </div>
    );

    const renderTargetFormatSelector = () => (
        <div className="mt-4 pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-secondary mb-2">{t('workspace.output_format')}</label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="radio"
                        name="targetFormat"
                        value="Text"
                        checked={inputs.targetFormat !== 'JSON'}
                        onChange={() => handleInputChange('targetFormat', 'Text')}
                        className="text-primary focus:ring-primary bg-surface/50 border-white/10 group-hover:border-primary"
                    />
                    <span className="text-sm text-secondary group-hover:text-main transition-colors">Text</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="radio"
                        name="targetFormat"
                        value="JSON"
                        checked={inputs.targetFormat === 'JSON'}
                        onChange={() => handleInputChange('targetFormat', 'JSON')}
                        className="text-primary focus:ring-primary bg-surface/50 border-white/10 group-hover:border-primary"
                    />
                    <span className="text-sm text-secondary group-hover:text-main transition-colors">JSON</span>
                </label>
            </div>
        </div>
    );

    const renderForm = () => {
        switch (activeTab) {
            case TaskType.RESEARCH:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.topic')}</label>
                            <textarea
                                className="w-full glass-input rounded-xl p-3 outline-none"
                                rows={4}
                                value={inputs.topic || ''}
                                onChange={e => handleInputChange('topic', e.target.value)}
                                placeholder={t('form.topic_ph')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.level')}</label>
                            <select
                                className="w-full glass-input rounded-xl p-3 outline-none [&>option]:bg-surface [&>option]:text-main"
                                value={inputs.depth || 'standard'}
                                onChange={e => handleInputChange('depth', e.target.value)}
                            >
                                <option value="quick">{t('form.level.quick')}</option>
                                <option value="standard">{t('form.level.standard')}</option>
                                <option value="deep">{t('form.level.deep')}</option>
                            </select>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{t('common.advanced')}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder={t('form.timeframe')}
                                    value={inputs.timeframe || ''}
                                    className="glass-input rounded-lg px-3 py-2 text-sm w-full outline-none"
                                    onChange={e => handleInputChange('timeframe', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder={t('form.format_output')}
                                    value={inputs.format || ''}
                                    className="glass-input rounded-lg px-3 py-2 text-sm w-full outline-none"
                                    onChange={e => handleInputChange('format', e.target.value)}
                                />
                            </div>
                        </div>

                    </div>
                );

            case TaskType.IMAGE:
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                            {[
                                { id: 'Generate', label: t('form.img.sub.generate') },
                                { id: 'Analyze', label: t('form.img.sub.analyze') },
                                { id: 'Compose', label: t('form.img.sub.compose') }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => { setSubtype(sub.id); setInputs({}); }}
                                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${subtype === sub.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'}`}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </div>

                        {subtype === 'Compose' ? (
                            <div className="grid grid-cols-2 gap-3">
                                <FileUpload label={t('form.img.context')} initialValue={inputs.contextImg} onFileSelect={f => handleInputChange('contextImg', f)} />
                                <FileUpload label={t('form.img.char')} initialValue={inputs.charImg} onFileSelect={f => handleInputChange('charImg', f)} />
                                <FileUpload label={t('form.img.outfit')} initialValue={inputs.outfitImg} onFileSelect={f => handleInputChange('outfitImg', f)} />
                                <FileUpload label={t('form.img.pose')} initialValue={inputs.poseImg} onFileSelect={f => handleInputChange('poseImg', f)} />
                            </div>
                        ) : (
                            <>
                                {subtype === 'Analyze' && (
                                    <div className="space-y-3">
                                        <FileUpload label={t('form.img.original')} initialValue={inputs.originalImg} onFileSelect={f => handleInputChange('originalImg', f)} />
                                        <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={inputs.useRefFace || false}
                                                className="w-5 h-5 rounded-md bg-white/10 border-white/20 text-primary focus:ring-primary focus:ring-offset-0 hover:border-primary focus:border-primary"
                                                onChange={e => handleInputChange('useRefFace', e.target.checked)}
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t('form.img.use_ref_face')}</span>
                                        </label>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">
                                        {subtype === 'Analyze' ? t('form.img.desc_analyze') : t('form.img.desc_generate')}
                                    </label>
                                    <textarea
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors"
                                        rows={3}
                                        value={inputs.description || ''}
                                        onChange={e => handleInputChange('description', e.target.value)}
                                        placeholder={subtype === 'Analyze' ? t('form.img.desc_ph_analyze') : t('form.img.desc_ph_generate')}
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <select className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-2.5 text-main dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary transition-colors [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.style || ''} onChange={e => handleInputChange('style', e.target.value)}>
                                <option value="">{t('form.img.style')}</option>
                                <option value="photorealistic">Photorealistic</option>
                                <option value="anime">Anime</option>
                                <option value="oil painting">Oil Painting</option>
                                <option value="3d render">3D Render</option>
                            </select>
                            <select className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-2.5 text-main dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary transition-colors [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.ratio || '1:1'} onChange={e => handleInputChange('ratio', e.target.value)}>
                                <option value="1:1">1:1</option>
                                <option value="16:9">16:9</option>
                                <option value="9:16">9:16</option>
                                <option value="4:3">4:3</option>
                                <option value="3:4">3:4</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={inputs.inspire || false} className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary focus:ring-primary hover:border-primary focus:border-primary" onChange={e => handleInputChange('inspire', e.target.checked)} />
                            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('form.img.inspire')}</span>
                        </label>

                    </div>
                );

            case TaskType.VIDEO:
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                            {[
                                { id: 'Prompt', label: t('form.vid.sub.prompt') },
                                { id: 'Img2Video', label: t('form.vid.sub.img2vid') },
                                { id: 'Extend', label: t('form.vid.sub.extend') }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => { setSubtype(sub.id); setInputs({}); setShowAdvanced(false); }}
                                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${subtype === sub.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'}`}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </div>

                        {subtype === 'Img2Video' && (
                            <div className="grid grid-cols-2 gap-3">
                                <FileUpload label={t('form.vid.first_frame')} initialValue={inputs.firstFrame} onFileSelect={f => handleInputChange('firstFrame', f)} />
                                <FileUpload label={t('form.vid.last_frame')} initialValue={inputs.lastFrame} onFileSelect={f => handleInputChange('lastFrame', f)} />
                            </div>
                        )}

                        {subtype === 'Extend' && (
                            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400">{t('form.vid.base_prompt')}</label>
                                <textarea
                                    className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-3 text-main dark:text-white text-sm focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                    rows={3}
                                    value={inputs.basePrompt || ''}
                                    onChange={e => handleInputChange('basePrompt', e.target.value)}
                                    placeholder={t('form.vid.base_prompt_ph')}
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={inputs.keepConsistency !== false} className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary hover:border-primary focus:border-primary" onChange={e => handleInputChange('keepConsistency', e.target.checked)} />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{t('form.vid.consistency')}</span>
                                </label>
                            </div>
                        )}

                        {/* BASIC FIELDS */}
                        <div className="space-y-3">
                            {subtype === 'Extend' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.extend_what')}</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                        rows={2}
                                        value={inputs.extensionIdea || ''}
                                        onChange={e => handleInputChange('extensionIdea', e.target.value)}
                                        placeholder={t('form.vid.extend_ph')}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.idea')}</label>
                                        <textarea
                                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                            rows={2}
                                            value={inputs.description || ''}
                                            onChange={e => handleInputChange('description', e.target.value)}
                                            placeholder={subtype === 'Img2Video' ? t('form.vid.idea_ph_img') : t('form.vid.idea_ph_txt')}
                                        />
                                    </div>

                                    {subtype === 'Prompt' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.env')}</label>
                                                <input type="text" placeholder="Cyberpunk city..." className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500" value={inputs.context || ''} onChange={e => handleInputChange('context', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.subject')}</label>
                                                <input type="text" placeholder="A robot..." className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500" value={inputs.subject || ''} onChange={e => handleInputChange('subject', e.target.value)} />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.audio_gen')}</label>
                                        <input type="text" placeholder="Music, SFX..." className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500" value={inputs.audio_general || ''} onChange={e => handleInputChange('audio_general', e.target.value)} />
                                    </div>
                                </>
                            )}

                            {/* Technical Configs */}
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">{t('form.vid.duration')}</label>
                                    <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.duration || '5s'} onChange={e => handleInputChange('duration', e.target.value)}>
                                        <option value="5s">5s</option>
                                        <option value="8s">8s</option>
                                        <option value="10s">10s</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">{t('form.img.ratio')}</label>
                                    <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.ratio || '16:9'} onChange={e => handleInputChange('ratio', e.target.value)}>
                                        <option value="16:9">16:9</option>
                                        <option value="9:16">9:16</option>
                                        <option value="1:1">1:1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 uppercase font-bold">{t('form.vid.count')}</label>
                                    <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.count || '1'} onChange={e => handleInputChange('count', e.target.value)}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ADVANCED ACCORDION */}
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('common.advanced')}</span>
                                <span className="material-symbols-rounded text-slate-400 transform transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                            </button>

                            {showAdvanced && (
                                <div className="p-4 space-y-4 bg-black/20 border-t border-white/10">
                                    {/* Camera */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.cam_angle')}</label>
                                            <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.camera_angle || ''} onChange={e => handleInputChange('camera_angle', e.target.value)}>
                                                <option value="">Auto</option>
                                                <option value="wide">Wide</option>
                                                <option value="medium">Medium</option>
                                                <option value="closeup">Close-up</option>
                                                <option value="pov">POV</option>
                                                <option value="drone">Drone</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.cam_motion')}</label>
                                            <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-xs outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.camera_motion || ''} onChange={e => handleInputChange('camera_motion', e.target.value)}>
                                                <option value="">Auto</option>
                                                <option value="static">Static</option>
                                                <option value="pan_left">Pan Left</option>
                                                <option value="pan_right">Pan Right</option>
                                                <option value="zoom_in">Zoom In</option>
                                                <option value="dolly">Dolly</option>
                                                <option value="handheld">Handheld</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder={t('form.vid.lighting')} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary placeholder-slate-400 dark:placeholder-slate-500" value={inputs.lighting || ''} onChange={e => handleInputChange('lighting', e.target.value)} />
                                        <input type="text" placeholder={t('form.img.style')} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary placeholder-slate-400 dark:placeholder-slate-500" value={inputs.style || ''} onChange={e => handleInputChange('style', e.target.value)} />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.audio_det')}</label>
                                        <textarea className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-white/10" rows={2} value={inputs.audio_detailed || ''} onChange={e => handleInputChange('audio_detailed', e.target.value)} />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.vid.negative')}</label>
                                        <input type="text" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2 text-main dark:text-white text-xs outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary" value={inputs.negative || ''} onChange={e => handleInputChange('negative', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>


                    </div>
                );

            case TaskType.OUTLINE:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.outline.topic')}</label>
                            <textarea
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                rows={3}
                                value={inputs.topic || ''}
                                onChange={e => handleInputChange('topic', e.target.value)}
                                placeholder="Topic..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder={t('form.outline.audience')} value={inputs.audience || ''} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none" onChange={e => handleInputChange('audience', e.target.value)} />
                            <input type="text" placeholder={t('form.outline.goal')} value={inputs.goal || ''} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none" onChange={e => handleInputChange('goal', e.target.value)} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={inputs.auto_fill || false} className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary focus:ring-primary hover:border-primary focus:border-primary" onChange={e => handleInputChange('auto_fill', e.target.checked)} />
                            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('form.outline.autofill')}</span>
                        </label>

                    </div>
                );

            case TaskType.MUSIC:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.music.topic')}</label>
                            <textarea
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                rows={3}
                                value={inputs.topic || ''}
                                onChange={e => handleInputChange('topic', e.target.value)}
                                placeholder="Lyrics / Topic..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder={t('form.music.genre')} value={inputs.genre || ''} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none" onChange={e => handleInputChange('genre', e.target.value)} />
                            <input type="text" placeholder={t('form.music.mood')} value={inputs.mood || ''} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none" onChange={e => handleInputChange('mood', e.target.value)} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={inputs.suno_ready || false} className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary focus:ring-primary hover:border-primary focus:border-primary" onChange={e => handleInputChange('suno_ready', e.target.checked)} />
                            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('form.music.suno')}</span>
                        </label>

                    </div>
                );

            case TaskType.CODING:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.coding.idea')}</label>
                            <textarea
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                rows={4}
                                value={inputs.idea || ''}
                                onChange={e => handleInputChange('idea', e.target.value)}
                                placeholder={t('form.coding.idea_ph')}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.coding.platform')}</label>
                                <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.platform || 'web'} onChange={e => handleInputChange('platform', e.target.value)}>
                                    <option value="web">{t('form.coding.platform.web')}</option>
                                    <option value="mobile">{t('form.coding.platform.mobile')}</option>
                                    <option value="desktop">{t('form.coding.platform.desktop')}</option>
                                    <option value="cli">{t('form.coding.platform.cli')}</option>
                                    <option value="api">{t('form.coding.platform.api')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.coding.framework')}</label>
                                <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.framework || 'React'} onChange={e => handleInputChange('framework', e.target.value)}>
                                    <option value="React">React</option>
                                    <option value="Vue">Vue</option>
                                    <option value="Next.js">Next.js</option>
                                    <option value="Flutter">Flutter</option>
                                    <option value="React Native">React Native</option>
                                    <option value="Kotlin">Kotlin</option>
                                    <option value="Swift">Swift</option>
                                    <option value="Python">Python</option>
                                    <option value="Node.js">Node.js</option>
                                    <option value="Go">Go</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.coding.database')}</label>
                                <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.database || 'none'} onChange={e => handleInputChange('database', e.target.value)}>
                                    <option value="none">{t('form.coding.database.none')}</option>
                                    <option value="SQLite">SQLite</option>
                                    <option value="PostgreSQL">PostgreSQL</option>
                                    <option value="MongoDB">MongoDB</option>
                                    <option value="Firebase">Firebase</option>
                                    <option value="Supabase">Supabase</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.coding.styling')}</label>
                                <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.styling || 'tailwind'} onChange={e => handleInputChange('styling', e.target.value)}>
                                    <option value="tailwind">Tailwind CSS</option>
                                    <option value="css-modules">CSS Modules</option>
                                    <option value="styled-components">Styled Components</option>
                                    <option value="none">{t('form.coding.styling.none')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.coding.size')}</label>
                            <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.size || 'mvp'} onChange={e => handleInputChange('size', e.target.value)}>
                                <option value="mvp">{t('form.coding.size.mvp')}</option>
                                <option value="medium">{t('form.coding.size.medium')}</option>
                                <option value="complex">{t('form.coding.size.complex')}</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" checked={inputs.auth || false} className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary focus:ring-primary hover:border-primary focus:border-primary" onChange={e => handleInputChange('auth', e.target.checked)} />
                            <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('form.coding.auth')}</span>
                        </label>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{t('form.coding.features')}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['pwa', 'dark', 'i18n', 'realtime', 'offline', 'cicd'].map(feat => (
                                    <label key={feat} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(inputs.features || []).includes(feat)}
                                            className="w-4 h-4 rounded bg-white/10 border-white/20 text-primary focus:ring-primary hover:border-primary focus:border-primary"
                                            onChange={e => {
                                                const current = inputs.features || [];
                                                if (e.target.checked) {
                                                    handleInputChange('features', [...current, feat]);
                                                } else {
                                                    handleInputChange('features', current.filter((f: string) => f !== feat));
                                                }
                                            }}
                                        />
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{t(`form.coding.features.${feat}`)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case TaskType.WRITING:
                return (
                    <div className="space-y-4">
                        {/* Mode Toggle */}
                        <div className="flex gap-2 bg-slate-100 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                            {[
                                { id: 'edit', label: t('form.writing.mode.edit') },
                                { id: 'compose', label: t('form.writing.mode.compose') }
                            ].map(mode => (
                                <button
                                    key={mode.id}
                                    onClick={() => { handleInputChange('mode', mode.id); }}
                                    className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${(inputs.mode || 'edit') === mode.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/5'}`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        {(inputs.mode || 'edit') === 'edit' ? (
                            /* Edit Mode */
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.original')}</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                        rows={5}
                                        value={inputs.original || ''}
                                        onChange={e => handleInputChange('original', e.target.value)}
                                        placeholder={t('form.writing.original_ph')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.purpose')}</label>
                                        <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.purpose || 'professional'} onChange={e => handleInputChange('purpose', e.target.value)}>
                                            <option value="professional">{t('form.writing.purpose.professional')}</option>
                                            <option value="simplify">{t('form.writing.purpose.simplify')}</option>
                                            <option value="fix">{t('form.writing.purpose.fix')}</option>
                                            <option value="shorten">{t('form.writing.purpose.shorten')}</option>
                                            <option value="expand">{t('form.writing.purpose.expand')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.tone')}</label>
                                        <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.tone || 'formal'} onChange={e => handleInputChange('tone', e.target.value)}>
                                            <option value="formal">{t('form.writing.tone.formal')}</option>
                                            <option value="casual">{t('form.writing.tone.casual')}</option>
                                            <option value="friendly">{t('form.writing.tone.friendly')}</option>
                                            <option value="academic">{t('form.writing.tone.academic')}</option>
                                            <option value="business">{t('form.writing.tone.business')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.output_lang')}</label>
                                    <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.outputLang || 'keep'} onChange={e => handleInputChange('outputLang', e.target.value)}>
                                        <option value="keep">{t('form.writing.output_lang.keep')}</option>
                                        <option value="vi">{t('form.writing.output_lang.vi')}</option>
                                        <option value="en">{t('form.writing.output_lang.en')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.extra')}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none placeholder-slate-400 dark:placeholder-slate-500"
                                        value={inputs.extra || ''}
                                        onChange={e => handleInputChange('extra', e.target.value)}
                                        placeholder={t('form.writing.extra_ph')}
                                    />
                                </div>
                            </>
                        ) : (
                            /* Compose Mode */
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.desc')}</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-xl p-3 text-main dark:text-white focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                                        rows={4}
                                        value={inputs.desc || ''}
                                        onChange={e => handleInputChange('desc', e.target.value)}
                                        placeholder={t('form.writing.desc_ph')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.type')}</label>
                                        <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.type || 'email'} onChange={e => handleInputChange('type', e.target.value)}>
                                            <option value="email">{t('form.writing.type.email')}</option>
                                            <option value="blog">{t('form.writing.type.blog')}</option>
                                            <option value="social">{t('form.writing.type.social')}</option>
                                            <option value="report">{t('form.writing.type.report')}</option>
                                            <option value="letter">{t('form.writing.type.letter')}</option>
                                            <option value="ad">{t('form.writing.type.ad')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.tone')}</label>
                                        <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.tone || 'formal'} onChange={e => handleInputChange('tone', e.target.value)}>
                                            <option value="formal">{t('form.writing.tone.formal')}</option>
                                            <option value="casual">{t('form.writing.tone.casual')}</option>
                                            <option value="persuasive">{t('form.writing.tone.persuasive')}</option>
                                            <option value="informative">{t('form.writing.tone.informative')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.length')}</label>
                                        <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.length || 'medium'} onChange={e => handleInputChange('length', e.target.value)}>
                                            <option value="short">{t('form.writing.length.short')}</option>
                                            <option value="medium">{t('form.writing.length.medium')}</option>
                                            <option value="long">{t('form.writing.length.long')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.output_lang')}</label>
                                        <select className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary [&>option]:bg-white dark:[&>option]:bg-slate-900" value={inputs.language || 'vi'} onChange={e => handleInputChange('language', e.target.value)}>
                                            <option value="vi">{t('form.writing.output_lang.vi')}</option>
                                            <option value="en">{t('form.writing.output_lang.en')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">{t('form.writing.context')}</label>
                                    <textarea
                                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm focus:bg-white dark:focus:bg-white/10 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                                        rows={2}
                                        value={inputs.context || ''}
                                        onChange={e => handleInputChange('context', e.target.value)}
                                        placeholder={t('form.writing.context_ph')}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                );

            default:
                return <div>{t('common.error')}</div>;
        }
    };

    const renderOutput = () => {
        if (!output) {
            return (
                <div className="h-full flex items-center justify-center text-slate-500/50 flex-col gap-6">
                    <div className="p-8 rounded-full bg-white/5 animate-pulse-glow">
                        <span className="material-symbols-rounded text-6xl opacity-50 text-primary">auto_awesome</span>
                    </div>
                    <p className="text-lg font-medium text-slate-400">{t('workspace.empty_state')}</p>
                </div>
            );
        }

        // Special Rendering for Multi-Video JSON Output
        const isMultiVideo = activeTab === TaskType.VIDEO && output.final_prompt_json && output.final_prompt_json.anchors && Array.isArray(output.final_prompt_json.prompts);

        return (
            <div className="flex flex-col h-full overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gradient-to-l from-white/90 to-transparent dark:from-black/80">
                    <button
                        onClick={() => setOutputMode(PromptFormat.TEXT)}
                        className={`px-3 py-1 text-xs rounded-full font-bold backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary transition-colors ${outputMode === PromptFormat.TEXT ? 'bg-primary text-white' : 'bg-white/80 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        Text
                    </button>
                    <button
                        onClick={() => setOutputMode(PromptFormat.JSON)}
                        className={`px-3 py-1 text-xs rounded-full font-bold backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary transition-colors ${outputMode === PromptFormat.JSON ? 'bg-primary text-white' : 'bg-white/80 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        JSON
                    </button>
                    {/* Extend Button for Video (N=1) */}
                    {activeTab === TaskType.VIDEO && subtype !== 'Extend' && !isMultiVideo && (
                        <button onClick={() => handleExtendVideo(output.final_prompt_text)} className="flex items-center gap-1 text-accent hover:text-white text-xs font-bold px-3 py-1 rounded-full bg-accent/20 border border-accent/30 hover:bg-accent/40 transition-colors backdrop-blur-md">
                            <span className="material-symbols-rounded text-sm">fast_forward</span> Extend
                        </button>
                    )}
                    <button
                        onClick={() => copyToClipboard(outputMode === PromptFormat.TEXT ? output.final_prompt_text : JSON.stringify(output.final_prompt_json || output, null, 2))}
                        className="bg-white/80 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-full backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary transition-colors"
                        title={t('common.copy')}
                    >
                        <span className="material-symbols-rounded text-sm">content_copy</span>
                    </button>
                    <button className="bg-white/80 dark:bg-black/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-full backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary transition-colors" title={t('common.download')}>
                        <span className="material-symbols-rounded text-sm">download</span>
                    </button>
                </div>


                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    <div className="space-y-6 p-6">
                        {outputMode === PromptFormat.TEXT ? (
                            <div className="space-y-6">
                                {/* Highlight AI Assumptions */}
                                {output.assumptions && output.assumptions.length > 0 && (
                                    <div className="bg-indigo-50 dark:bg-accent/10 border border-indigo-100 dark:border-accent/20 rounded-xl p-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                                        <p className="text-accent text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                            <span className="material-symbols-rounded text-sm">lightbulb</span> {t('workspace.ai_assumptions')}
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                                            {output.assumptions.map((a, i) => (
                                                <li key={i}>{a.value}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {isMultiVideo ? (
                                    <div className="space-y-6">
                                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                                            <h3 className="text-blue-400 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                                                <span className="material-symbols-rounded">anchor</span>
                                                {t('workspace.anchors')}
                                            </h3>
                                            <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{output.final_prompt_json.anchors}</p>
                                        </div>

                                        {output.final_prompt_json.prompts.map((p: any, idx: number) => (
                                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('workspace.clip')} {String(idx + 1).padStart(2, '0')}</span>
                                                    <button onClick={() => copyToClipboard(JSON.stringify(p))} className="text-xs text-slate-500 hover:text-white transition-colors">{t('common.copy')}</button>
                                                </div>
                                                <div className="space-y-4">
                                                    <div><span className="text-slate-500 text-xs uppercase font-bold block mb-1">{t('workspace.visual')}</span> <span className="text-slate-200 text-sm">{p.visual || p.visual_prompt}</span></div>
                                                    <div><span className="text-slate-500 text-xs uppercase font-bold block mb-1">{t('workspace.audio')}</span> <span className="text-slate-200 text-sm">{p.audio || p.audio_prompt}</span></div>
                                                    {p.notes && <div><span className="text-slate-500 text-xs uppercase font-bold block mb-1">{t('workspace.notes')}</span> <span className="text-accent text-xs italic">{p.notes}</span></div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Highlight Fields Standard */
                                    (() => {
                                        const promptText = output.final_prompt_text || '';
                                        const hasSplit = promptText.includes('[ENGLISH]') && promptText.includes('[TIẾNG VIỆT]');

                                        if (hasSplit) {
                                            const parts = promptText.split('[TIẾNG VIỆT]');
                                            const engPart = parts[0].replace('[ENGLISH]', '').trim();
                                            const vnPart = parts[1] ? parts[1].trim() : '';

                                            return (
                                                <div className="space-y-8">
                                                    {/* English Section */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                            <h3 className="text-primary font-bold text-sm uppercase tracking-wider">English Prompt</h3>
                                                            <button
                                                                onClick={() => copyToClipboard(engPart)}
                                                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg"
                                                            >
                                                                <span className="material-symbols-rounded text-sm">content_copy</span> Copy
                                                            </button>
                                                        </div>
                                                        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300 pl-4 border-l-2 border-primary/30">
                                                            {engPart}
                                                        </div>
                                                    </div>

                                                    {/* Vietnamese Section */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                                            <h3 className="text-primary font-bold text-sm uppercase tracking-wider">Tiếng Việt</h3>
                                                            <button
                                                                onClick={() => copyToClipboard(vnPart)}
                                                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg"
                                                            >
                                                                <span className="material-symbols-rounded text-sm">content_copy</span> Copy
                                                            </button>
                                                        </div>
                                                        <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300 pl-4 border-l-2 border-primary/30">
                                                            {vnPart}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                                                    {promptText.split('\n').map((line, i) => {
                                                        const isHeader = /^[A-Z\s]+:/.test(line);
                                                        return (
                                                            <div key={i} className={isHeader ? "text-primary font-bold mt-6 text-base border-b border-primary/20 pb-1 mb-2 inline-block" : "text-slate-700 dark:text-slate-200 pl-4 border-l-2 border-slate-300/50 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500/50 transition-colors"}>
                                                                {line}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                    })()

                                )}
                            </div>
                        ) : (
                            <pre className="p-6 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                                {JSON.stringify(output.final_prompt_json || { prompt: output.final_prompt_text }, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden gap-0 md:gap-6 md:p-0 bg-background/50 md:bg-transparent">
            {/* Tabs - Mobile only */}
            <div className="md:hidden shrink-0 bg-surface z-20">
                {renderTabs()}
            </div>

            {/* Main Layout: Left Output (Desktop) / Right Form */}

            {/* Output Area - The "Canvas" */}
            {/* Output Area - The "Canvas" */}
            <div className="hidden md:block md:w-2/3 flex-none bg-white/80 dark:bg-[#050b14]/80 backdrop-blur-2xl rounded-none md:rounded-l-lg border-r border-border dark:border-white/5 order-2 md:order-1 overflow-hidden shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                {renderOutput()}
            </div>

            {/* Input Form Area - The "Control Panel" */}
            {/* Input Form Area - The "Control Panel" */}
            {/* Input Form Area - The "Control Panel" */}
            {/* Input Form Area - The "Control Panel" */}
            <div className="w-full md:w-1/3 bg-surface/50 backdrop-blur-xl border-l border-white/5 order-1 md:order-2 flex flex-col flex-1 min-h-0 md:h-full shadow-glass z-20 rounded-none md:rounded-r-lg overflow-hidden border-b border-border md:border-b-0 relative">
                <div className="hidden md:block">
                    {renderTabs()}
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 custom-scrollbar">
                    {renderForm()}
                </div>

                <div className="p-4 md:p-6 border-t border-border dark:border-white/10 bg-white/80 dark:bg-black/20 backdrop-blur-md flex gap-3 sticky bottom-0 z-30 pb-[env(safe-area-inset-bottom)] md:pb-6">
                    <button
                        onClick={() => { setInputs({}); setOutput(null); }}
                        className="px-4 py-3 rounded-xl border border-black/5 dark:border-white/10 text-secondary hover:text-main dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                        title={t('common.reset')}
                    >
                        <span className="material-symbols-rounded">restart_alt</span>
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-neon group"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span className="animate-pulse">{t('common.creating')}...</span>
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded group-hover:rotate-12 transition-transform">auto_awesome</span>
                                {t('common.create')}
                            </>
                        )}
                    </button>
                </div>
                {/* Mobile Result Modal */}
                {showMobileResult && output && (
                    <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-[#050b14]/95 backdrop-blur-3xl md:hidden flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-end p-6">
                            <button onClick={() => setShowMobileResult(false)} className="p-2 rounded-full bg-slate-100 dark:bg-surface border border-slate-200 dark:border-border text-slate-500 hover:text-slate-900 dark:text-secondary dark:hover:text-white transition-colors">
                                <span className="material-symbols-rounded text-2xl">close</span>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center max-w-sm mx-auto">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary blur-3xl opacity-20 rounded-full"></div>
                                <div className="p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-500/20 dark:to-emerald-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30 shadow-2xl shadow-green-500/10 dark:shadow-green-500/20 relative animate-pulse-glow">
                                    <span className="material-symbols-rounded text-6xl drop-shadow-md">check_circle</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400">{t('workspace.generated')}</h3>
                                <p className="text-base text-slate-500 dark:text-slate-400">{t('workspace.ready_to_copy')}</p>
                            </div>

                            <div className="w-full space-y-4">
                                {/* Format Toggle */}
                                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
                                    <button
                                        onClick={() => setOutputMode(PromptFormat.TEXT)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 ${outputMode === PromptFormat.TEXT ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        Text Mode
                                    </button>
                                    <button
                                        onClick={() => setOutputMode(PromptFormat.JSON)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 ${outputMode === PromptFormat.JSON ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        JSON Mode
                                    </button>
                                </div>

                                {/* Copy Button(s) */}
                                {(() => {
                                    const promptText = output.final_prompt_text || '';
                                    const hasSplit = outputMode === PromptFormat.TEXT && promptText.includes('[ENGLISH]') && promptText.includes('[TIẾNG VIỆT]');

                                    if (hasSplit) {
                                        const parts = promptText.split('[TIẾNG VIỆT]');
                                        const engPart = parts[0].replace('[ENGLISH]', '').trim();
                                        const vnPart = parts[1] ? parts[1].trim() : '';

                                        return (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => copyToClipboard(engPart)}
                                                    className="flex-1 bg-slate-900 dark:bg-primary/20 border border-primary/30 hover:bg-primary/30 text-white font-bold text-sm py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-rounded text-xl">content_copy</span>
                                                    Copy English
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(vnPart)}
                                                    className="flex-1 bg-slate-900 dark:bg-primary/20 border border-primary/30 hover:bg-primary/30 text-white font-bold text-sm py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-rounded text-xl">content_copy</span>
                                                    Copy VN
                                                </button>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            onClick={() => {
                                                copyToClipboard(outputMode === PromptFormat.TEXT ? output.final_prompt_text : JSON.stringify(output.final_prompt_json || output, null, 2));
                                            }}
                                            className="w-full bg-slate-900 dark:bg-gradient-to-r dark:from-white dark:to-slate-300 hover:bg-black dark:hover:from-slate-100 dark:hover:to-slate-400 text-white dark:text-black font-bold text-lg py-5 rounded-2xl shadow-xl shadow-black/10 dark:shadow-white/5 hover:shadow-black/20 dark:hover:shadow-white/20 transition-all active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group"
                                        >
                                            <span className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                            <span className="material-symbols-rounded text-2xl">content_copy</span>
                                            {t('common.copy')}
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workspace;
