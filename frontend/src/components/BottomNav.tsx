
import { NavLink } from 'react-router-dom';
import { Search, CalendarDays, User } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Search, label: 'Search' },
    { to: '/my-bookings', icon: CalendarDays, label: 'Bookings' },
    { to: '/auth/login', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-primary" : "text-outline hover:text-secondary"
            )}
          >
            <item.icon className={clsx("w-6 h-6", item.to === '/' && "w-6 h-6")} />
            <span className="text-[10px] font-medium font-sans">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
