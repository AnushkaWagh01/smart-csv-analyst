import { Clock, Trash2, X, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { HistoryItem } from '@/lib/analyst-types';

interface Props {
  history: HistoryItem[];
  isOpen: boolean;
  onToggle: () => void;
  onLoad: (i: number) => void;
  onDelete: (i: number) => void;
  onClear: () => void;
}

const exportHistory = (history: HistoryItem[]) => {
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `insightcsv-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const HistoryPanel = ({ history, isOpen, onToggle, onLoad, onDelete, onClear }: Props) => (
  <div className="glass-card mb-6 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/10 transition-colors">
      <div className="flex items-center gap-3 text-sm font-bold text-foreground">
        <div className="p-1.5 rounded-lg bg-secondary/10 border border-secondary/10">
          <Clock className="w-3.5 h-3.5 text-secondary" />
        </div>
        Analysis History
        {history.length > 0 && (
          <span className="badge-pill bg-secondary/10 text-secondary border border-secondary/15">{history.length}</span>
        )}
      </div>
      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>

    {isOpen && (
      <div className="px-6 pb-6 animate-slide-up">
        {history.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No analyses yet. Your history will appear here.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 hover:bg-muted/35 transition-all duration-300 group border border-transparent hover:border-border/20">
                  <button onClick={() => onLoad(i)} className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.question}</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="badge-pill bg-muted/60 text-muted-foreground">{item.provider}</span>
                      <span className="text-[11px] text-muted-foreground">{item.fileName}</span>
                      <span className="text-[11px] text-muted-foreground/60">· {item.date}</span>
                    </div>
                  </button>
                  <button onClick={() => onDelete(i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/15">
              <button onClick={onClear} className="flex items-center gap-2 text-xs font-semibold text-destructive/80 hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
              <button onClick={() => exportHistory(history)} className="flex items-center gap-2 text-xs font-semibold text-primary/80 hover:text-primary transition-colors">
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
            </div>
          </>
        )}
      </div>
    )}
  </div>
);

export default HistoryPanel;
