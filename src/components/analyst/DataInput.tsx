import { useCallback, useRef } from 'react';
import { Upload, Search, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
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
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--secondary))' : 'hsl(var(--destructive))';

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120" className="drop-shadow-lg">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 60 60)" className="animate-gauge-fill"
          style={{ '--gauge-offset': offset } as any}
        />
        <text x="60" y="56" textAnchor="middle" className="fill-foreground text-2xl font-bold" fontSize="24">{score}</text>
        <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground" fontSize="11">/ 100</text>
      </svg>
      <p className="text-xs text-muted-foreground mt-1">Potential: {potential}/100</p>
    </div>
  );
};

const DataInput = ({ csvMeta, setCsvData, setCsvMeta, question, setQuestion, fileName, setFileName, onAnalyze, canAnalyze }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

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
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="glass-card p-8 text-center cursor-pointer hover:border-primary/40 transition-colors group"
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {csvMeta ? (
          <div className="flex items-center justify-center gap-2 text-sm text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-medium">{fileName}</span>
            <span className="text-muted-foreground">· {csvMeta.rowCount} rows · {csvMeta.colCount} columns</span>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
            <p className="text-sm text-muted-foreground">Drop a CSV file here or click to browse</p>
          </div>
        )}
      </div>

      {/* Quality gauge and column issues */}
      {csvMeta && (
        <div className="glass-card p-5 animate-slide-up">
          <div className="flex gap-6 items-start">
            <QualityGauge score={csvMeta.qualityScore} potential={csvMeta.potentialScore} />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground mb-2">Data Quality Summary</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat icon={<AlertTriangle className="w-3.5 h-3.5 text-secondary" />} label="Missing" value={csvMeta.totalNulls} />
                <Stat icon={<CheckCircle className="w-3.5 h-3.5 text-success" />} label="Duplicates" value={csvMeta.totalDups} />
                <Stat icon={<AlertTriangle className="w-3.5 h-3.5 text-destructive" />} label="Outliers" value={csvMeta.outlierCount} />
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {csvMeta.columnIssues.map(ci => (
                  <div key={ci.column} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/40">
                    <span className="font-mono text-foreground">{ci.column}</span>
                    <span className="text-muted-foreground">{ci.dtype} · {ci.suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question input */}
      <div className="glass-card p-4">
        <label className="text-xs text-muted-foreground mb-1.5 block">Ask a question about your data</label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g., What are the top 5 products by revenue? Show trends over time..."
          rows={3}
          className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="mt-3 w-full py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow disabled:animate-none"
        >
          <Search className="w-4 h-4 inline mr-2" />
          Analyze &amp; Teach Me
        </button>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="flex items-center gap-1.5 text-xs">
    {icon}
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default DataInput;
