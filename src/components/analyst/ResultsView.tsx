import { useState } from 'react';
import { Lightbulb, BookOpen, Code, BarChart3, Briefcase, MessageSquare, RotateCcw, Send } from 'lucide-react';
import { AnalysisResult, CSVMeta, ChartData } from '@/lib/analyst-types';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Props {
  result: AnalysisResult;
  meta: CSVMeta;
  resultMeta: string;
  onReset: () => void;
  onFollowup: (q: string) => Promise<string>;
}

const ChartRenderer = ({ chart }: { chart: ChartData }) => {
  const { type, data, xKey = 'label', yKey = 'value', nameKey = 'name', valueKey = 'value', title } = chart;

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <h4 className="text-xs font-medium text-foreground mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey={yKey} stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={yKey} fill="#3b82f6" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const Section = ({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) => (
  <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${delay}s` }}>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </div>
);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{resultMeta}</p>
        <button onClick={onReset} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> New Analysis
        </button>
      </div>

      {/* 1. Insight */}
      <Section icon={<Lightbulb className="w-4 h-4 text-secondary" />} title="Key Insight" delay={0}>
        <p className="text-sm text-foreground leading-relaxed">{result.insight}</p>
      </Section>

      {/* 2. How to Find */}
      <Section icon={<BookOpen className="w-4 h-4 text-primary" />} title="How to Find This" delay={0.1}>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.howToFind}</p>
      </Section>

      {/* 3. Code */}
      <Section icon={<Code className="w-4 h-4 text-success" />} title="Reproducible Code" delay={0.2}>
        <pre className="bg-muted/50 rounded-md p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">{result.code}</pre>
      </Section>

      {/* 4. Charts */}
      {result.charts.length > 0 && (
        <Section icon={<BarChart3 className="w-4 h-4 text-primary" />} title="Visualizations" delay={0.3}>
          <div className="grid gap-4">
            {result.charts.map((chart, i) => <ChartRenderer key={i} chart={chart} />)}
          </div>
        </Section>
      )}

      {/* 5. Recommendations */}
      {result.recommendations.length > 0 && (
        <Section icon={<Briefcase className="w-4 h-4 text-secondary" />} title="Business Recommendations" delay={0.4}>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Follow-up */}
      <Section icon={<MessageSquare className="w-4 h-4 text-primary" />} title="Follow-up Question" delay={0.5}>
        <div className="flex gap-2">
          <input
            value={followupQ}
            onChange={e => setFollowupQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFollowup()}
            placeholder="Ask a follow-up question..."
            className="flex-1 bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleFollowup}
            disabled={followupLoading || !followupQ.trim()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {followupA && (
          <div className="mt-3 p-3 rounded-md bg-muted/40 text-sm text-foreground whitespace-pre-wrap">{followupA}</div>
        )}
      </Section>
    </div>
  );
};

export default ResultsView;
