
import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, Info, ChevronDown } from 'lucide-react';

interface Props {
  onLogin: (role: 'safety' | 'guest', name: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'guest'>('safety');
  const [selectedUser, setSelectedUser] = useState('فواز الرويلي');
  const [password, setPassword] = useState('');

  const safetyUsers = [
    { name: 'فواز الرويلي', password: 'fawaz@2026' },
    { name: 'فيصل القوصي', password: 'faisal@2026' }
  ];

  const handleSafetyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = safetyUsers.find(u => u.name === selectedUser);
    
    if (user && password === user.password) {
      onLogin('safety', user.name);
    } else {
      alert('كلمة المرور غير صحيحة لهذا المستخدم');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">نظام قسم السلامة - شركة مسبك الرياض</h2>
          <p className="mt-2 text-sm text-slate-500">منصة رصد ومتابعة مخالفات السلامة</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'safety' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" /> موظف سلامة
          </button>
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guest' ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" /> دخول ضيف
          </button>
        </div>

        {activeTab === 'safety' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSafetyLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 mr-2 mb-1 block">اختر الموظف</label>
                <div className="relative">
                  <User className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 z-10" />
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-10 py-3 border border-slate-200 text-slate-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm bg-slate-50"
                  >
                    {safetyUsers.map(u => (
                      <option key={u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 mr-2 mb-1 block">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-10 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm bg-slate-50"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span>كلمة المرور الخاصة بـ {selectedUser} مطلوبة.</span>
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all active:scale-95"
            >
              تسجيل الدخول
              <ArrowRight className="mr-2 h-5 w-5" />
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            <p className="text-center text-slate-600 text-sm leading-relaxed">
              بصفتك ضيفاً، يمكنك استعراض جميع مخالفات السلامة في المصنع والمشاركة بكتابة التعليقات والاقتراحات. لن تتاح لك ميزات التقارير أو تعديل البيانات.
            </p>
            <button
              onClick={() => onLogin('guest', 'زائر المصنع')}
              className="group relative w-full flex justify-center py-3 px-4 border border-slate-200 text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all active:scale-95"
            >
              دخول كضيف
              <ArrowRight className="mr-2 h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;