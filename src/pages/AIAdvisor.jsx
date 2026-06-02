import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { geminiService } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';

export default function AIAdvisor() {
  const { currentUser, isOfflineMode } = useAuth();
  
  // Dynamic user data variables
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState(null);
  
  const chatEndRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch past messages and actual diagnostic context on mount
  useEffect(() => {
    const fetchAdvisorContext = async () => {
      try {
        const expData = await databaseService.getExpenses(currentUser?.uid || 'demo_user');
        setExpenses(expData);
        const goalsData = await databaseService.getGoals(currentUser?.uid || 'demo_user');
        setGoals(goalsData);

        // Load chat history from databaseService
        const historyList = await databaseService.loadChatHistory(currentUser?.uid || 'demo_user');
        if (historyList.length > 0) {
          setMessages(historyList);
        } else {
          const welcomeMsg = { 
            sender: 'advisor', 
            text: 'Welcome to your private advisory chamber. I have synthesized your net worth profiles and asset allocation pipelines. Ask me anything regarding equity rebalancing, tax structures, or capital optimization.',
            timestamp: new Date().toISOString()
          };
          setMessages([welcomeMsg]);
          await databaseService.saveChatHistory(welcomeMsg, currentUser?.uid || 'demo_user');
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchAdvisorContext();
  }, [currentUser, isOfflineMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveMessage = async (msg) => {
    setMessages(prev => [...prev, msg]);
    await databaseService.saveChatHistory(msg, currentUser?.uid || 'demo_user');
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    
    const userMsg = { 
      sender: 'user', 
      text: userText, 
      timestamp: new Date().toISOString() 
    };
    await saveMessage(userMsg);
    setLoading(true);

    const userData = {
      name: currentUser?.name || currentUser?.email?.split('@')[0],
      age: currentUser?.age || 28,
      occupation: currentUser?.occupation || 'Venture Capitalist',
      income: currentUser?.monthlyIncome || 150000,
      expenses: currentUser?.monthlyExpenses || 60000,
      goals: goals.map(g => g.name),
      loggedExpenses: expenses
    };

    try {
      const responseText = await geminiService.askAdvisor(userText, userData);
      const advisorMsg = { 
        sender: 'advisor', 
        text: responseText, 
        timestamp: new Date().toISOString() 
      };
      
      setMessages(prev => [...prev, advisorMsg]);
      await databaseService.saveChatHistory(advisorMsg, currentUser?.uid || 'demo_user');

    } catch (err) {
      console.error("AI Advisor response generation failed:", err);
      const errMsg = {
        sender: 'advisor',
        text: "Apologies. My financial connection encountered an institutional timeout. Please query again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    // Retain welcome message but clear rest of discussion visually
    const welcomeMsg = { 
      sender: 'advisor', 
      text: 'Welcome to your private advisory chamber. I have synthesized your net worth profiles and asset allocation pipelines. Ask me anything regarding equity rebalancing, tax structures, or capital optimization.',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMsg]);
    showToast("New chat session started", "success");
  };

  const handleClearChat = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await databaseService.clearChatHistory(currentUser?.uid || 'demo_user');
      
      const welcomeMsg = { 
        sender: 'advisor', 
        text: 'Welcome to your private advisory chamber. I have synthesized your net worth profiles and asset allocation pipelines. Ask me anything regarding equity rebalancing, tax structures, or capital optimization.',
        timestamp: new Date().toISOString()
      };
      
      setMessages([welcomeMsg]);
      await databaseService.saveChatHistory(welcomeMsg, currentUser?.uid || 'demo_user');
      showToast("Chat history cleared", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to clear chat history", "error");
    } finally {
      setClearing(false);
    }
  };

  // Helper to parse Gemini's standard structured response into cards
  const parseAdvisorMessage = (text) => {
    const hasAnalysis = text.includes('### Analysis');
    const hasAdvice = text.includes('### Advice') || text.includes('### Recommendation');
    const hasActions = text.includes('### Action Steps');

    if (hasAnalysis || hasAdvice || hasActions) {
      const analysisMatch = text.match(/### Analysis([\s\S]*?)(### Advice|### Recommendation|### Action Steps|$)/i);
      const adviceMatch = text.match(/### (Advice|Recommendation)([\s\S]*?)(### Action Steps|$)/i);
      const actionsMatch = text.match(/### Action Steps([\s\S]*?)$/i);

      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : '',
        advice: adviceMatch ? adviceMatch[2].trim() : '',
        actions: actionsMatch ? actionsMatch[1].trim() : ''
      };
    }
    return null;
  };

  const prompts = [
    "How can I save ₹10000?",
    "Where should I invest?",
    "Analyze my spending"
  ];

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen">
      <Navbar />
      <Sidebar />
      
      <main className="lg:pl-64 pt-20">
        <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-5rem)] flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-subtle pb-4 text-left">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-secondary font-bold">Fiduciary Grade AI</span>
              <h1 className="font-display-lg text-headline-lg font-bold">Wealth Advisor Chamber</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="text-[9px] py-1.5 px-3 border-subtle/80 text-on-surface hover:bg-surface-glass"
                onClick={handleNewChat}
                disabled={messages.length <= 1}
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                New Chat
              </Button>
              <Button 
                variant="outline" 
                className="text-[9px] py-1.5 px-3 border-red-500/20 text-red-400 hover:bg-red-500/5 hover:border-red-500/40"
                onClick={handleClearChat}
                disabled={clearing || messages.length <= 1}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                Clear History
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
                <span className="text-xs text-primary uppercase font-mono tracking-wider font-bold">Active Synapse</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto my-6 space-y-6 pr-2">
            {messages.map((m, idx) => {
              const structured = m.sender === 'advisor' ? parseAdvisorMessage(m.text) : null;
              
              return (
                <div 
                  key={idx} 
                  className={`flex gap-4 ${m.sender === 'user' ? 'justify-end' : 'justify-start'} text-left`}
                >
                  {m.sender === 'advisor' && (
                    <div className="w-8 h-8 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                    </div>
                  )}
                  
                  <div className="flex-1 max-w-2xl space-y-3">
                    {/* Render User Bubble */}
                    {m.sender === 'user' && (
                      <div className="flex justify-end">
                        <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl rounded-tr-none text-sm leading-relaxed max-w-xl">
                          <p className="text-xs text-on-surface/90">{m.text}</p>
                          {m.timestamp && (
                            <span className="text-[8px] text-on-surface-variant/40 block text-right mt-2 font-mono">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Render Advisor bubble as Structured Cards */}
                    {m.sender === 'advisor' && structured ? (
                      <div className="space-y-4 max-w-xl">
                        {/* Analysis Card */}
                        {structured.analysis && (
                          <div className="glass-card border-l-4 border-l-primary/70 border-subtle p-5 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                            <div className="flex items-center gap-1.5 mb-2.5 text-primary">
                              <span className="material-symbols-outlined text-sm font-bold">query_stats</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold">Portfolio Analysis</span>
                            </div>
                            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-on-surface/90">
                              <ReactMarkdown>{structured.analysis}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Recommendation Card */}
                        {structured.advice && (
                          <div className="glass-card border-l-4 border-l-secondary/70 border-subtle p-5 rounded-2xl text-sm leading-relaxed">
                            <div className="flex items-center gap-1.5 mb-2.5 text-secondary">
                              <span className="material-symbols-outlined text-sm font-bold">lightbulb</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold">Recommendation</span>
                            </div>
                            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-on-surface/90">
                              <ReactMarkdown>{structured.advice}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Action Steps Card */}
                        {structured.actions && (
                          <div className="glass-card border-l-4 border-l-blue-400/70 border-subtle p-5 rounded-2xl text-sm leading-relaxed">
                            <div className="flex items-center gap-1.5 mb-2.5 text-blue-400">
                              <span className="material-symbols-outlined text-sm font-bold">playlist_add_check</span>
                              <span className="text-[10px] uppercase tracking-widest font-bold">Action Steps</span>
                            </div>
                            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-on-surface/90">
                              <ReactMarkdown>{structured.actions}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {m.timestamp && (
                          <span className="text-[8px] text-on-surface-variant/40 block text-left mt-1 pl-2 font-mono">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Render standard bubble with ReactMarkdown for general responses */
                      m.sender === 'advisor' && (
                        <div className="glass-card border border-subtle p-5 rounded-2xl rounded-tl-none text-sm leading-relaxed max-w-xl">
                          <div className="flex items-center gap-2 mb-2 text-secondary">
                            <span className="text-[10px] uppercase tracking-widest font-bold">FINORA TRUST ADVISOR</span>
                          </div>
                          
                          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-on-surface/90">
                            <ReactMarkdown
                              components={{
                                h1: ({node, ...props}) => node && <h1 className="text-sm font-bold text-primary mt-3 mb-1.5 border-b border-subtle/30 pb-1" {...props} />,
                                h2: ({node, ...props}) => node && <h2 className="text-xs font-bold text-primary mt-2.5 mb-1" {...props} />,
                                h3: ({node, ...props}) => node && <h3 className="text-[11px] font-bold text-secondary mt-2 mb-1" {...props} />,
                                p: ({node, ...props}) => node && <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({node, ...props}) => node && <ul className="list-disc pl-4 mb-2 space-y-1 text-on-surface-variant/90" {...props} />,
                                ol: ({node, ...props}) => node && <ol className="list-decimal pl-4 mb-2 space-y-1 text-on-surface-variant/90" {...props} />,
                                li: ({node, ...props}) => node && <li className="mb-0.5" {...props} />,
                                strong: ({node, ...props}) => node && <strong className="font-bold text-secondary" {...props} />,
                                table: ({node, ...props}) => node && <div className="overflow-x-auto my-3"><table className="w-full text-xs text-left border border-subtle/50 rounded-lg divide-y divide-subtle/50" {...props} /></div>,
                                thead: ({node, ...props}) => node && <thead className="bg-surface-container font-bold text-on-surface-variant" {...props} />,
                                tbody: ({node, ...props}) => node && <tbody className="divide-y divide-subtle/30" {...props} />,
                                tr: ({node, ...props}) => node && <tr className="hover:bg-surface-glass/40 transition-colors" {...props} />,
                                th: ({node, ...props}) => node && <th className="px-3 py-2 border-r border-subtle/30 last:border-0" {...props} />,
                                td: ({node, ...props}) => node && <td className="px-3 py-2 border-r border-subtle/30 last:border-0 font-mono" {...props} />
                              }}
                            >
                              {m.text}
                            </ReactMarkdown>
                          </div>

                          {m.timestamp && (
                            <span className="text-[8px] text-on-surface-variant/40 block text-right mt-2 font-mono">
                              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {loading && (
              <div className="flex gap-4 justify-start text-left">
                <div className="w-8 h-8 rounded-full bg-secondary/15 border border-secondary/20 flex items-center justify-center flex-shrink-0 animate-pulse mt-1">
                  <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                </div>
                <div className="max-w-xl p-5 rounded-2xl border border-subtle glass-card flex items-center gap-3 rounded-tl-none">
                  {/* Pulsing AI thinking loader */}
                  <div className="flex gap-1.5 items-center py-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-ping"></span>
                    <span className="text-xs text-primary font-bold uppercase tracking-wider font-mono">Formulating Fiduciary Mandate...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions & Input */}
          <div className="space-y-4">
            
            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start animate-fade-in">
                {prompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setInput(p); }}
                    className="text-xs bg-surface-glass hover:bg-primary/10 border border-subtle hover:border-primary/50 text-on-surface-variant hover:text-primary px-4 py-2.5 rounded-full transition-all duration-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSend} className="flex gap-4 items-center bg-surface-container rounded-xl p-2 border border-subtle/50 focus-within:border-primary/50 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query advisor on asset rebalancing, tax structures, or capital optimization..."
                className="flex-1 bg-transparent px-4 py-3 rounded-lg text-on-surface outline-none text-xs"
              />
              <Button 
                type="submit" 
                variant="secondary"
                className="py-3 px-5 flex items-center justify-center"
                disabled={loading || !input.trim()}
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </Button>
            </form>
          </div>

        </div>
      </main>

      {/* Floating status toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl border shadow-xl flex items-center gap-2 z-50 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-950/90 border-red-500/30 text-red-300'
        }`}>
          <span className="material-symbols-outlined text-base">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
