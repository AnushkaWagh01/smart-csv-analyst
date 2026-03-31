import { Clock, Trash2, X } from 'lucide-react';
import { HistoryItem } from '@/lib/analyst-types';

interface Props {
  history: HistoryItem[];
  isOpen: boolean;
  onToggle: () => void;
  onLoad: (i: number) => void;
  onDelete: (i: number) => void;
  onClear: () => void;
}

const HistoryPanel = ({ history, isOpen, onToggle, onLoad, onDelete, onClear }: Props) => (
  <div className="glass-card mb-4 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock className="w-4 h-4 text-secondary" />
        History
        {history.length > 0 && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{history.length}</span>}
      </div>
    </button>

    {isOpen && (
      <div className="px-4 pb-4 animate-slide-up">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">No analyses yet</p>
        ) : (
          <>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors group">
                  <button onClick={() => onLoad(i)} className="flex-1 text-left">
                    <p className="text-xs font-medium text-foreground truncate">{item.question}</p>
                    <p className="text-[11px] text-muted-foreground">{item.fileName} · {item.date} · {item.provider}</p>
                  </button>
                  <button onClick={() => onDelete(i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={onClear} className="mt-2 flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors">
              <Trash2 className="w-3 h-3" /> Clear all
            </button>
          </>
        )}
      </div>
    )}
  </div>
);

export default HistoryPanel;
