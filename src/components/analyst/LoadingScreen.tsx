import { useState, useEffect } from 'react';
import { Loader2, Brain, BarChart3, Code, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Provider } from '@/lib/analyst-types';

const steps = [
  { label: 'Parsing data structure...', icon: Code, color: 'text-secondary' },
  { label: 'Building analysis prompt...', icon: Brain, color: 'text-primary' },
  { label: 'Waiting for AI response...', icon: Lightbulb, color: 'text-secondary' },
  { label: 'Generating visualizations...', icon: BarChart3, color: 'text-success' },
];

const LoadingScreen = ({ provider }: { provider: Provider }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-14 md:p-20 text-center animate-scale-in max-w-md mx-auto relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-primary/[0.06] blur-[60px] rounded-full pointer-events-none" />

      <div className="relative">
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse-glow" />
          <div className="relative p-4 rounded-full border border-primary/15 bg-primary/5">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-foreground mb-1.5 tracking-tight">Analyzing your data</h2>
        <p className="text-sm text-muted-foreground mb-10">
          Powered by {provider === 'groq' ? 'Groq Llama 3' : 'Gemini 2.0 Flash'}
        </p>

        <div className="space-y-2.5 text-left max-w-xs mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                  isActive
                    ? 'bg-primary/[0.07] border border-primary/15 shadow-[0_0_20px_-4px_hsl(217_91%_60%_/_0.1)]'
                    : isDone
                    ? 'opacity-50'
                    : 'opacity-25'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? step.color : 'text-muted-foreground'} ${isActive ? 'animate-pulse' : ''}`} />
                )}
                <span className={`text-sm ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
