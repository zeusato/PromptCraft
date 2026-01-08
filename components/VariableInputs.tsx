import React from 'react';
import { PromptVariable } from '../types';
import { useApp } from '../contexts/AppContext';

interface VariableInputsProps {
    variables: PromptVariable[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
}

const VariableInputs: React.FC<VariableInputsProps> = ({ variables, values, onChange }) => {
    const { settings } = useApp();
    const isVi = settings.language === 'vi';

    const renderInput = (variable: PromptVariable) => {
        const label = isVi ? variable.label : variable.labelEn;
        const placeholder = isVi ? variable.placeholder : variable.placeholderEn;
        const value = values[variable.key] || variable.default || '';

        const baseInputClass = "w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary focus:border-primary rounded-lg p-2.5 text-main dark:text-white text-sm outline-none focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-primary transition-colors placeholder-slate-400 dark:placeholder-slate-500";
        const selectClass = baseInputClass + " [&>option]:bg-white dark:[&>option]:bg-slate-900";

        switch (variable.type) {
            case 'textarea':
                return (
                    <textarea
                        className={baseInputClass + " min-h-[80px]"}
                        value={value}
                        onChange={(e) => onChange(variable.key, e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                    />
                );

            case 'select':
                return (
                    <select
                        className={selectClass}
                        value={value}
                        onChange={(e) => onChange(variable.key, e.target.value)}
                    >
                        {variable.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {isVi ? opt.label : opt.labelEn}
                            </option>
                        ))}
                    </select>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        className={baseInputClass}
                        value={value}
                        onChange={(e) => onChange(variable.key, e.target.value)}
                        placeholder={placeholder}
                    />
                );

            default: // text
                return (
                    <input
                        type="text"
                        className={baseInputClass}
                        value={value}
                        onChange={(e) => onChange(variable.key, e.target.value)}
                        placeholder={placeholder}
                    />
                );
        }
    };

    return (
        <div className="space-y-4">
            {variables.map((variable) => (
                <div key={variable.key}>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1.5">
                        {isVi ? variable.label : variable.labelEn}
                    </label>
                    {renderInput(variable)}
                </div>
            ))}
        </div>
    );
};

export default VariableInputs;
