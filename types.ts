export enum TaskType {
  RESEARCH = 'RESEARCH',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  OUTLINE = 'OUTLINE',
  MUSIC = 'MUSIC'
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
}