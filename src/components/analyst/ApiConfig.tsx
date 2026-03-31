import { useState } from 'react';
import { Key, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { Provider } from '@/lib/analyst-types';

interface Props {
  groqApiKey: string; setGroqApiKey: (k: string) => void;
  geminiApiKey: string; setGeminiApiKey: (k: string) => void;
  provider: Provider; setProvider: (p: Provider) => void;
  fallback: boolean; setFallback: (f: boolean) => void;
}

const ApiConfig = ({ groqApiKey, setGroqApiKey, geminiApiKey, setGeminiApiKey, provider, setProvider, fallback, setFallback }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-card mb-4 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Key className="w-4 h-4 text-primary" />
          API Configuration
          {(groqApiKey || geminiApiKey) && <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">configured</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 animate-slide-up">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Groq API Key</label>
            <input
              type="password"
              value={groqApiKey}
              onChange={e => setGroqApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Gemini API Key</label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {(['groq', 'gemini'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    provider === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'groq' ? 'Groq' : 'Gemini'}
                </button>
              ))}
            </div>
            <button onClick={() => setFallback(!fallback)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              {fallback ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
              Fallback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiConfig;
