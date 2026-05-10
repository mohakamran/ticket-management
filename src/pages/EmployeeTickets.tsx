import { useEffect, useState } from 'react';
import { useTitle } from '../lib/useTitle';
import { useAuth } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import { subscribeTickets } from '../services/ticketService';
import { Ticket } from '../types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Search,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import CreateTicketDialog from '../components/CreateTicketDialog';
import { Plus } from 'lucide-react';

export default function EmployeeTickets() {
  useTitle('My Tickets');
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const unsub = subscribeTickets((data) => {
      setTickets(data);
    }, user?.id, 'EMPLOYEE');
    return () => unsub();
  }, [user]);

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredTickets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">My Assignments</h1>
          <div className="flex items-center space-x-4">
            <CreateTicketDialog trigger={
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-4 h-9">
                <Plus size={16} className="mr-2" />
                Submit Request
              </Button>
            } />
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-4">
            <Card className="bg-white rounded-2xl border-slate-200 border shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">My Ticket Queue</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Limit:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(parseInt(v))}>
                    <SelectTrigger className="w-[70px] h-7 text-[10px] font-bold rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="px-6 py-4">Ticket Details</TableHead>
                      <TableHead className="px-6 py-4">Status</TableHead>
                      <TableHead className="px-6 py-4">Priority</TableHead>
                      <TableHead className="px-6 py-4 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {paginatedTickets.map(ticket => (
                      <TableRow key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="flex items-center text-[10px] font-bold uppercase text-slate-600">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full mr-2",
                              ticket.status === 'COMPLETED' ? "bg-emerald-500" :
                              ticket.status === 'IN_PROGRESS' ? "bg-indigo-500" : "bg-amber-400"
                            )}></span>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5",
                            ticket.priority === 'HIGH' ? "border-red-100 text-red-600 bg-red-50" :
                            ticket.priority === 'MEDIUM' ? "border-amber-100 text-amber-600 bg-amber-50" : "border-slate-100 text-slate-600 bg-slate-50"
                          )}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button asChild variant="ghost" size="sm" className="h-8 px-3 rounded-lg text-indigo-600 font-bold uppercase text-[10px] tracking-widest group-hover:bg-indigo-50 transition-all">
                            <Link to={`/tickets/${ticket.id}`}>
                              Open <ArrowUpRight size={14} className="ml-1.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <p className="text-slate-400 uppercase tracking-widest font-bold text-xs">No tickets assigned to you</p>
                            <CreateTicketDialog trigger={
                              <Button variant="outline" size="sm" className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold uppercase text-[10px] tracking-widest px-6 whitespace-nowrap">
                                Submit New Request
                              </Button>
                            } />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination UI */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing {Math.min(startIndex + 1, totalItems)} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} assignments
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg disabled:opacity-30"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn(
                          "h-8 w-8 text-[10px] font-bold rounded-lg",
                          currentPage === i + 1 ? "bg-indigo-600 text-white" : "text-slate-600"
                        )}
                      >
                        {i + 1}
                      </Button>
                    )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg disabled:opacity-30"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Small helper for conditional classes has been replaced by '@/lib/utils'
