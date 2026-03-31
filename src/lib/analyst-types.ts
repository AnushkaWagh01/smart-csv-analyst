export type Provider = 'groq' | 'gemini';

export interface ColumnIssue {
  column: string;
  nullCount: number;
  nullPercent: number;
  duplicates: number;
  outliers: number;
  dtype: string;
  suggestion: string;
}

export interface CSVMeta {
  headers: string[];
  rowCount: number;
  colCount: number;
  qualityScore: number;
  potentialScore: number;
  totalNulls: number;
  totalDups: number;
  outlierCount: number;
  sampleRows: string[][];
  columnIssues: ColumnIssue[];
  dtypes: Record<string, string>;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter';
  title: string;
  data: Array<Record<string, any>>;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

export interface AnalysisResult {
  insight: string;
  howToFind: string;
  code: string;
  charts: ChartData[];
  recommendations: string[];
}

export interface HistoryItem {
  question: string;
  score: number;
  provider: Provider;
  fileName: string;
  date: string;
  result: AnalysisResult;
  insight: string;
}
