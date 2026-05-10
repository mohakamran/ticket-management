import React, { useEffect, useState } from 'react';
import { useTitle } from '../lib/useTitle';
import { useAuth } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import { getAllUsers, updateUserRole } from '../services/ticketService';
import { User } from '../types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Search, UserPlus, Shield, User as UserIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManageEmployees() {
  useTitle('Manage Employees');
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data as User[]);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'EMPLOYEE') => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Team Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white rounded-2xl border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <UserIcon className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Members</p>
                  <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
                </div>
              </Card>
              <Card className="p-6 bg-white rounded-2xl border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Shield className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admins</p>
                  <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'ADMIN').length}</h3>
                </div>
              </Card>
              <Card className="p-6 bg-white rounded-2xl border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Users className="text-slate-600" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employees</p>
                  <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'EMPLOYEE').length}</h3>
                </div>
              </Card>
            </div>

            <Card className="bg-white rounded-2xl border-slate-200 border shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">All Users</h2>
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
                      <TableHead className="px-6 py-4">User</TableHead>
                      <TableHead className="px-6 py-4">Current Role</TableHead>
                      <TableHead className="px-6 py-4 text-right">Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {paginatedUsers.map(u => (
                      <TableRow key={u.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-indigo-50 leading-none">
                              {u.photoURL ? (
                                <AvatarImage src={u.photoURL} />
                              ) : (
                                <AvatarFallback className="bg-slate-100 text-indigo-600 font-bold uppercase">
                                  {u.name[0]}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {u.name} {u.id === currentUser?.id && "(You)"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">{u.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge className={cn(
                            "rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                            u.role === 'ADMIN' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 border border-slate-200"
                          )}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex justify-end">
                            <Select 
                              disabled={u.id === currentUser?.id}
                              value={u.role} 
                              onValueChange={(val) => handleRoleChange(u.id, val as 'ADMIN' | 'EMPLOYEE')}
                            >
                              <SelectTrigger className="w-[140px] rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest bg-slate-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="ADMIN" className="text-[10px] font-bold uppercase tracking-widest">Admin</SelectItem>
                                <SelectItem value="EMPLOYEE" className="text-[10px] font-bold uppercase tracking-widest">Employee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-48 text-center text-slate-400 uppercase tracking-widest font-bold text-xs">
                          No employees found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination UI */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Showing {Math.min(startIndex + 1, totalItems)} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} members
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
