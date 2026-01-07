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
        <div className="flex gap-1 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-10 px-4 pt-2">
            {Object.values(TaskType).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-secondary hover:text-primary hover:border-primary/50'
                        }`}
                >
                    {tab === TaskType.RESEARCH && t('tab.research')}
                    {tab === TaskType.IMAGE && t('tab.image')}
                    {tab === TaskType.VIDEO && t('tab.video')}
                    {tab === TaskType.OUTLINE && t('tab.outline')}
                    {tab === TaskType.MUSIC && t('tab.music')}
                </button>
            ))}
        </div>
    );

    const renderTargetFormatSelector = () => (
        <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-sm font-medium text-secondary mb-2">{t('workspace.output_format')}</label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="targetFormat"
                        value="Text"
                        checked={inputs.targetFormat !== 'JSON'}
                        onChange={() => handleInputChange('targetFormat', 'Text')}
                        className="text-primary focus:ring-primary bg-background border-border"
                    />
                    <span className="text-sm text-secondary">Text</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="targetFormat"
                        value="JSON"
                        checked={inputs.targetFormat === 'JSON'}
                        onChange={() => handleInputChange('targetFormat', 'JSON')}
                        className="text-primary focus:ring-primary bg-background border-border"
                    />
                    <span className="text-sm text-secondary">JSON</span>
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
                            <label className="block text-sm font-medium text-secondary mb-1">{t('form.topic')}</label>
                            <textarea
                                className="w-full bg-background border border-border rounded-lg p-3 text-main focus:ring-2 focus:ring-primary outline-none"
                                rows={4}
                                value={inputs.topic || ''}
                                onChange={e => handleInputChange('topic', e.target.value)}
                                placeholder={t('form.topic_ph')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">{t('form.level')}</label>
                            <select
                                className="w-full bg-background border border-border rounded-lg p-3 text-main"
                                value={inputs.depth || 'standard'}
                                onChange={e => handleInputChange('depth', e.target.value)}
                            >
                                <option value="quick">{t('form.level.quick')}</option>
                                <option value="standard">{t('form.level.standard')}</option>
                                <option value="deep">{t('form.level.deep')}</option>
                            </select>
                        </div>
                        <div className="bg-background/50 p-3 rounded-lg border border-border">
                            <p className="text-xs font-bold text-secondary mb-2 uppercase">{t('common.advanced')}</p>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder={t('form.timeframe')}
                                    value={inputs.timeframe || ''}
                                    className="bg-surface border border-border rounded px-2 py-1 text-sm text-main"
                                    onChange={e => handleInputChange('timeframe', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder={t('form.format_output')}
                                    value={inputs.format || ''}
                                    className="bg-surface border border-border rounded px-2 py-1 text-sm text-main"
                                    onChange={e => handleInputChange('format', e.target.value)}
                                />
                            </div>
                        </div>

                    </div>
                );

            case TaskType.IMAGE:
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2 bg-background/50 p-1 rounded-lg">
                            {[
                                { id: 'Generate', label: t('form.img.sub.generate') },
                                { id: 'Analyze', label: t('form.img.sub.analyze') },
                                { id: 'Compose', label: t('form.img.sub.compose') }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => { setSubtype(sub.id); setInputs({}); }}
                                    className={`flex-1 py-1.5 text-xs rounded font-medium ${subtype === sub.id ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
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
                                        <label className="flex items-center gap-2 cursor-pointer bg-background/50 p-2 rounded border border-border">
                                            <input
                                                type="checkbox"
                                                checked={inputs.useRefFace || false}
                                                className="w-4 h-4 rounded bg-surface border-border text-primary focus:ring-primary"
                                                onChange={e => handleInputChange('useRefFace', e.target.checked)}
                                            />
                                            <span className="text-sm text-secondary">{t('form.img.use_ref_face')}</span>
                                        </label>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">
                                        {subtype === 'Analyze' ? t('form.img.desc_analyze') : t('form.img.desc_generate')}
                                    </label>
                                    <textarea
                                        className="w-full bg-background border border-border rounded-lg p-3 text-main"
                                        rows={3}
                                        value={inputs.description || ''}
                                        onChange={e => handleInputChange('description', e.target.value)}
                                        placeholder={subtype === 'Analyze' ? t('form.img.desc_ph_analyze') : t('form.img.desc_ph_generate')}
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <select className="bg-background border border-border rounded-lg p-2 text-main text-sm" value={inputs.style || ''} onChange={e => handleInputChange('style', e.target.value)}>
                                <option value="">{t('form.img.style')}</option>
                                <option value="photorealistic">Photorealistic</option>
                                <option value="anime">Anime</option>
                                <option value="oil painting">Oil Painting</option>
                                <option value="3d render">3D Render</option>
                            </select>
                            <select className="bg-background border border-border rounded-lg p-2 text-main text-sm" value={inputs.ratio || '1:1'} onChange={e => handleInputChange('ratio', e.target.value)}>
                                <option value="1:1">1:1</option>
                                <option value="16:9">16:9</option>
                                <option value="9:16">9:16</option>
                                <option value="4:3">4:3</option>
                                <option value="3:4">3:4</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={inputs.inspire || false} className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary" onChange={e => handleInputChange('inspire', e.target.checked)} />
                            <span className="text-sm text-secondary">{t('form.img.inspire')}</span>
                        </label>

                    </div>
                );

            case TaskType.VIDEO:
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2 bg-background/50 p-1 rounded-lg">
                            {[
                                { id: 'Prompt', label: t('form.vid.sub.prompt') },
                                { id: 'Img2Video', label: t('form.vid.sub.img2vid') },
                                { id: 'Extend', label: t('form.vid.sub.extend') }
                            ].map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => { setSubtype(sub.id); setInputs({}); setShowAdvanced(false); }}
                                    className={`flex-1 py-1.5 text-xs rounded font-medium ${subtype === sub.id ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
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
                            <div className="space-y-3 bg-background/50 p-3 rounded-lg border border-border">
                                <label className="block text-sm font-medium text-secondary">{t('form.vid.base_prompt')}</label>
                                <textarea
                                    className="w-full bg-surface border border-border rounded p-2 text-main text-sm"
                                    rows={3}
                                    value={inputs.basePrompt || ''}
                                    onChange={e => handleInputChange('basePrompt', e.target.value)}
                                    placeholder={t('form.vid.base_prompt_ph')}
                                />
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={inputs.keepConsistency !== false} className="w-4 h-4 rounded bg-surface border-border text-primary" onChange={e => handleInputChange('keepConsistency', e.target.checked)} />
                                    <span className="text-sm text-secondary">{t('form.vid.consistency')}</span>
                                </label>
                            </div>
                        )}

                        {/* BASIC FIELDS */}
                        <div className="space-y-3">
                            {subtype === 'Extend' ? (
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">{t('form.vid.extend_what')}</label>
                                    <textarea
                                        className="w-full bg-background border border-border rounded-lg p-3 text-main"
                                        rows={2}
                                        value={inputs.extensionIdea || ''}
                                        onChange={e => handleInputChange('extensionIdea', e.target.value)}
                                        placeholder={t('form.vid.extend_ph')}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-1">{t('form.vid.idea')}</label>
                                        <textarea
                                            className="w-full bg-background border border-border rounded-lg p-3 text-main"
                                            rows={2}
                                            value={inputs.description || ''}
                                            onChange={e => handleInputChange('description', e.target.value)}
                                            placeholder={subtype === 'Img2Video' ? t('form.vid.idea_ph_img') : t('form.vid.idea_ph_txt')}
                                        />
                                    </div>

                                    {subtype === 'Prompt' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs text-secondary mb-1">{t('form.vid.env')}</label>
                                                <input type="text" placeholder="Cyberpunk city..." className="w-full bg-background border border-border rounded p-2 text-main text-sm" value={inputs.context || ''} onChange={e => handleInputChange('context', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-secondary mb-1">{t('form.vid.subject')}</label>
                                                <input type="text" placeholder="A robot..." className="w-full bg-background border border-border rounded p-2 text-main text-sm" value={inputs.subject || ''} onChange={e => handleInputChange('subject', e.target.value)} />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs text-secondary mb-1">{t('form.vid.audio_gen')}</label>
                                        <input type="text" placeholder="Music, SFX..." className="w-full bg-background border border-border rounded p-2 text-main text-sm" value={inputs.audio_general || ''} onChange={e => handleInputChange('audio_general', e.target.value)} />
                                    </div>
                                </>
                            )}

                            {/* Technical Configs */}
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] text-secondary mb-1 uppercase">{t('form.vid.duration')}</label>
                                    <select className="w-full bg-background border border-border rounded p-2 text-main text-sm" value={inputs.duration || '5s'} onChange={e => handleInputChange('duration', e.target.value)}>
                                        <option value="5s">5s</option>
                                        <option value="8s">8s</option>
                                        <option value="10s">10s</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-secondary mb-1 uppercase">{t('form.img.ratio')}</label>
                                    <select className="w-full bg-background border border-border rounded p-2 text-main text-sm" value={inputs.ratio || '16:9'} onChange={e => handleInputChange('ratio', e.target.value)}>
                                        <option value="16:9">16:9</option>
                                        <option value="9:16">9:16</option>
                                        <option value="1:1">1:1</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-secondary mb-1 uppercase">{t('form.vid.count')}</label>
                                    <select className="w-full bg-background border border-border rounded p-2 text-main text-sm" value={inputs.count || '1'} onChange={e => handleInputChange('count', e.target.value)}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ADVANCED ACCORDION */}
                        <div className="border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between p-3 bg-background/50 hover:bg-background/80 transition"
                            >
                                <span className="text-sm font-medium text-secondary">{t('common.advanced')}</span>
                                <span className="material-symbols-rounded text-secondary transform transition-transform duration-200" style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                            </button>

                            {showAdvanced && (
                                <div className="p-3 space-y-3 bg-surface border-t border-border">
                                    {/* Camera */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-secondary mb-1">{t('form.vid.cam_angle')}</label>
                                            <select className="w-full bg-background border border-border rounded p-2 text-main text-xs" value={inputs.camera_angle || ''} onChange={e => handleInputChange('camera_angle', e.target.value)}>
                                                <option value="">Auto</option>
                                                <option value="wide">Wide</option>
                                                <option value="medium">Medium</option>
                                                <option value="closeup">Close-up</option>
                                                <option value="pov">POV</option>
                                                <option value="drone">Drone</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-secondary mb-1">{t('form.vid.cam_motion')}</label>
                                            <select className="w-full bg-background border border-border rounded p-2 text-main text-xs" value={inputs.camera_motion || ''} onChange={e => handleInputChange('camera_motion', e.target.value)}>
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
                                        <input type="text" placeholder={t('form.vid.lighting')} className="bg-background border border-border rounded p-2 text-main text-xs" value={inputs.lighting || ''} onChange={e => handleInputChange('lighting', e.target.value)} />
                                        <input type="text" placeholder={t('form.img.style')} className="bg-background border border-border rounded p-2 text-main text-xs" value={inputs.style || ''} onChange={e => handleInputChange('style', e.target.value)} />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-secondary mb-1">{t('form.vid.audio_det')}</label>
                                        <textarea className="w-full bg-background border border-border rounded p-2 text-main text-xs" rows={2} value={inputs.audio_detailed || ''} onChange={e => handleInputChange('audio_detailed', e.target.value)} />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-secondary mb-1">{t('form.vid.negative')}</label>
                                        <input type="text" className="w-full bg-background border border-border rounded p-2 text-main text-xs" value={inputs.negative || ''} onChange={e => handleInputChange('negative', e.target.value)} />
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
                            <label className="block text-sm font-medium text-secondary mb-1">{t('form.outline.topic')}</label>
                            <textarea
                                className="w-full bg-background border border-border rounded-lg p-3 text-main"
                                rows={3}
                                value={inputs.topic || ''}
                                onChange={e => handleInputChange('topic', e.target.value)}
                                placeholder="Topic..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder={t('form.outline.audience')} value={inputs.audience || ''} className="bg-background border border-border rounded-lg p-2 text-main text-sm" onChange={e => handleInputChange('audience', e.target.value)} />
                            <input type="text" placeholder={t('form.outline.goal')} value={inputs.goal || ''} className="bg-background border border-border rounded-lg p-2 text-main text-sm" onChange={e => handleInputChange('goal', e.target.value)} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={inputs.auto_fill || false} className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary" onChange={e => handleInputChange('auto_fill', e.target.checked)} />
                            <span className="text-sm text-secondary">{t('form.outline.autofill')}</span>
                        </label>

                    </div>
                );

            case TaskType.MUSIC:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">{t('form.music.topic')}</label>
                            <textarea
                                className="w-full bg-background border border-border rounded-lg p-3 text-main"
                                rows={3}
                                value={inputs.topic || ''}
                                onChange={e => handleInputChange('topic', e.target.value)}
                                placeholder="Lyrics / Topic..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder={t('form.music.genre')} value={inputs.genre || ''} className="bg-background border border-border rounded-lg p-2 text-main text-sm" onChange={e => handleInputChange('genre', e.target.value)} />
                            <input type="text" placeholder={t('form.music.mood')} value={inputs.mood || ''} className="bg-background border border-border rounded-lg p-2 text-main text-sm" onChange={e => handleInputChange('mood', e.target.value)} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={inputs.suno_ready || false} className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary" onChange={e => handleInputChange('suno_ready', e.target.checked)} />
                            <span className="text-sm text-secondary">{t('form.music.suno')}</span>
                        </label>

                    </div>
                );

            default:
                return <div>{t('common.error')}</div>;
        }
    };

    const renderOutput = () => {
        if (!output) {
            return (
                <div className="h-full flex items-center justify-center text-secondary flex-col gap-4">
                    <span className="material-symbols-rounded text-6xl opacity-20">auto_awesome</span>
                    <p>{t('workspace.empty_state')}</p>
                </div>
            );
        }

        // Special Rendering for Multi-Video JSON Output
        const isMultiVideo = activeTab === TaskType.VIDEO && output.final_prompt_json && output.final_prompt_json.anchors && Array.isArray(output.final_prompt_json.prompts);

        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-4 shrink-0">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setOutputMode(PromptFormat.TEXT)}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${outputMode === PromptFormat.TEXT ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                        >
                            Text
                        </button>
                        <button
                            onClick={() => setOutputMode(PromptFormat.JSON)}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${outputMode === PromptFormat.JSON ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
                        >
                            JSON
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {/* Extend Button for Video (N=1) */}
                        {activeTab === TaskType.VIDEO && subtype !== 'Extend' && !isMultiVideo && (
                            <button onClick={() => handleExtendVideo(output.final_prompt_text)} className="flex items-center gap-1 text-accent hover:text-main text-xs font-bold px-2 py-1 rounded bg-accent/10 border border-accent/20">
                                <span className="material-symbols-rounded text-sm">fast_forward</span> Extend
                            </button>
                        )}
                        <button
                            onClick={() => copyToClipboard(outputMode === PromptFormat.TEXT ? output.final_prompt_text : JSON.stringify(output.final_prompt_json || output, null, 2))}
                            className="text-secondary hover:text-primary"
                            title={t('common.copy')}
                        >
                            <span className="material-symbols-rounded">content_copy</span>
                        </button>
                        <button className="text-secondary hover:text-primary" title={t('common.download')}>
                            <span className="material-symbols-rounded">download</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {outputMode === PromptFormat.TEXT ? (
                        <div className="space-y-6">
                            {/* Highlight AI Assumptions */}
                            {output.assumptions && output.assumptions.length > 0 && (
                                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                                    <p className="text-accent text-xs font-bold uppercase mb-2 flex items-center gap-1">
                                        <span className="material-symbols-rounded text-sm">lightbulb</span> {t('workspace.ai_assumptions')}
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-secondary space-y-1">
                                        {output.assumptions.map((a, i) => (
                                            <li key={i}>{a.value}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {isMultiVideo ? (
                                <div className="space-y-6">
                                    <div className="bg-blue-900/10 border border-blue-800/30 rounded-lg p-4">
                                        <h3 className="text-primary font-bold text-sm uppercase mb-2">⚓ {t('workspace.anchors')}</h3>
                                        <p className="text-main/80 text-sm whitespace-pre-wrap">{output.final_prompt_json.anchors}</p>
                                        <button onClick={() => copyToClipboard(output.final_prompt_json.anchors)} className="mt-2 text-xs text-primary hover:text-main underline">{t('common.copy')}</button>
                                    </div>

                                    {output.final_prompt_json.prompts.map((p: any, idx: number) => (
                                        <div key={idx} className="bg-background border border-border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-secondary uppercase">{t('workspace.clip')} #{idx + 1}</span>
                                                <button onClick={() => copyToClipboard(JSON.stringify(p))} className="text-xs text-secondary hover:text-primary">{t('common.copy')}</button>
                                            </div>
                                            <div className="space-y-2">
                                                <div><span className="text-secondary text-xs uppercase">{t('workspace.visual')}:</span> <span className="text-main/80 text-sm">{p.visual || p.visual_prompt}</span></div>
                                                <div><span className="text-secondary text-xs uppercase">{t('workspace.audio')}:</span> <span className="text-main/80 text-sm">{p.audio || p.audio_prompt}</span></div>
                                                {p.notes && <div><span className="text-secondary text-xs uppercase">{t('workspace.notes')}:</span> <span className="text-accent text-xs italic">{p.notes}</span></div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Highlight Fields Standard */
                                <div className="bg-background rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap border border-border">
                                    {(output.final_prompt_text || '').split('\n').map((line, i) => {
                                        const isHeader = /^[A-Z\s]+:/.test(line);
                                        return (
                                            <div key={i} className={isHeader ? "text-primary font-bold mt-4" : "text-main/80"}>
                                                {line}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <pre className="bg-background p-4 rounded-lg text-xs font-mono text-main/80 overflow-x-auto border border-border">
                            {JSON.stringify(output.final_prompt_json || { prompt: output.final_prompt_text }, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Tabs - Mobile only */}
            <div className="md:hidden">
                {renderTabs()}
            </div>

            {/* Main Layout: Left Output (Desktop) / Right Form */}

            {/* Output Area */}
            <div className="flex-1 bg-background p-4 md:p-6 order-2 md:order-1 border-r border-border overflow-hidden h-1/2 md:h-full flex flex-col">
                {renderOutput()}
            </div>

            {/* Input Form Area */}
            <div className="w-full md:w-[480px] bg-surface p-4 md:p-6 order-1 md:order-2 overflow-y-auto border-b md:border-b-0 border-border flex flex-col h-1/2 md:h-full shrink-0 shadow-lg z-10">
                <div className="hidden md:block mb-4">
                    {renderTabs()}
                </div>

                <div className="flex-1">
                    {renderForm()}
                </div>

                <div className="pt-4 mt-auto border-t border-border flex gap-2 sticky bottom-0 bg-surface">
                    <button
                        onClick={() => { setInputs({}); setOutput(null); }}
                        className="px-4 py-2 rounded-lg border border-border text-secondary hover:bg-background hover:text-primary transition"
                    >
                        {t('common.reset')}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                {t('common.creating')}
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">auto_awesome</span>
                                {t('common.create')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
