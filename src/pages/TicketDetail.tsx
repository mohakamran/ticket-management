import React, { useEffect, useState } from 'react';
import { useTitle } from '../lib/useTitle';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  subscribeComments, 
  addComment, 
  updateTicketStatus, 
  updateTicket,
  getAllEmployees
} from '../services/ticketService';
import { Ticket, Comment, TicketStatus, User } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Send, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  Settings as SettingsIcon,
  MessageSquare
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  useTitle(ticket ? `Ticket: ${ticket.title}` : 'Ticket Detail');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<User[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchTicket = async () => {
      try {
        const docRef = doc(db, 'tickets', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTicket({
            id: snapshot.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          } as Ticket);
        } else {
          toast.error('Ticket not found');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Error fetching ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
    getAllEmployees().then(data => setEmployees(data as User[]));

    const unsubComments = subscribeComments(id, (data) => setComments(data));
    return () => {
      unsubComments();
    };
  }, [id, navigate]);

  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!id) return;
    try {
      await updateTicketStatus(id, status);
      setTicket(prev => prev ? { ...prev, status } : null);
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateAssignee = async (assignedToId: string) => {
    if (!id) return;
    try {
      await updateTicket(id, { assignedToId });
      setTicket(prev => prev ? { ...prev, assignedToId } : null);
      toast.success('Assignee updated');
    } catch (error) {
      toast.error('Failed to update assignee');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    try {
      await addComment(id, {
        message: newComment,
        userId: user?.id || '',
        ticketId: id,
      });
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              {user?.role === 'ADMIN' && (
                <Select value={ticket.assignedToId} onValueChange={handleUpdateAssignee}>
                  <SelectTrigger className="w-44 h-10 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight shadow-sm">
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id} className="text-xs font-bold tracking-tight uppercase">{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={ticket.status} onValueChange={handleUpdateStatus}>
                <SelectTrigger className="w-44 h-10 bg-white border-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PENDING" className="text-xs font-bold tracking-tight uppercase">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS" className="text-xs font-bold tracking-tight uppercase">In Progress</SelectItem>
                  <SelectItem value="COMPLETED" className="text-xs font-bold tracking-tight uppercase">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-slate-200 rounded-2xl shadow-sm border overflow-hidden">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5",
                      ticket.priority === 'HIGH' ? "border-red-100 text-red-700 bg-red-50" :
                      ticket.priority === 'MEDIUM' ? "border-amber-100 text-amber-700 bg-amber-50" : "border-slate-200 text-slate-700 bg-slate-50"
                    )}>
                      {ticket.priority} Priority
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{ticket.id.slice(0, 8)}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                    {ticket.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                    {ticket.description}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-bold uppercase text-[10px] tracking-widest px-1">
                  <MessageSquare size={16} className="text-indigo-500" />
                  <h3>Discussion ({comments.length})</h3>
                </div>
                
                <Card className="border-slate-200 rounded-2xl shadow-sm border overflow-hidden flex flex-col bg-white">
                  <ScrollArea className="h-[450px] p-6">
                    <div className="space-y-8">
                      {comments.map((comment, idx) => {
                        const isMe = comment.userId === user?.id;
                        return (
                          <div key={comment.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                            <div className={cn(
                              "max-w-[85%] rounded-2xl p-4 text-sm font-medium leading-relaxed shadow-sm",
                              isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                            )}>
                              {comment.message}
                            </div>
                            <div className="flex items-center gap-2 mt-2 px-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                {comment.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {comments.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                          <p className="text-sm font-bold uppercase tracking-widest">No communication yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <form onSubmit={handleAddComment} className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <Input 
                      placeholder="Share an update..." 
                      className="bg-white border-slate-200 rounded-xl h-10 text-sm focus:ring-indigo-500"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />
                    <Button type="submit" disabled={!newComment.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-6 transition-all shadow-md shadow-indigo-200/50">
                      <Send size={18} />
                    </Button>
                  </form>
                </Card>
              </div>
            </div>

            <aside className="space-y-8">
              <Card className="border-slate-200 rounded-2xl shadow-sm border overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Assignment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Specialist</p>
                    <div className="flex items-center gap-3 pt-2">
                      <Avatar className="h-9 w-9 ring-2 ring-indigo-50">
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-bold uppercase">
                          {employees.find(e => e.id === ticket.assignedToId)?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-none mb-1">
                          {employees.find(e => e.id === ticket.assignedToId)?.name || 'Needs Assignment'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Support Level 1</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lifecycle State</p>
                    <Badge className={cn(
                      "mt-2 text-[10px] font-bold uppercase tracking-widest px-2 h-7 border-none shadow-sm",
                      ticket.status === 'COMPLETED' ? "bg-emerald-500 text-white" :
                      ticket.status === 'IN_PROGRESS' ? "bg-indigo-600 text-white" : "bg-amber-400 text-white"
                    )}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Temporal Records</p>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-slate-500 py-2 border-b border-slate-50">
                       <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-indigo-400" />
                          <span>Initiated</span>
                       </div>
                       <span className="text-slate-900">{ticket.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight text-slate-500">
                       <div className="flex items-center gap-2">
                          <Clock size={12} className="text-indigo-400" />
                          <span>Last Activity</span>
                       </div>
                       <span className="text-slate-900">{ticket.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user?.role === 'ADMIN' && (
                <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden rounded-2xl relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <CardHeader className="relative z-10 border-b border-white/5">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                       <SettingsIcon size={14} />
                       Management Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-6 relative z-10">
                    <Button variant="ghost" className="w-full justify-start text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 h-10 px-3">
                       Archive Ticket
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 h-10 px-3">
                       Transfer Ownership
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-400/5 h-10 px-3 mt-4">
                       Delete Permanently
                    </Button>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small helper for conditional classes has been replaced by '@/lib/utils'
