import { useState, useCallback } from 'react';
import { CSVMeta, AnalysisResult, HistoryItem, Provider } from '@/lib/analyst-types';
import { callAI, buildPrompt, parseAIResponse, askFollowupAI } from '@/lib/ai-service';
import { getHistory, addToHistory, deleteHistoryItem, clearHistory } from '@/lib/history';
import Header from '@/components/analyst/Header';
import ApiConfig from '@/components/analyst/ApiConfig';
import HistoryPanel from '@/components/analyst/HistoryPanel';
import DataInput from '@/components/analyst/DataInput';
import LoadingScreen from '@/components/analyst/LoadingScreen';
import ResultsView from '@/components/analyst/ResultsView';

type Screen = 'input' | 'loading' | 'results';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('input');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [provider, setProvider] = useState<Provider>('groq');
  const [fallback, setFallback] = useState(true);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [csvMeta, setCsvMeta] = useState<CSVMeta | null>(null);
  const [question, setQuestion] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resultMeta, setResultMeta] = useState('');
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(getHistory());

  const refreshHistory = () => setHistory(getHistory());

  const canAnalyze = csvData !== null && question.trim().length > 5;

  const handleAnalyze = useCallback(async () => {
    if (!csvMeta) return;
    console.log('[Analyze] Starting analysis...', { provider, groqKey: groqApiKey.length, geminiKey: geminiApiKey.length });
    setError('');
    setScreen('loading');
    try {
      const prompt = buildPrompt(question, csvMeta);
      console.log('[Analyze] Prompt built, calling AI...');
      const { text, provider: usedProvider } = await callAI(prompt, groqApiKey, geminiApiKey, provider, fallback);
      console.log('[Analyze] AI responded via', usedProvider);
      const parsed = parseAIResponse(text);
      console.log('[Analyze] Parsed result:', Object.keys(parsed));
      setResult(parsed);
      setResultMeta(`${fileName} · ${csvMeta.rowCount} rows · via ${usedProvider === 'groq' ? 'Groq Llama 3' : 'Gemini 2.0'}`);
      addToHistory({
        question, score: csvMeta.qualityScore, provider: usedProvider,
        fileName, date: new Date().toLocaleDateString(), result: parsed,
        insight: parsed.insight || '',
      });
      refreshHistory();
      setScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('[Analyze] Error:', err);
      setError(err.message);
      setScreen('input');
    }
  }, [csvMeta, question, groqApiKey, geminiApiKey, provider, fallback, fileName]);

  const handleReset = () => {
    setCsvData(null);
    setCsvMeta(null);
    setQuestion('');
    setFileName('');
    setResult(null);
    setError('');
    setScreen('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadHistory = (index: number) => {
    const item = history[index];
    if (!item?.result) return;
    setResult(item.result);
    setResultMeta(`From history · ${item.date} · ${item.fileName}`);
    setCsvMeta({ qualityScore: item.score, potentialScore: Math.min(100, item.score + 15), totalNulls: 0, totalDups: 0, outlierCount: 0 } as CSVMeta);
    setHistoryOpen(false);
    setScreen('results');
  };

  const handleDeleteHistory = (index: number) => {
    deleteHistoryItem(index);
    refreshHistory();
  };

  const handleClearHistory = () => {
    clearHistory();
    refreshHistory();
  };

  const handleFollowup = async (q: string) => {
    return askFollowupAI(q, csvMeta, result, groqApiKey, geminiApiKey, provider, fallback);
  };

  return (
    <div className="max-w-[940px] mx-auto px-6 pb-24 relative z-[1]">
      <Header />
      <ApiConfig
        groqApiKey={groqApiKey} setGroqApiKey={setGroqApiKey}
        geminiApiKey={geminiApiKey} setGeminiApiKey={setGeminiApiKey}
        provider={provider} setProvider={setProvider}
        fallback={fallback} setFallback={setFallback}
      />
      <HistoryPanel history={history} isOpen={historyOpen} onToggle={() => setHistoryOpen(!historyOpen)} onLoad={handleLoadHistory} onDelete={handleDeleteHistory} onClear={handleClearHistory} />

      {error && (
        <div className="bg-red-dim border border-red/25 rounded-sm px-4 py-3 text-red text-[13px] mb-4">⚠ {error}</div>
      )}

      {screen === 'input' && (
        <DataInput csvMeta={csvMeta} setCsvData={setCsvData} setCsvMeta={setCsvMeta} question={question} setQuestion={setQuestion} fileName={fileName} setFileName={setFileName} onAnalyze={handleAnalyze} canAnalyze={canAnalyze} />
      )}

      {screen === 'loading' && <LoadingScreen provider={provider} />}

      {screen === 'results' && result && csvMeta && (
        <ResultsView result={result} meta={csvMeta} resultMeta={resultMeta} onReset={handleReset} onFollowup={handleFollowup} />
      )}
    </div>
  );
};

export default Index;
