import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { TaskType, PromptTemplate, PromptFormat } from '../types';
import { promptTemplates, getTemplatesByCategory, searchTemplates } from '../data/promptTemplates';
import PromptCard from '../components/PromptCard';
import VariableInputs from '../components/VariableInputs';
import { useApp } from '../contexts/AppContext';

interface PromptLibsWorkspaceProps {
    // No props needed for now
}

const PromptLibsWorkspace: React.FC<PromptLibsWorkspaceProps> = () => {
    const { t, settings } = useApp();
    const isVi = settings.language === 'vi';

    // Categories that have templates
    const categories = [TaskType.IMAGE, TaskType.VIDEO, TaskType.WRITING, TaskType.MARKETING, TaskType.DATA];

    const [activeCategory, setActiveCategory] = useState<TaskType>(TaskType.IMAGE);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [outputMode, setOutputMode] = useState<PromptFormat>(PromptFormat.TEXT);
    const { updateSettings } = useApp();

    // Toggle Favorite
    const isFavorite = (templateId: string) => {
        return settings.favorites?.includes(templateId);
    };

    const toggleFavorite = (templateId: string) => {
        const currentFavorites = settings.favorites || [];
        let newFavorites;
        if (currentFavorites.includes(templateId)) {
            newFavorites = currentFavorites.filter(id => id !== templateId);
        } else {
            newFavorites = [...currentFavorites, templateId];
        }
        updateSettings({ ...settings, favorites: newFavorites });
    };

    // Filter templates
    const filteredTemplates = useMemo(() => {
        let results = [];
        if (searchQuery.trim()) {
            results = searchTemplates(searchQuery);
        } else {
            results = getTemplatesByCategory(activeCategory);
        }

        // Sort: Favorites first
        return [...results].sort((a, b) => {
            const aFav = isFavorite(a.id);
            const bFav = isFavorite(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            return 0;
        });
    }, [activeCategory, searchQuery, settings.favorites]);

    // Generate final prompt from template
    const generatePrompt = (template: PromptTemplate, values: Record<string, string>): string => {
        let result = template.template;
        // Replace {{key}} with values
        Object.entries(values).forEach(([key, value]) => {
            result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
        });
        // Clean up any remaining placeholders
        result = result.replace(/\{\{[^}]+\}\}/g, '');
        return result.trim();
    };

    // Parse prompt to structured JSON object
    const parsePromptStructure = (text: string): Record<string, string | string[]> => {
        const result: Record<string, string | string[]> = {};
        const regex = /\*\*\*([A-Z0-9 &()]+)\*\*\*\n([\s\S]*?)(?=\*\*\*|$)/g;

        let match;
        let found = false;

        while ((match = regex.exec(text)) !== null) {
            found = true;
            // Clean key: "ROLE & CONTEXT" -> "role_context"
            const key = match[1]
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');

            const value = match[2].trim();

            // If value contains newlines, check for list format or just split lines
            if (value.includes('\n')) {
                // Split by newline and filter empty lines
                const lines = value.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                // If only 1 line after filter, keep as string
                result[key] = lines.length === 1 ? lines[0] : lines;
            } else {
                result[key] = value;
            }
        }

        // Fallback for non-structured prompts
        if (!found) {
            return { prompt: text };
        }

        return result;
    };

    // Handle template selection
    const handleSelectTemplate = (template: PromptTemplate) => {
        setSelectedTemplate(template);
        setOutputMode(PromptFormat.TEXT);
        // Initialize with default values
        const defaults: Record<string, string> = {};
        template.variables.forEach(v => {
            if (v.default) defaults[v.key] = v.default;
        });
        setVariableValues(defaults);
    };

    // Handle variable change
    const handleVariableChange = (key: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [key]: value }));
    };

    // Quick copy with defaults
    const handleQuickCopy = (template: PromptTemplate) => {
        const defaults: Record<string, string> = {};
        template.variables.forEach(v => {
            if (v.default) defaults[v.key] = v.default;
        });
        const prompt = generatePrompt(template, defaults);
        navigator.clipboard.writeText(prompt);
        alert(t('common.copied'));
    };

    // Copy current prompt
    const handleCopy = () => {
        if (!selectedTemplate) return;

        if (outputMode === PromptFormat.JSON) {
            const promptText = generatePrompt(selectedTemplate, variableValues);
            const structured = parsePromptStructure(promptText);
            navigator.clipboard.writeText(JSON.stringify(structured, null, 2));
        } else {
            const prompt = generatePrompt(selectedTemplate, variableValues);
            navigator.clipboard.writeText(prompt);
        }
        alert(t('common.copied'));
    };

    // Get category icon
    const getCategoryIcon = (cat: TaskType) => {
        switch (cat) {
            case TaskType.IMAGE: return 'image';
            case TaskType.VIDEO: return 'movie';
            case TaskType.WRITING: return 'edit_note';
            case TaskType.MARKETING: return 'campaign';
            case TaskType.DATA: return 'analytics';
            default: return 'category';
        }
    };

    // Get category label
    const getCategoryLabel = (cat: TaskType) => {
        switch (cat) {
            case TaskType.IMAGE: return isVi ? 'Ảnh' : 'Image';
            case TaskType.VIDEO: return 'Video';
            case TaskType.WRITING: return isVi ? 'Viết' : 'Writing';
            case TaskType.MARKETING: return 'Marketing';
            case TaskType.DATA: return isVi ? 'Dữ liệu' : 'Data';
            default: return cat;
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden gap-0 md:gap-6 md:p-0 bg-background/50 md:bg-transparent">

            {/* Left Side - Preview Area (Desktop) */}
            <div className="hidden md:flex md:w-2/3 flex-none glass-panel rounded-none md:rounded-l-lg border-r border-white/5 overflow-hidden relative flex-col shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>

                {selectedTemplate ? (
                    <div className="flex flex-col h-full relative z-10">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                                    <span className="material-symbols-rounded">{selectedTemplate.icon}</span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-main dark:text-white">
                                        {isVi ? selectedTemplate.title : selectedTemplate.titleEn}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {isVi ? selectedTemplate.description : selectedTemplate.descriptionEn}
                                    </p>
                                </div>
                            </div>

                            {/* Output Mode Toggle */}
                            <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
                                <button
                                    onClick={() => setOutputMode(PromptFormat.TEXT)}
                                    className={`px-3 py-1 text-xs rounded-md font-bold transition-colors ${outputMode === PromptFormat.TEXT ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Text
                                </button>
                                <button
                                    onClick={() => setOutputMode(PromptFormat.JSON)}
                                    className={`px-3 py-1 text-xs rounded-md font-bold transition-colors ${outputMode === PromptFormat.JSON ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    JSON
                                </button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="mb-4">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    {isVi ? 'Xem trước Prompt' : 'Prompt Preview'}
                                </h3>
                                <div className="bg-black/20 rounded-xl p-4 font-mono text-sm text-main dark:text-slate-200 leading-relaxed border border-white/10 min-h-[500px]">
                                    {outputMode === PromptFormat.JSON ? (
                                        <pre className="text-emerald-500 dark:text-emerald-400 whitespace-pre-wrap break-all font-mono">
                                            {JSON.stringify(
                                                parsePromptStructure(generatePrompt(selectedTemplate, variableValues)),
                                                null, 2
                                            )}
                                        </pre>
                                    ) : (
                                        generatePrompt(selectedTemplate, variableValues) ? (
                                            <div className="prose dark:prose-invert prose-sm max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
                                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-4 italic text-slate-500 my-2" {...props} />,
                                                    }}
                                                >
                                                    {generatePrompt(selectedTemplate, variableValues)}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">{isVi ? 'Điền các tham số bên phải...' : 'Fill in the parameters on the right...'}</span>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Copy Button */}
                        <div className="p-4 border-t border-white/10 bg-white/5">
                            <button
                                onClick={handleCopy}
                                className="w-full glass-button font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-neon"
                            >
                                <span className="material-symbols-rounded">content_copy</span>
                                {isVi ? 'Sao chép Prompt' : 'Copy Prompt'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500/50 flex-col gap-6">
                        <div className="p-8 rounded-full bg-white/5 animate-pulse-soft">
                            <span className="material-symbols-rounded text-6xl opacity-50 text-primary">library_books</span>
                        </div>
                        <p className="text-lg font-medium text-slate-400">
                            {isVi ? 'Chọn một prompt từ thư viện' : 'Select a prompt from the library'}
                        </p>
                    </div>
                )}
            </div>

            {/* Right Side - Library & Variables */}
            <div className="w-full md:w-1/3 glass-panel border-l border-white/5 flex flex-col flex-1 min-h-0 md:h-full z-20 rounded-none md:rounded-r-lg overflow-hidden shadow-glass">

                {/* Category Tabs */}
                <div className="flex p-2 border-b border-white/10 sticky top-0 z-10 gap-2 overflow-x-auto hide-scrollbar bg-black/5">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setSearchQuery('');
                                setSelectedTemplate(null);
                            }}
                            className={`flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${activeCategory === cat && !searchQuery
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-white/10 hover:text-main dark:hover:text-white'
                                }`}
                        >
                            {getCategoryLabel(cat)}
                        </button>
                    ))}
                </div>

                {/* Search Box */}
                <div className="p-3 border-b border-white/10">
                    <div className="relative">
                        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={isVi ? 'Tìm kiếm prompt...' : 'Search prompts...'}
                            className="w-full glass-input rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-main dark:hover:text-white"
                            >
                                <span className="material-symbols-rounded text-sm">close</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {selectedTemplate ? (
                        /* Variable Inputs */
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-main dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-rounded text-primary">tune</span>
                                    {isVi ? 'Tùy chỉnh tham số' : 'Customize Parameters'}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleFavorite(selectedTemplate.id)}
                                        className={`p-1.5 rounded-full transition-colors ${isFavorite(selectedTemplate.id)
                                            ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400'
                                            : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:hover:text-amber-400'
                                            }`}
                                        title={isVi ? "Yêu thích" : "Favorite"}
                                    >
                                        <span className="material-symbols-rounded text-lg icon-filled">
                                            {isFavorite(selectedTemplate.id) ? 'star' : 'star_border'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedTemplate(null)}
                                        className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-rounded text-sm">arrow_back</span>
                                        {isVi ? 'Quay lại' : 'Back'}
                                    </button>
                                </div>
                            </div>
                            <VariableInputs
                                variables={selectedTemplate.variables}
                                values={variableValues}
                                onChange={handleVariableChange}
                            />
                        </div>
                    ) : (
                        /* Cards Grid */
                        <div className="p-3 grid grid-cols-1 gap-3">
                            {filteredTemplates.length > 0 ? (
                                filteredTemplates.map(template => (
                                    <PromptCard
                                        key={template.id}
                                        template={template}
                                        onSelect={handleSelectTemplate}
                                        onQuickCopy={handleQuickCopy}
                                        isSelected={selectedTemplate?.id === template.id}
                                        isFavorite={isFavorite(template.id)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <span className="material-symbols-rounded text-4xl mb-2">search_off</span>
                                    <p className="text-sm">{isVi ? 'Không tìm thấy prompt' : 'No prompts found'}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile: Copy Button when template selected */}
                {selectedTemplate && (
                    <div className="md:hidden p-4 border-t border-border dark:border-white/10 bg-white/80 dark:bg-black/20">
                        <button
                            onClick={handleCopy}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-rounded">content_copy</span>
                            {isVi ? 'Sao chép' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptLibsWorkspace;
