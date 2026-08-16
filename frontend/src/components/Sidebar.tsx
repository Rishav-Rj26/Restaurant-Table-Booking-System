
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Grid, BarChart3, Users, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { logout } = useAuth();
  
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home', end: true },
    { to: '/dashboard/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/dashboard/tables', icon: Grid, label: 'Tables' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-secondary text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-white/10">
        <h1 className="font-serif text-2xl font-bold tracking-tight">TableGuard</h1>
        <div className="text-xs text-secondary-container mt-1 uppercase tracking-wider font-semibold">Owner Dashboard</div>
      </div>
      
      <nav className="flex-1 py-6 px-3 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
              isActive ? "bg-primary text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );
}
