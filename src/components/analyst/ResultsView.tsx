import { useState } from 'react';
import { Lightbulb, BookOpen, Code, BarChart3, Briefcase, MessageSquare, RotateCcw, Send, Copy, Check } from 'lucide-react';
import { AnalysisResult, CSVMeta, ChartData } from '@/lib/analyst-types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

interface Props {
  result: AnalysisResult;
  meta: CSVMeta;
  resultMeta: string;
  onReset: () => void;
  onFollowup: (q: string) => Promise<string>;
}

const tooltipStyle = {
  background: 'hsl(230 16% 10%)',
  border: '1px solid hsl(230 12% 18%)',
  borderRadius: 12,
  fontSize: 12,
  boxShadow: '0 12px 40px -8px rgba(0,0,0,0.6)',
};

const ChartRenderer = ({ chart }: { chart: ChartData }) => {
  const { type, data, xKey = 'label', yKey = 'value', nameKey = 'name', valueKey = 'value', title } = chart;

  return (
    <div className="rounded-xl p-5 border border-border/20 bg-muted/15 hover:border-border/30 transition-colors">
      <h4 className="text-sm font-bold text-foreground mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 12% 16%)" opacity={0.4} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230 12% 16%)" opacity={0.4} />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(220 10% 50%)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey={yKey} stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#3b82f6' }} />
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={90} innerRadius={42} paddingAngle={3} label={{ fontSize: 11, fill: 'hsl(220 10% 50%)' }}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const Section = ({ icon, title, badge, children, delay = 0 }: { icon: React.ReactNode; title: string; badge?: string; children: React.ReactNode; delay?: number }) => (
  <div className="glass-card p-7 animate-slide-up" style={{ animationDelay: `${delay}s` }}>
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl bg-muted/40 border border-border/20">
        {icon}
      </div>
      <h3 className="section-title text-lg">{title}</h3>
      {badge && <span className="badge-pill bg-primary/10 text-primary ml-auto">{badge}</span>}
    </div>
    {children}
  </div>
);

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 border border-border/20"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="rounded-xl p-5 text-xs font-mono text-foreground/90 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-border/15 bg-muted/20">{code}</pre>
    </div>
  );
};

const ResultsView = ({ result, meta, resultMeta, onReset, onFollowup }: Props) => {
  const [followupQ, setFollowupQ] = useState('');
  const [followupA, setFollowupA] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);

  const handleFollowup = async () => {
    if (!followupQ.trim()) return;
    setFollowupLoading(true);
    try {
      const answer = await onFollowup(followupQ);
      setFollowupA(answer);
    } catch (err: any) {
      setFollowupA('Error: ' + err.message);
    }
    setFollowupLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between glass-card px-6 py-4">
        <p className="text-xs text-muted-foreground truncate font-medium">{resultMeta}</p>
        <button onClick={onReset} className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0 ml-4 px-3 py-1.5 rounded-lg hover:bg-primary/5">
          <RotateCcw className="w-3.5 h-3.5" /> New Analysis
        </button>
      </div>

      {/* 1. Insight */}
      <Section icon={<Lightbulb className="w-4.5 h-4.5 text-secondary" />} title="Key Insight" badge="AI Generated" delay={0}>
        <p className="text-sm text-foreground/90 leading-relaxed">{result.insight}</p>
      </Section>

      {/* 2. How to Find */}
      <Section icon={<BookOpen className="w-4.5 h-4.5 text-primary" />} title="How to Find This" delay={0.08}>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.howToFind}</p>
      </Section>

      {/* 3. Code */}
      <Section icon={<Code className="w-4.5 h-4.5 text-success" />} title="Reproducible Code" badge="Python" delay={0.16}>
        <CodeBlock code={result.code} />
      </Section>

      {/* 4. Charts */}
      {result.charts.length > 0 && (
        <Section icon={<BarChart3 className="w-4.5 h-4.5 text-primary" />} title="Visualizations" badge={`${result.charts.length} chart${result.charts.length > 1 ? 's' : ''}`} delay={0.24}>
          <div className="grid gap-4 md:grid-cols-2">
            {result.charts.map((chart, i) => <ChartRenderer key={i} chart={chart} />)}
          </div>
        </Section>
      )}

      {/* 5. Recommendations */}
      {result.recommendations.length > 0 && (
        <Section icon={<Briefcase className="w-4.5 h-4.5 text-secondary" />} title="Actionable Recommendations" delay={0.32}>
          <ul className="space-y-3.5">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3.5 text-sm text-foreground/90">
                <div className="mt-1 w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-black text-primary">{i + 1}</span>
                </div>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Follow-up */}
      <Section icon={<MessageSquare className="w-4.5 h-4.5 text-primary" />} title="Ask a Follow-up" delay={0.4}>
        <div className="flex gap-3">
          <input
            value={followupQ}
            onChange={e => setFollowupQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFollowup()}
            placeholder="Dig deeper — ask a follow-up question..."
            className="input-field flex-1"
          />
          <button
            onClick={handleFollowup}
            disabled={followupLoading || !followupQ.trim()}
            className="btn-primary px-5 py-3 rounded-xl disabled:opacity-30 flex items-center gap-2 shrink-0"
          >
            {followupLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        {followupA && (
          <div className="mt-5 p-5 rounded-xl border border-border/20 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed animate-slide-up bg-muted/15">
            {followupA}
          </div>
        )}
      </Section>
    </div>
  );
};

export default ResultsView;
