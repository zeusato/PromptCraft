import React from 'react';
import { PromptTemplate } from '../types';
import { useApp } from '../contexts/AppContext';

interface PromptCardProps {
    template: PromptTemplate;
    onSelect: (template: PromptTemplate) => void;
    onQuickCopy: (template: PromptTemplate) => void;
    isSelected?: boolean;
    isFavorite?: boolean;
}

const PromptCard: React.FC<PromptCardProps> = ({ template, onSelect, onQuickCopy, isSelected, isFavorite }) => {
    const { settings } = useApp();
    const isVi = settings.language === 'vi';

    const title = isVi ? template.title : template.titleEn;
    const description = isVi ? template.description : template.descriptionEn;

    return (
        <div
            onClick={() => onSelect(template)}
            className={`
        group relative p-4 rounded-xl border cursor-pointer transition-all duration-300
        ${isSelected
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                    : isFavorite
                        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-500/50'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-white/20 hover:shadow-md'
                }
      `}
        >
            {/* Title - padding right to avoid overlap with copy button */}
            <h3 className={`font-bold text-base mb-1 pr-10 transition-colors ${isSelected ? 'text-primary' : 'text-main dark:text-white'}`}>
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {description}
            </p>

            {/* Favorite Indicator */}
            {isFavorite && (
                <div className="absolute top-3 right-12 text-amber-400">
                    <span className="material-symbols-rounded text-lg icon-filled">star</span>
                </div>
            )}

            {/* Quick Copy Button - Moved to top right */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onQuickCopy(template);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white transition-all duration-200 shadow-sm"
                title={isVi ? 'Copy nhanh' : 'Quick copy'}
            >
                <span className="material-symbols-rounded text-lg">content_copy</span>
            </button>
        </div>
    );
};

export default PromptCard;
