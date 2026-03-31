import { Loader2 } from 'lucide-react';
import { Provider } from '@/lib/analyst-types';

const LoadingScreen = ({ provider }: { provider: Provider }) => {
  const steps = ['Parsing data structure...', 'Building analysis prompt...', 'Waiting for AI response...', 'Generating visualizations...'];

  return (
    <div className="glass-card p-12 text-center animate-slide-up">
      <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
      <p className="text-foreground font-medium mb-1">Analyzing with {provider === 'groq' ? 'Groq Llama 3' : 'Gemini 2.0'}</p>
      <div className="space-y-1.5 mt-4">
        {steps.map((step, i) => (
          <p key={i} className="text-xs text-muted-foreground animate-slide-up" style={{ animationDelay: `${i * 0.4}s` }}>
            {step}
          </p>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
