import { useCallback, useRef, useState } from 'react';
import { Upload, Search, AlertTriangle, CheckCircle, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { CSVMeta } from '@/lib/analyst-types';
import { parseCSV } from '@/lib/csv-parser';

interface Props {
  csvMeta: CSVMeta | null;
  setCsvData: (d: string | null) => void;
  setCsvMeta: (m: CSVMeta | null) => void;
  question: string;
  setQuestion: (q: string) => void;
  fileName: string;
  setFileName: (n: string) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
}

const QualityGauge = ({ score, potential }: { score: number; potential: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))';
  const bgGlow = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--secondary)' : 'var(--destructive)';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.3" />
          <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.1" />
          <circle
            cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 70 70)" className="animate-gauge-fill"
            style={{ '--gauge-offset': offset, filter: `drop-shadow(0 0 6px ${color})` } as any}
          />
          <text x="70" y="64" textAnchor="middle" className="fill-foreground font-black" fontSize="32">{score}</text>
          <text x="70" y="84" textAnchor="middle" className="fill-muted-foreground font-medium" fontSize="12">/ 100</text>
        </svg>
        <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, hsl(${bgGlow} / 0.08), transparent 70%)` }} />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <p className="text-xs text-muted-foreground">Potential: <span className="text-foreground font-medium">{potential}/100</span></p>
      </div>
    </div>
  );
};

const EXAMPLE_QUESTIONS = [
  "What are the top trends in this data?",
  "Find correlations between columns",
  "Show revenue breakdown by category",
];

const DataInput = ({ csvMeta, setCsvData, setCsvMeta, question, setQuestion, fileName, setFileName, onAnalyze, canAnalyze }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      try {
        const meta = parseCSV(text);
        setCsvMeta(meta);
      } catch (err: any) {
        setCsvMeta(null);
        alert(err.message);
      }
    };
    reader.readAsText(file);
  }, [setCsvData, setCsvMeta, setFileName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`glass-card-hover p-10 text-center cursor-pointer group relative overflow-hidden transition-all duration-300 ${
          isDragging ? 'border-primary/60 bg-primary/5' : ''
        } ${csvMeta ? 'p-6' : ''}`}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        
        {csvMeta ? (
          <div className="flex items-center justify-center gap-3 animate-scale-in">
            <div className="p-2 rounded-lg bg-success/10 border border-success/20">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground text-sm">{fileName}</span>
              <p className="text-xs text-muted-foreground">{csvMeta.rowCount.toLocaleString()} rows · {csvMeta.colCount} columns · Click to change</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="relative inline-flex p-4 rounded-2xl bg-primary/10 border border-primary/15 mb-4 group-hover:bg-primary/15 transition-colors">
              <Upload className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 rounded-2xl animate-shimmer" />
            </div>
            <p className="text-foreground font-semibold text-base mb-1">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse · supports any .csv file</p>
          </div>
        )}
      </div>

      {/* Quality gauge and column issues */}
      {csvMeta && (
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <QualityGauge score={csvMeta.qualityScore} potential={csvMeta.potentialScore} />
            <div className="flex-1 min-w-0 w-full">
              <h3 className="section-title mb-3">Data Quality Report</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <StatCard icon={<AlertTriangle className="w-4 h-4 text-secondary" />} label="Missing" value={csvMeta.totalNulls} color="secondary" />
                <StatCard icon={<CheckCircle className="w-4 h-4 text-success" />} label="Duplicates" value={csvMeta.totalDups} color="success" />
                <StatCard icon={<AlertTriangle className="w-4 h-4 text-destructive" />} label="Outliers" value={csvMeta.outlierCount} color="destructive" />
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {csvMeta.columnIssues.map(ci => (
                  <div key={ci.column} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <span className="font-mono text-foreground font-medium">{ci.column}</span>
                    <div className="flex items-center gap-2">
                      <span className="badge-pill bg-muted text-muted-foreground">{ci.dtype}</span>
                      <span className="text-muted-foreground">{ci.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question input */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Ask a question about your data
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g., What are the top 5 products by revenue? Show trends over time..."
          rows={3}
          className="input-field resize-none mb-3"
        />
        
        {!question && (
          <div className="flex flex-wrap gap-2 mb-4">
            {EXAMPLE_QUESTIONS.map((eq) => (
              <button
                key={eq}
                onClick={() => setQuestion(eq)}
                className="text-xs px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all border border-transparent hover:border-border/60"
              >
                {eq}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="btn-primary w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          Analyze & Teach Me
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) => (
  <div className={`flex items-center gap-2 p-2.5 rounded-lg bg-${color}/5 border border-${color}/10`}>
    {icon}
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default DataInput;
