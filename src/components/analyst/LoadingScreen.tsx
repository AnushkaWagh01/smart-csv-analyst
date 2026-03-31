import { useState, useEffect } from 'react';
import { Loader2, Brain, BarChart3, Code, Lightbulb } from 'lucide-react';
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
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-12 md:p-16 text-center animate-scale-in max-w-lg mx-auto">
      <div className="relative inline-flex mb-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse" />
      </div>
      
      <h2 className="text-xl font-bold text-foreground mb-1">Analyzing your data</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Powered by {provider === 'groq' ? 'Groq Llama 3' : 'Gemini 2.0 Flash'}
      </p>
      
      <div className="space-y-3 text-left max-w-xs mx-auto">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
                isActive ? 'bg-primary/10 border border-primary/20' : isDone ? 'opacity-60' : 'opacity-30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isDone ? 'text-success' : isActive ? step.color : 'text-muted-foreground'} ${isActive ? 'animate-pulse' : ''}`} />
              <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              {isDone && <span className="ml-auto text-success text-xs">✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingScreen;
