import { BarChart3 } from 'lucide-react';

const Header = () => (
  <header className="text-center pt-12 pb-8">
    <div className="flex items-center justify-center gap-3 mb-3">
      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
        <BarChart3 className="w-7 h-7 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground tracking-tight">
        CSV <span className="text-gradient">Analyst</span>
      </h1>
    </div>
    <p className="text-muted-foreground text-sm max-w-md mx-auto">
      Upload your data, ask a question, and get AI-powered insights with charts and code
    </p>
  </header>
);

export default Header;
