
import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, ClipboardList, Shield, LogOut, FileText, Loader2, RefreshCw, Search, Hash, Building2, ChevronDown } from 'lucide-react';
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
  const [view, setView] = useState<'feed' | 'report' | 'edit' | 'reports'>('feed');
  const [editingViolation, setEditingViolation] = useState<Violation | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const loadData = async () => {
    setIsSyncing(true);
    const data = await db.getViolations();
    // ترتيب من الأحدث للأقدم بناءً على المعرف (الذي يحتوي عادة على التوقيت)
    const sortedData = [...data].reverse();
    setViolations(sortedData);
    setIsSyncing(false);
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    const savedName = localStorage.getItem('userName');
    
    if (savedRole) {
      setUserRole(savedRole as any);
      setUserName(savedName || "");
      loadData();
    }
  }, [userRole]);

  const handleLogin = (role: 'safety' | 'guest', name: string) => {
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setView('feed');
  };

  const handleAddViolation = async (v: Violation) => {
    try {
      v.reporter = userName;
      await db.addViolation(v);
      setView('feed');
      setTimeout(loadData, 2000); 
    } catch (e) {
      console.error("Submission failed:", e);
      throw e;
    }
  };

  const handleAddComment = async (violationId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: userName,
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    
    setViolations(prev => prev.map(v => 
      v.id === violationId ? { ...v, comments: [...(v.comments || []), newComment] } : v
    ));

    await db.addComment(violationId, newComment);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  // فلترة متطورة تشمل رقم المخالفة والقسم
  const filteredViolations = violations.filter(v => 
    v.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedViolations = filteredViolations.slice(0, visibleCount);

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg cursor-pointer" onClick={() => setView('feed')}>
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">قسم السلامة - شركة مسبك الرياض</h1>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {isSyncing ? 'جاري التحميل...' : 'جاهز'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadData} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="تحديث البيانات">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === 'report' ? (
          <div className="max-w-2xl mx-auto">
            <ViolationForm 
              onAddViolation={handleAddViolation} 
              onCancel={() => setView('feed')} 
            />
          </div>
        ) : view === 'reports' && userRole === 'safety' ? (
          <Reports violations={violations} />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                سجل الرصد
                <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                  {filteredViolations.length} مخالفة
                </span>
              </h2>
              
              {/* شريط البحث الجديد */}
              <div className="relative w-full md:w-80">
                <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="ابحث برقم المخالفة أو القسم..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(5); // إعادة تعيين العداد عند البحث
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {displayedViolations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                  {displayedViolations.map(violation => (
                    <ViolationCard 
                      key={violation.id} 
                      violation={violation} 
                      userRole={userRole} 
                      onAddComment={handleAddComment} 
                      onViewDetails={setSelectedViolation} 
                    />
                  ))}
                </div>

                {/* زر عرض المزيد */}
                {visibleCount < filteredViolations.length && (
                  <div className="flex justify-center pt-8 pb-4">
                    <button 
                      onClick={handleLoadMore}
                      className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
                    >
                      <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                      عرض 5 مخالفات أخرى
                    </button>
                  </div>
                )}
                
                {visibleCount >= filteredViolations.length && filteredViolations.length > 0 && (
                  <p className="text-center text-slate-400 text-xs font-medium py-8 italic">
                    — نهاية السجلات المتاحة —
                  </p>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100 border-dashed">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="text-slate-300 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد سجلات مطابقة</h3>
                <p className="text-slate-500">حاول تغيير عبارة البحث أو تحديث الصفحة.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setVisibleCount(5);}}
                  className="mt-4 text-blue-600 font-bold text-sm underline"
                >
                  إعادة تعيين البحث
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedViolation && (
        <ViolationDetailModal 
          violation={selectedViolation} 
          onClose={() => setSelectedViolation(null)} 
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-lg z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
          <button onClick={() => {setView('feed'); setVisibleCount(5);}} className={`flex flex-col items-center gap-1 ${view === 'feed' ? 'text-blue-600' : 'text-slate-400'}`}>
            <LayoutGrid className="w-6 h-6" /> <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          {userRole === 'safety' && (
            <button onClick={() => setView('report')} className="bg-blue-600 text-white p-4 rounded-full -mt-12 border-4 border-slate-50 shadow-lg active:scale-95 transition-transform">
              <Plus className="w-6 h-6" />
            </button>
          )}
          {userRole === 'safety' && (
            <button className={`flex flex-col items-center gap-1 ${view === 'reports' ? 'text-blue-600' : 'text-slate-400'}`} onClick={() => setView('reports')}>
              <FileText className="w-6 h-6" /> <span className="text-[10px] font-bold">الإحصائيات</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default App;
