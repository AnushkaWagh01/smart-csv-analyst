import { useState } from 'react';
import { Key, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { Provider } from '@/lib/analyst-types';

interface Props {
  groqApiKey: string; setGroqApiKey: (k: string) => void;
  geminiApiKey: string; setGeminiApiKey: (k: string) => void;
  provider: Provider; setProvider: (p: Provider) => void;
  fallback: boolean; setFallback: (f: boolean) => void;
}

const ApiConfig = ({ groqApiKey, setGroqApiKey, geminiApiKey, setGeminiApiKey, provider, setProvider, fallback, setFallback }: Props) => {
  const [open, setOpen] = useState(false);
  const configured = groqApiKey || geminiApiKey;

  return (
    <div className="glass-card mb-6 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/10 transition-colors">
        <div className="flex items-center gap-3 text-sm font-bold text-foreground">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/10">
            <Key className="w-3.5 h-3.5 text-primary" />
          </div>
          API Configuration
          {configured && <span className="badge-pill bg-success/10 text-success border border-success/15">configured</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 px-3 py-2 rounded-lg bg-muted/20 border border-border/15">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            Keys are stored locally in your browser only — never sent to our servers.
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Groq API Key</label>
            <input type="password" value={groqApiKey} onChange={e => setGroqApiKey(e.target.value)} placeholder="gsk_..." className="input-field" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Gemini API Key</label>
            <input type="password" value={geminiApiKey} onChange={e => setGeminiApiKey(e.target.value)} placeholder="AIza..." className="input-field" />
          </div>
          <div className="flex items-center gap-5 pt-1">
            <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/20">
              {(['groq', 'gemini'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-5 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${
                    provider === p ? 'btn-primary shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {p === 'groq' ? 'Groq' : 'Gemini'}
                </button>
              ))}
            </div>
            <button onClick={() => setFallback(!fallback)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {fallback ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
              <span className="font-semibold">Auto-fallback</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiConfig;
