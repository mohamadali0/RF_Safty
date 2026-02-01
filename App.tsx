
import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, Shield, LogOut, FileText, RefreshCw, Search, ChevronDown, Bell } from 'lucide-react';
import { Violation, Comment } from './types';
import ViolationForm from './components/ViolationForm';
import ViolationCard from './components/ViolationCard';
import Login from './components/Login';
import Reports from './components/Reports';
import ViolationDetailModal from './components/ViolationDetailModal';
import { db } from './services/dbService';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'safety' | 'guest' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [view, setView] = useState<'feed' | 'report' | 'reports'>('feed');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await db.getViolations();
      setViolations([...data].reverse());
    } catch (e) {
      console.error("Error loading data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const savedName = localStorage.getItem('userName');
    if (savedRole) {
      setUserRole(savedRole as any);
      setUserName(savedName || "");
      loadData();
    }
  }, []);

  const handleLogin = (role: 'safety' | 'guest', name: string) => {
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    loadData();
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setView('feed');
  };

  const handleAddViolation = async (v: Violation) => {
    v.reporter = userName;
    await db.addViolation(v);
    setView('feed');
    setTimeout(loadData, 1500);
  };

  const handleAddComment = async (violationId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: userName,
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    };
    await db.addComment(violationId, newComment);
    loadData();
  };

  const filteredViolations = violations.filter(v => 
    v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      {/* Premium Header */}
      <header className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2.5 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Shield className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">مسبك الرياض</h1>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest -mt-1">نظام السلامة والبيئة</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end ml-4">
               <span className="text-xs font-bold text-slate-300">{userName}</span>
               <span className="text-[10px] text-slate-500 font-medium">{userRole === 'safety' ? 'موظف سلامة' : 'زائر'}</span>
             </div>
            <button onClick={loadData} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-yellow-400' : 'text-slate-400'}`} />
            </button>
            <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all text-slate-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 mb-24">
        {view === 'report' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <ViolationForm onAddViolation={handleAddViolation} onCancel={() => setView('feed')} />
          </div>
        ) : view === 'reports' ? (
          <div className="animate-in fade-in duration-500">
            <Reports violations={violations} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search Area */}
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-yellow-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="ابحث عن موقع، قسم، أو وصف مخالفة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-4 rounded-2xl border-0 bg-white shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Violation Feed */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {filteredViolations.length > 0 ? (
                filteredViolations.slice(0, visibleCount).map(v => (
                  <ViolationCard 
                    key={v.id} 
                    violation={v} 
                    userRole={userRole} 
                    onAddComment={handleAddComment}
                    onViewDetails={setSelectedViolation}
                  />
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                   <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                     <Search className="w-8 h-8 text-slate-400" />
                   </div>
                   <p className="text-slate-500 font-bold">لم يتم العثور على نتائج للبحث</p>
                </div>
              )}
              
              {visibleCount < filteredViolations.length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="w-full py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                >
                  <ChevronDown className="w-5 h-5" /> عرض المزيد من السجلات
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedViolation && (
        <ViolationDetailModal violation={selectedViolation} onClose={() => setSelectedViolation(null)} />
      )}

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 h-16 rounded-3xl flex items-center justify-around z-40 shadow-2xl px-2">
        <button 
          onClick={() => setView('feed')} 
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all ${view === 'feed' ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[9px] font-black mt-0.5">الرئيسية</span>
        </button>
        
        {userRole === 'safety' && (
          <button 
            onClick={() => setView('report')} 
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 p-4 rounded-full -mt-12 shadow-2xl shadow-yellow-500/40 border-4 border-slate-100 transition-all hover:scale-110 active:scale-95"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        )}
        
        {userRole === 'safety' && (
          <button 
            onClick={() => setView('reports')} 
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all ${view === 'reports' ? 'bg-yellow-500 text-slate-900 shadow-lg shadow-yellow-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-[9px] font-black mt-0.5">التقارير</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default App;