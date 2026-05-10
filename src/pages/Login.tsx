import React, { useState } from 'react';
import { useTitle } from '../lib/useTitle';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout, Mail, Lock, User, ArrowRight, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Login() {
  useTitle('Login');
  const { user, login, signup, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Logged in successfully');
      } else {
        if (!name.trim()) throw new Error('Name is required');
        await signup(email, password, name);
        toast.success('Account created successfully');
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password auth is not enabled in Firebase Console');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        toast.error('Invalid credentials. If this is the first time, please Register the account.');
      } else {
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const setAdminCredentials = () => {
    setEmail('admin@omniticket.com');
    setPassword('admin123');
    setIsLogin(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px]"
      >
        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-slate-200 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="text-center pb-8 pt-10 px-8">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
              <Layout size={32} />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              OmniTicket
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 font-medium uppercase text-[10px] tracking-widest">
              Advanced Support Operations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 pb-8">
            <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Full Name</Label>
                      <div className="relative">
                        <Input 
                          placeholder="John Doe" 
                          className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm font-medium"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          required={!isLogin}
                        />
                        <User className="absolute left-4 top-3.5 text-slate-400" size={16} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Email Address</Label>
                    <div className="relative">
                      <Input 
                        type="email"
                        placeholder="name@company.com" 
                        className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm font-medium"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</Label>
                      {isLogin && <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Forgot?</button>}
                    </div>
                    <div className="relative">
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm font-medium"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <Lock className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span className="flex items-center">
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="ml-2" size={16} />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100">
               <button 
                onClick={setAdminCredentials}
                className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
               >
                 <Info className="text-slate-400 group-hover:text-indigo-500 mr-3 shrink-0" size={18} />
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:text-indigo-600">Admin Login</p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                      Email: <span className="text-indigo-600/70 font-bold">admin@omniticket.com</span><br/>
                      Pass: <span className="text-indigo-600/70 font-bold">admin123</span>
                    </p>
                 </div>
                 <div className="ml-auto bg-white px-2 py-1 rounded text-[9px] font-bold text-indigo-600 shadow-sm border border-indigo-50">ADMIN</div>
               </button>
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50/50 p-6 flex flex-col items-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Secure Enterprise Protocol
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
