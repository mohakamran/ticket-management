import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ...(user?.role === 'ADMIN' 
      ? [{ label: 'Tickets', path: '/admin/tickets', icon: Ticket }]
      : [{ label: 'My Tickets', path: '/employee/tickets', icon: Ticket }]
    ),
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-xl ring-4 ring-indigo-500/20">
            T
          </div>
          <span className="text-white font-bold text-lg tracking-tight">OmniTicket</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto mt-4 px-4 space-y-8">
        <div>
          <p className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest ">
            Main Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group",
                    isActive 
                      ? "bg-indigo-600/10 text-indigo-400 font-medium" 
                      : "hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400")} />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {user?.role === 'ADMIN' && (
          <div>
            <p className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest ">
              Management
            </p>
            <nav className="space-y-1">
              <Link
                to="/admin/employees"
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group",
                  location.pathname === '/admin/employees' 
                    ? "bg-indigo-600/10 text-indigo-400 font-medium" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Users size={18} className={cn(location.pathname === '/admin/employees' ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400")} />
                <span>Team Members</span>
              </Link>
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-3 py-2 bg-slate-800/50 rounded-xl mb-4">
          <Avatar className="h-8 w-8 ring-2 ring-indigo-500/20">
            <AvatarFallback className="bg-slate-700 text-indigo-400 font-bold text-xs">
              {user?.name?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate lowercase uppercase">{user?.role}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={signOut}
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10 h-10 px-3"
        >
          <LogOut size={16} className="mr-3" />
          <span className="text-sm">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
