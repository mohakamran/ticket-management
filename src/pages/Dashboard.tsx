import { useEffect, useState } from 'react';
import { useTitle } from '../lib/useTitle';
import { useAuth } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import { subscribeTickets } from '../services/ticketService';
import { Ticket } from '../types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CreateTicketDialog from '../components/CreateTicketDialog';
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
  Pie
} from 'recharts';
import { Plus, Send } from 'lucide-react';

export default function Dashboard() {
  useTitle('Dashboard');
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const unsub = subscribeTickets((data) => {
      setTickets(data);
    }, user?.id, user?.role);
    return () => unsub();
  }, [user]);

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'PENDING').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tickets.filter(t => t.status === 'COMPLETED').length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const chartData = [
    { name: 'Pending', count: stats.pending, color: '#fbbf24' },
    { name: 'In Progress', count: stats.inProgress, color: '#6366f1' },
    { name: 'Completed', count: stats.completed, color: '#10b981' },
  ];

  const cards = [
    { title: 'Total Tickets', value: stats.total, icon: TicketIcon, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '+12% this week', changeColor: 'text-emerald-600' },
    { title: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: 'High Priority', changeColor: 'text-amber-600' },
    { title: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', change: 'Current active', changeColor: 'text-slate-400' },
    { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '94% satisfaction', changeColor: 'text-emerald-600' },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Overview Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64"
              />
              <BarChart3 className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white p-5 rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all border">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                    <div className={cn("flex items-center mt-2 text-[10px] font-bold uppercase", card.changeColor)}>
                      {card.change}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-slate-200 border rounded-2xl shadow-sm bg-white overflow-hidden p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Ticket Analytics</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Real-time status distribution</p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-600 border-indigo-100 bg-indigo-50">Live Sync</Badge>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-slate-200 border rounded-2xl shadow-sm bg-white overflow-hidden p-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Quick Actions</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Perform common tasks instantly</p>
                  </div>
                  <CreateTicketDialog trigger={
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg shadow-indigo-200">
                      <Plus size={16} className="mr-2" />
                      {user?.role === 'ADMIN' ? 'Create Ticket' : 'Submit Request'}
                    </Button>
                  } />
                </Card>

                <Card className="border-slate-200 border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h2 className="font-bold text-slate-800">Recent Activity</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-[10px] border border-slate-200 rounded-lg bg-slate-50 font-bold uppercase hover:bg-slate-100 transition-colors">
                      Filter
                    </button>
                    <button className="px-3 py-1 text-[10px] border border-slate-200 rounded-lg bg-slate-50 font-bold uppercase hover:bg-slate-100 transition-colors">
                      Export
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky top-0">
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-3">Ticket Title</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tickets.slice(0, 8).map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{ticket.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">ID: #{ticket.id.slice(0, 8)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center text-[10px] font-bold uppercase text-slate-600">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full mr-2",
                                ticket.status === 'COMPLETED' ? "bg-emerald-500" :
                                ticket.status === 'IN_PROGRESS' ? "bg-indigo-500" : "bg-amber-400"
                              )}></span>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                                "px-2 py-1 text-[9px] font-bold rounded-md uppercase tracking-tighter",
                                ticket.priority === 'HIGH' ? "bg-red-100 text-red-700" :
                                ticket.priority === 'MEDIUM' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                              )}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[10px] text-slate-400 font-bold">
                            {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tickets.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                      <p className="text-sm uppercase tracking-widest font-bold">No active tickets</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

              <div className="space-y-8">
                <Card className="border-none rounded-2xl shadow-lg bg-slate-900 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="p-6 relative z-10">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Performance Score</p>
                    <div className="flex items-end justify-between mb-2">
                      <h4 className="text-4xl font-bold">{completionRate}%</h4>
                      <TrendingUp className="text-indigo-400 mb-1" size={24} />
                    </div>
                    <Progress value={completionRate} className="h-1.5 bg-slate-800" />
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium uppercase tracking-tight">
                      Completed {stats.completed} of {stats.total} assignments.
                      <br />Keep up the momentum!
                    </p>
                  </div>
                </Card>

                <Card className="border-slate-200 border rounded-2xl shadow-sm bg-white overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Volume by Status</h2>
                  </div>
                  <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[250px]">
                    <div className="w-full h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="count"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            labelClassName="font-bold text-slate-800"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 w-full space-y-2">
                       {chartData.map((item) => (
                         <div key={item.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.name}</span>
                           </div>
                           <span className="text-xs font-bold text-slate-900">{item.count}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small helper for conditional classes has been replaced by '@/lib/utils'
