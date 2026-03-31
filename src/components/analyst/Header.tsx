import { Sparkles } from 'lucide-react';

const Header = () => (
  <header className="text-center pt-16 pb-10">
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="relative p-3 rounded-2xl bg-primary/10 border border-primary/20 animate-float">
        <Sparkles className="w-8 h-8 text-primary" />
        <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
        Insight<span className="text-gradient">CSV</span>
      </h1>
    </div>
    <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
      Upload your data. Ask anything. Get AI-powered insights, charts & code — instantly.
    </p>
    <div className="flex items-center justify-center gap-6 mt-6">
      {[
        { label: 'Smart Analysis', icon: '🧠' },
        { label: 'Auto Charts', icon: '📊' },
        { label: 'Ready-to-Run Code', icon: '💻' },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </header>
);

export default Header;
