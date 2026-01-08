export enum TaskType {
  RESEARCH = 'RESEARCH',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  OUTLINE = 'OUTLINE',
  MUSIC = 'MUSIC',
  CODING = 'CODING',
  WRITING = 'WRITING',
  MARKETING = 'MARKETING',
  DATA = 'DATA'
}

export enum PromptFormat {
  TEXT = 'TEXT',
  JSON = 'JSON'
}

export enum AppLanguage {
  VI = 'vi',
  EN = 'en'
}

export interface PromptField {
  value: string;
  source: 'user' | 'model';
  notes?: string;
}

export interface PromptOutput {
  meta: {
    type: TaskType;
    subtype?: string;
    createdAt: string;
  };
  inputs_raw: Record<string, any>;
  completed_fields: Record<string, PromptField>;
  assumptions: Array<{ value: string; source: 'model' }>;
  final_prompt_text: string;
  final_prompt_json?: any;
  prompts?: any[]; // For multi-video
}

export interface HistoryItem {
  id: string;
  title: string;
  type: TaskType;
  subtype?: string;
  createdAt: number;
  data: PromptOutput;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  language: AppLanguage;
  defaultOutput: PromptFormat;
  highlightAI: boolean;
  favorites?: string[]; // IDs of favorite prompt templates
}

// Prompt Libs Mode
export enum AppMode {
  CRAFT = 'CRAFT',
  LIBS = 'LIBS'
}

export interface PromptVariableOption {
  value: string;
  label: string;
  labelEn: string;
}

export interface PromptVariable {
  key: string;
  label: string;
  labelEn: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  options?: PromptVariableOption[];
  placeholder?: string;
  placeholderEn?: string;
  default?: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  category: TaskType;
  description: string;
  descriptionEn: string;
  template: string;
  variables: PromptVariable[];
}