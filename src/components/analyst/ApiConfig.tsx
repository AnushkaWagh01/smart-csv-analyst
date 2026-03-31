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
    <div className="glass-card mb-5 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
          <Key className="w-4 h-4 text-primary" />
          API Configuration
          {configured && <span className="badge-pill bg-success/10 text-success">configured</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 animate-slide-up">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            Keys are stored locally in your browser only — never sent to our servers.
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Groq API Key</label>
            <input
              type="password"
              value={groqApiKey}
              onChange={e => setGroqApiKey(e.target.value)}
              placeholder="gsk_..."
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gemini API Key</label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              placeholder="AIza..."
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-muted/40 rounded-xl">
              {(['groq', 'gemini'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${
                    provider === p ? 'btn-primary shadow-md' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'groq' ? 'Groq' : 'Gemini'}
                </button>
              ))}
            </div>
            <button onClick={() => setFallback(!fallback)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {fallback ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
              <span className="font-medium">Auto-fallback</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiConfig;
