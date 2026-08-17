import { NavLink } from 'react-router-dom';
import { Search, CalendarDays, User, Info } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';

export default function BottomNav() {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { to: '/', icon: Search, label: 'Search', end: true },
    { to: '/my-bookings', icon: CalendarDays, label: 'Bookings' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/auth/login', icon: User, label: isAuthenticated ? 'Profile' : 'Sign in' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-primary" : "text-outline hover:text-secondary"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium font-sans">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
