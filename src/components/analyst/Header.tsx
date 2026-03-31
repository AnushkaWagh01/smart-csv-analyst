import { Sparkles, Brain, BarChart3, Code2 } from 'lucide-react';

const features = [
  { label: 'Smart Analysis', icon: Brain, color: 'text-primary' },
  { label: 'Auto Charts', icon: BarChart3, color: 'text-secondary' },
  { label: 'Ready-to-Run Code', icon: Code2, color: 'text-success' },
];

const Header = () => (
  <header className="text-center pt-20 pb-14 relative">
    {/* Decorative orb */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-primary/[0.04] blur-[80px] pointer-events-none" />

    <div className="relative flex items-center justify-center gap-4 mb-6">
      <div className="relative p-3.5 rounded-2xl bg-primary/10 border border-primary/15 animate-float">
        <Sparkles className="w-9 h-9 text-primary" />
        <div className="absolute -inset-1 rounded-2xl bg-primary/5 blur-xl animate-pulse-glow" />
      </div>
      <div>
        <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-none">
          Insight<span className="text-gradient">CSV</span>
        </h1>
      </div>
    </div>

    <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
      Upload your data. Ask anything. Get AI-powered insights,
      <br className="hidden md:block" />
      charts & code — <span className="text-foreground font-medium">instantly</span>.
    </p>

    <div className="flex items-center justify-center gap-3 md:gap-4">
      {features.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 hover:bg-muted/50 transition-all duration-300 cursor-default"
          >
            <Icon className={`w-4 h-4 ${item.color} transition-transform duration-300 group-hover:scale-110`} />
            <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  </header>
);

export default Header;
