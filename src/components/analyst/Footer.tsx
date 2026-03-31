import { Sparkles } from 'lucide-react';

const Footer = () => (
  <footer className="text-center py-8 mt-12 border-t border-border/20">
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <Sparkles className="w-3 h-3 text-primary" />
      <span>Built with <span className="text-foreground font-medium">Lovable</span> · Powered by <span className="text-foreground font-medium">Groq</span> & <span className="text-foreground font-medium">Gemini</span></span>
    </div>
  </footer>
);

export default Footer;
