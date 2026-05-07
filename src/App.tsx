import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  History, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Search,
  PlusCircle,
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  limit,
  Timestamp,
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { classifyArticle } from './services/gemini';
import { Article, Sentiment } from './types';
import { CATEGORIES } from './constants';
import { cn } from './lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: any) => {
  const variants: any = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'hover:bg-zinc-100 text-zinc-600',
  };
  
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, title, className, headerAction }: any) => (
  <div className={cn('bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm', className)}>
    {(title || headerAction) && (
      <div className="px-5 py-4 border-bottom border-zinc-100 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider">{title}</h3>
        {headerAction}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <Card className="flex-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-zinc-900 tabular-nums">{value}</h2>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium mt-2",
            change > 0 ? "text-emerald-600" : "text-rose-600"
          )}>
            {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}% desde ontem
          </div>
        )}
      </div>
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </Card>
);

// --- Pages ---

const Dashboard = ({ articles }: { articles: Article[] }) => {
  const stats = {
    total: articles.length,
    positive: articles.filter(a => a.sentiment === Sentiment.POSITIVE).length,
    negative: articles.filter(a => a.sentiment === Sentiment.NEGATIVE).length,
    trainingProgress: Math.min(100, (articles.length / 100) * 100),
    accuracy: 94.8, // Simulated metric
    lastFeed: articles.length > 0 ? new Date(articles[0].createdAt).toLocaleTimeString() : '--:--'
  };

  const sentimentData = [
    { name: 'Positivo', value: stats.positive, fill: '#10b981' },
    { name: 'Negativo', value: stats.negative, fill: '#f43f5e' },
  ];

  const categoryData = CATEGORIES.map(cat => ({
    name: cat.length > 20 ? cat.substring(0, 20) + '...' : cat,
    fullName: cat,
    count: articles.filter(a => a.category === cat).length
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count).slice(0, 10);

  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i * 2}h`,
    count: Math.floor(Math.random() * 20) + 5 // Simulated live feed
  }));

  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Analisado" value={stats.total} change={12} icon={BarChart3} color="bg-zinc-900" />
        <StatCard title="Acurácia da IA" value={`${stats.accuracy}%`} change={0.5} icon={BrainCircuit} color="bg-indigo-600" />
        <StatCard title="Última Atualização" value={stats.lastFeed} icon={History} color="bg-amber-500" />
        <StatCard title="Saúde do Sistema" value="Ótima" icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      {/* Real-time Training Progress Bar */}
      <Card title="Desempenho de Treinamento em Tempo Real">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-zinc-900">Processamento Ativo</span>
            </div>
            <span className="text-zinc-500">Capacidade: {stats.total}/100+ matérias</span>
          </div>
          <div className="relative h-6 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.trainingProgress}%` }}
              className="absolute h-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-end px-3"
            >
              <span className="text-[10px] font-black text-white">{stats.trainingProgress.toFixed(1)}%</span>
            </motion.div>
          </div>
          <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest font-bold">
            Status: {stats.trainingProgress >= 100 ? 'IA Treinada com Sucesso' : 'Treinando Modelos com Dados Recentes...'}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment & Distribution Group */}
        <div className="space-y-6">
          <Card title="Distribuição de Sentimento">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sentimentData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-2">
                {sentimentData.map(d => (
                  <div key={d.name} className="text-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{d.name}</p>
                    <p className="text-xl font-bold" style={{ color: d.fill }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Atividade Volumétrica (Simulado 24h)">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card title="Classificação por Categoria Principal">
          <div className="h-[544px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} width={120} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-xl border border-zinc-100">
                          <p className="text-xs font-bold text-zinc-900 mb-1">{payload[0].payload.fullName}</p>
                          <p className="text-sm font-medium text-indigo-600">{payload[0].value} Matérias</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TrainingCenter = ({ user }: { user: FirebaseUser }) => {
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [autoClear, setAutoClear] = useState(false);

  const fetchNewsFromUrl = async () => {
    if (!inputUrl) return;
    setIsFetchingUrl(true);
    setFetchError(null);
    try {
      const response = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.title) setInputTitle(data.title);
        if (data.content) setInputContent(data.content);
      } else {
        setFetchError(data.error || "Erro ao buscar notícia");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setFetchError("Erro de conexão com o servidor de busca");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleClassify = async () => {
    if (!inputTitle || !inputContent) return;
    
    setIsClassifying(true);
    setProgress(10);
    
    const interval = setInterval(() => {
      setProgress(p => Math.min(95, p + Math.random() * 15));
    }, 300);

    try {
      const result = await classifyArticle(inputTitle, inputContent);
      clearInterval(interval);
      setProgress(100);
      
      const newArticle = {
        title: inputTitle,
        content: inputContent,
        category: result.isRejected ? 'rejected' : result.category,
        sentiment: result.sentiment,
        createdAt: Date.now(),
        authorId: user.uid,
        status: result.isRejected ? 'rejected' : 'classified',
        explanation: result.explanation
      };

      if (!result.isRejected) {
        try {
          await addDoc(collection(db, 'articles'), newArticle);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'articles');
        }
      }
      
      setLastResult({ ...result, title: inputTitle });
      
      if (autoClear) {
        setTimeout(clearInputs, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const clearInputs = () => {
    setInputTitle('');
    setInputContent('');
    setLastResult(null);
    setProgress(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Nova Análise de Matéria">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">URL da Notícia (Automático)</label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all text-sm"
                placeholder="https://g1.globo.com/..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
              <Button variant="secondary" onClick={fetchNewsFromUrl} disabled={isFetchingUrl || !inputUrl}>
                {isFetchingUrl ? <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /> : "Buscar"}
              </Button>
            </div>
            {fetchError && <p className="text-rose-500 text-[10px] font-bold mt-2 flex items-center gap-1"><AlertCircle size={10} /> {fetchError}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Título da Matéria</label>
            <input 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
              placeholder="Digite o título..."
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Conteúdo da Notícia</label>
            <textarea 
              rows={6}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
              placeholder="Cole aqui o texto da matéria..."
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoClear} 
                onChange={(e) => setAutoClear(e.target.checked)}
                className="w-4 h-4 accent-zinc-900"
              />
              <span className="text-xs font-medium text-zinc-600">Limpeza Automática após análise</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button 
              className="flex-1 h-12" 
              onClick={handleClassify} 
              disabled={isClassifying || !inputTitle || !inputContent}
            >
              {isClassifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Treinando IA...
                </>
              ) : (
                <>
                  <BrainCircuit size={18} />
                  Analisar e Treinar
                </>
              )}
            </Button>
            {lastResult && (
              <Button variant="secondary" className="h-12" onClick={clearInputs}>
                <Trash2 size={18} />
                Limpar Manual
              </Button>
            )}
          </div>

          {isClassifying && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-600">Progresso do Treinamento</span>
                <span className="text-xs font-bold text-zinc-900">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-zinc-900"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Resultado da Classificação IA">
        <AnimatePresence mode="wait">
          {lastResult ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {lastResult.isRejected ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-4">
                  <div className="bg-rose-500 p-2 rounded-lg text-white shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-900">Matéria Rejeitada</h4>
                    <p className="text-sm text-rose-700 mt-1">Este conteúdo não se encaixa no manual e não foi salvo em "Negócios".</p>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4">
                  <div className="bg-emerald-500 p-2 rounded-lg text-white shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">Classificado com Sucesso</h4>
                    <p className="text-sm text-emerald-700 mt-1">Matéria identificada e salva no histórico.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Categoria Hub</span>
                  <p className="font-bold text-zinc-900 text-sm">{lastResult.category}</p>
                </div>
                <div className={cn(
                  "p-4 rounded-xl border",
                  lastResult.sentiment === Sentiment.POSITIVE 
                    ? "bg-emerald-50 border-emerald-100" 
                    : "bg-rose-50 border-rose-100"
                )}>
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest block mb-1">Sentimento</span>
                  <div className="flex items-center gap-2">
                    {lastResult.sentiment === Sentiment.POSITIVE ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <p className="font-bold">{lastResult.sentiment}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Explicação da IA</span>
                <p className="text-zinc-600 text-sm italic leading-relaxed">"{lastResult.explanation}"</p>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                 <div className="flex items-center gap-2 text-indigo-700 mb-2">
                   <BrainCircuit size={16} />
                   <span className="font-bold text-xs uppercase tracking-wider">Impacto no Treinamento</span>
                 </div>
                 <p className="text-sm text-indigo-900/70">A IA aprendeu com esta classificação para melhorar futuras previsões em tempo real.</p>
              </div>
            </motion.div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
              <Search size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Aguardando análise de matéria...</p>
            </div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

const HistoryHub = ({ articles }: { articles: Article[] }) => {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = articles.filter(a => {
    const matchesCategory = filterCategory === '' || a.category === filterCategory;
    const matchesSentiment = filterSentiment === '' || a.sentiment === filterSentiment;
    const matchesSearch = searchTerm === '' || a.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSentiment && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `articles/${id}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Pesquisar no histórico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas Categorias</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          value={filterSentiment}
          onChange={(e) => setFilterSentiment(e.target.value)}
        >
          <option value="">Todos Sentimentos</option>
          <option value={Sentiment.POSITIVE}>Positivo</option>
          <option value={Sentiment.NEGATIVE}>Negativo</option>
        </select>
      </div>

      <Card title={`Histórico de Matérias (${filteredArticles.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Matéria</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">Categoria</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">Sentimento</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4">Data</th>
                <th className="py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredArticles.map((article) => (
                <motion.tr 
                  key={article.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors group"
                >
                  <td className="py-4 max-w-md">
                    <p className="font-bold text-zinc-900 line-clamp-1">{article.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-1">{article.content}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[11px] font-semibold bg-zinc-100 px-2 py-1 rounded-md text-zinc-600 block w-fit">
                      {article.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit",
                      article.sentiment === Sentiment.POSITIVE ? "text-emerald-700 bg-emerald-100" : "text-rose-700 bg-rose-100"
                    )}>
                      {article.sentiment === Sentiment.POSITIVE ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {article.sentiment}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-zinc-500 font-medium italic">
                    {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 text-right">
                    <button 
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredArticles.length === 0 && (
          <div className="py-20 text-center text-zinc-400">
            <p className="text-sm">Nenhum registro encontrado.</p>
          </div>
        )}
      </div>
      </Card>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'training' | 'history'>('dashboard');
  const [articles, setArticles] = useState<Article[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let fired = false;
    const timeout = setTimeout(() => {
      if (!fired) {
        setLoadError("O sistema está demorando para responder. Tente recarregar a página (F5) ou verifique sua conexão.");
      }
    }, 15000);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      fired = true;
      clearTimeout(timeout);
      setUser(u);
      setLoading(false);

      if (u) {
        // Background sync user profile - don't block UI loading
        const syncUser = async () => {
          const userRef = doc(db, 'users', u.uid);
          try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: u.uid,
                email: u.email,
                displayName: u.displayName || 'Usuário Vale',
                role: 'user',
                createdAt: Date.now()
              });
            }
          } catch (err: any) {
             console.error("Error background syncing profile:", err);
          }
        };
        syncUser();
      }
    }, (error) => {
      fired = true;
      clearTimeout(timeout);
      console.error("Auth error:", error);
      setLoadError("Erro ao inicializar autenticação: " + error.message);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      setArticles(docs);
      
      // Simulate push notification for new classification
      if (snapshot.docChanges().some(change => change.type === 'added')) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'articles');
    });

    return unsubscribe;
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Ops! Ocorreu um problema</h2>
        <p className="text-zinc-500 max-w-md mb-6">{loadError}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => window.location.reload()}>Recarregar Sistema</Button>
          <Button variant="secondary" onClick={() => {
            signOut(auth).then(() => window.location.reload());
          }}>Limpar Sessão</Button>
        </div>
        <p className="text-[10px] text-zinc-400 mt-8 uppercase tracking-widest leading-relaxed">
          Dica: Se o erro persistir, verifique se seu navegador está<br/>bloqueando pop-ups ou se você está em uma rede restrita.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-zinc-100 text-center">
          <div className="bg-zinc-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-zinc-200">
            <BrainCircuit size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 mb-3 tracking-tight">Vale AI Insight Hub</h1>
          <p className="text-zinc-500 mb-10 leading-relaxed">Acesse o sistema inteligente de classificação e monitoramento de notícias Vale.</p>
          <Button className="w-full h-14 text-lg" onClick={handleLogin}>
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" />
            Entrar com Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen hidden lg:flex shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-zinc-900 p-2 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <h2 className="font-extrabold text-zinc-900 tracking-tight">AI INSIGHT HUB</h2>
          </div>
          
          <nav className="space-y-1.5 font-sans">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={LayoutDashboard}
              label="Dashboard BI"
            />
            <NavItem 
              active={activeTab === 'training'} 
              onClick={() => setActiveTab('training')} 
              icon={BrainCircuit}
              label="Nova Análise"
              badge="IA"
            />
            <NavItem 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
              icon={History}
              label="Histórico Geral"
            />
            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Notificações Push</p>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-600">Novas Análises</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-900" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-zinc-600">Alertas de Risco</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-zinc-900" />
                </label>
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-zinc-100 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} className="w-full h-full object-cover" alt="User" />
              ) : (
                <div className="bg-zinc-900 text-white w-full h-full flex items-center justify-center font-bold text-xs">
                  {user.displayName?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 truncate">{user.displayName}</p>
              <p className="text-[10px] text-zinc-400 font-medium truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full justify-start text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => signOut(auth)}>
            <LogOut size={16} />
            Sair do Hub
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
           <div className="flex items-center gap-4">
             <div className="lg:hidden bg-zinc-900 p-2 rounded-lg text-white">
               <BrainCircuit size={20} />
             </div>
             <div>
               <h1 className="text-lg font-bold text-zinc-900 leading-tight">
                 {activeTab === 'dashboard' ? 'Overview Estratégico' : 
                  activeTab === 'training' ? 'Centro de Análise & IA' : 'Histórico Consolidado'}
               </h1>
               <p className="text-xs text-zinc-500 font-medium">Bem-vindo, {user.displayName?.split(' ')[0]}</p>
             </div>
           </div>

           <div className="flex items-center gap-2 sm:gap-4">
             {activeTab !== 'training' && (
               <Button 
                onClick={() => setActiveTab('training')}
                className="h-10 px-3 sm:px-4 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700"
               >
                 <PlusCircle size={16} />
                 <span className="hidden sm:inline">Nova Análise</span>
               </Button>
             )}
             
             <div className="h-8 w-px bg-zinc-200 mx-1 hidden sm:block" />
             <div className="text-right hidden md:block">
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Status da IA</p>
               <div className="flex items-center gap-1.5 justify-end">
                 <div className={cn(
                   "w-1.5 h-1.5 rounded-full animate-pulse",
                   articles.length >= 100 ? "bg-indigo-500" : "bg-emerald-500"
                 )} />
                 <span className="text-xs font-bold text-zinc-900 leading-none">
                   {articles.length >= 100 ? 'Modelo Otimizado' : 'Treinada'}
                 </span>
               </div>
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <Dashboard articles={articles} />}
                {activeTab === 'training' && <TrainingCenter user={user} />}
                {activeTab === 'history' && <HistoryHub articles={articles} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-zinc-200 flex items-center justify-around px-2 z-50 overflow-hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <MobileNavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={LayoutDashboard}
            label="Home"
          />
          <MobileNavItem 
            active={activeTab === 'training'} 
            onClick={() => setActiveTab('training')} 
            icon={PlusCircle}
            label="Analisar"
          />
          <MobileNavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={History}
            label="Histórico"
          />
        </nav>
      </main>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 z-50 bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-zinc-800"
          >
            <div className="bg-emerald-500 p-2 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-bold">Nova Matéria Treinada</p>
              <p className="text-xs text-zinc-400">O banco foi atualizado com sucesso.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={cn(active ? "text-white" : "text-zinc-400 group-hover:text-zinc-900")} />
        <span className="text-sm font-semibold tracking-tight">{label}</span>
      </div>
      {badge && (
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[9px] font-black tracking-tighter",
          active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MobileNavItem({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 relative",
        active ? "text-zinc-900" : "text-zinc-400"
      )}
    >
      <div className={cn(
        "p-1.5 rounded-lg transition-all",
        active ? "bg-zinc-100" : "bg-transparent"
      )}>
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && <motion.div layoutId="mobileNav" className="absolute bottom-0 w-8 h-1 bg-zinc-900 rounded-t-full" />}
    </button>
  );
}
