import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { createTicket, getAllEmployees } from '../services/ticketService';
import { TicketPriority, User } from '../types';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Send, Check, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateTicketDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export default function CreateTicketDialog({ onSuccess, trigger }: CreateTicketDialogProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [openAssignee, setOpenAssignee] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TicketPriority,
    assignedToId: '',
  });

  useEffect(() => {
    if (isOpen && user?.role === 'ADMIN') {
      getAllEmployees().then(data => setEmployees(data as User[]));
    }
  }, [isOpen, user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createTicket({
        ...newTicket,
        status: 'PENDING',
        createdById: user?.id || '',
      });
      toast.success('Ticket submitted successfully');
      setNewTicket({ title: '', description: '', priority: 'MEDIUM', assignedToId: '' });
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  const selectedAssignee = employees.find((emp) => emp.id === newTicket.assignedToId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        nativeButton={true}
        render={
          trigger ? (
            React.isValidElement(trigger) ? (
              trigger
            ) : (
              <div className="cursor-pointer font-bold">{trigger}</div>
            )
          ) : (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg px-4 transition-all shadow-sm">
              <Plus size={18} className="mr-2" />
              New Ticket
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {user?.role === 'ADMIN' ? 'Create New Ticket' : 'Submit Support Request'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</Label>
            <Input 
              id="title" 
              placeholder="What needs attention?" 
              className="rounded-xl bg-slate-100 border-none h-11 focus:ring-2 focus:ring-indigo-500 font-medium"
              value={newTicket.title}
              onChange={e => setNewTicket({...newTicket, title: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Details</Label>
            <textarea 
              id="description"
              className="w-full min-h-[100px] rounded-xl border-none bg-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              placeholder="Please describe the issue in detail..."
              value={newTicket.description}
              onChange={e => setNewTicket({...newTicket, description: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority Level</Label>
              <Select 
                value={newTicket.priority} 
                onValueChange={v => setNewTicket({...newTicket, priority: v as TicketPriority})}
              >
                <SelectTrigger className="rounded-xl bg-slate-100 border-none h-11 font-medium">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="LOW" className="font-medium">Low Priority</SelectItem>
                  <SelectItem value="MEDIUM" className="font-medium">Medium Priority</SelectItem>
                  <SelectItem value="HIGH" className="font-medium font-bold text-red-600">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Assign To</Label>
                <Popover open={openAssignee} onOpenChange={setOpenAssignee}>
                  <PopoverTrigger
                    nativeButton={true}
                    render={
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openAssignee}
                        className="w-full justify-between rounded-xl bg-slate-100 border-none h-11 font-medium hover:bg-slate-200"
                      />
                    }
                  >
                    {selectedAssignee ? (
                      <div className="flex items-center">
                        <UserIcon size={14} className="mr-2 text-indigo-600" />
                        <span className="truncate">{selectedAssignee.name}</span>
                      </div>
                    ) : (
                      "Select employee..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0 rounded-xl" align="start">
                    <Command className="rounded-xl">
                      <CommandInput placeholder="Search employee..." className="h-9 font-medium" />
                      <CommandList>
                        <CommandEmpty className="py-2 px-4 text-xs font-semibold text-slate-400">No employee found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="unassigned"
                            onSelect={() => {
                              setNewTicket({ ...newTicket, assignedToId: "" });
                              setOpenAssignee(false);
                            }}
                            className="text-xs font-bold uppercase tracking-tight"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                newTicket.assignedToId === "" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Unassigned
                          </CommandItem>
                          {employees.map((emp) => (
                            <CommandItem
                              key={emp.id}
                              value={emp.name}
                              onSelect={() => {
                                setNewTicket({ ...newTicket, assignedToId: emp.id });
                                setOpenAssignee(false);
                              }}
                              className="text-xs font-bold uppercase tracking-tight"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newTicket.assignedToId === emp.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {emp.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase text-[10px] tracking-widest h-10 px-6" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest px-8 h-10 shadow-lg shadow-indigo-200">
              {loading ? 'Submitting...' : 'Submit Request'}
              <Send size={14} className="ml-2" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
