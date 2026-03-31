import { useCallback, useRef, useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, FileText, Sparkles, ArrowRight } from 'lucide-react';
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
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="148" height="148" viewBox="0 0 148 148">
          {/* Background track */}
          <circle cx="74" cy="74" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" opacity="0.25" />
          {/* Score arc */}
          <circle
            cx="74" cy="74" r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 74 74)" className="animate-gauge-fill"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
          {/* Center text */}
          <text x="74" y="68" textAnchor="middle" className="fill-foreground font-black" fontSize="34">{score}</text>
          <text x="74" y="90" textAnchor="middle" className="fill-muted-foreground font-medium" fontSize="12">quality</text>
        </svg>
        {/* Glow behind gauge */}
        <div className="absolute inset-4 rounded-full bg-primary/5 blur-2xl" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <p className="text-xs text-muted-foreground">
          Potential: <span className="text-foreground font-semibold">{potential}/100</span>
        </p>
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
    <div className="space-y-6">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`glass-card-hover cursor-pointer group relative overflow-hidden transition-all duration-400 ${
          isDragging ? 'border-primary/50 scale-[1.01]' : ''
        } ${csvMeta ? 'p-6' : 'p-12 md:p-16'}`}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {/* Animated background shimmer */}
        <div className="absolute inset-0 animate-shimmer opacity-50 pointer-events-none" />

        {csvMeta ? (
          <div className="relative flex items-center justify-center gap-4 animate-scale-in">
            <div className="p-2.5 rounded-xl bg-success/10 border border-success/20">
              <FileText className="w-5 h-5 text-success" />
            </div>
            <div className="text-left">
              <span className="font-bold text-foreground">{fileName}</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {csvMeta.rowCount.toLocaleString()} rows · {csvMeta.colCount} columns · Click to change
              </p>
            </div>
          </div>
        ) : (
          <div className="relative text-center">
            <div className="inline-flex p-5 rounded-2xl bg-primary/[0.07] border border-primary/10 mb-5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-400">
              <Upload className="w-10 h-10 text-primary transition-transform duration-400 group-hover:scale-110 group-hover:-translate-y-0.5" />
            </div>
            <p className="text-foreground font-bold text-lg mb-1.5">Drop your CSV file here</p>
            <p className="text-sm text-muted-foreground">or click to browse · supports any .csv file</p>
          </div>
        )}
      </div>

      {/* Quality gauge and column issues */}
      {csvMeta && (
        <div className="glass-card p-7 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-7 items-center md:items-start">
            <QualityGauge score={csvMeta.qualityScore} potential={csvMeta.potentialScore} />
            <div className="flex-1 min-w-0 w-full">
              <h3 className="text-xl font-bold text-foreground mb-4 tracking-tight">Data Quality Report</h3>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <StatCard icon={<AlertTriangle className="w-4 h-4 text-secondary" />} label="Missing" value={csvMeta.totalNulls} color="secondary" />
                <StatCard icon={<CheckCircle className="w-4 h-4 text-success" />} label="Duplicates" value={csvMeta.totalDups} color="success" />
                <StatCard icon={<AlertTriangle className="w-4 h-4 text-destructive" />} label="Outliers" value={csvMeta.outlierCount} color="destructive" />
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {csvMeta.columnIssues.map(ci => (
                  <div key={ci.column} className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/20">
                    <span className="font-mono text-foreground font-semibold">{ci.column}</span>
                    <div className="flex items-center gap-2.5">
                      <span className="badge-pill bg-muted/80 text-muted-foreground">{ci.dtype}</span>
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
      <div className="glass-card p-7 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
          Ask a question about your data
        </label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g., What are the top 5 products by revenue? Show trends over time..."
          rows={3}
          className="input-field resize-none mb-4"
        />

        {!question && (
          <div className="flex flex-wrap gap-2 mb-5">
            {EXAMPLE_QUESTIONS.map((eq) => (
              <button
                key={eq}
                onClick={() => setQuestion(eq)}
                className="text-xs px-3.5 py-2 rounded-xl bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300 border border-border/20 hover:border-primary/20"
              >
                {eq}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="btn-primary w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 disabled:cursor-not-allowed"
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
  <div className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors bg-${color}/5 border-${color}/10 hover:border-${color}/20`}>
    {icon}
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default DataInput;
