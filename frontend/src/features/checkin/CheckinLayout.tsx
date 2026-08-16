
import { Outlet, NavLink } from 'react-router-dom';
import { Home, QrCode, UserPlus, ListTodo } from 'lucide-react';
import clsx from 'clsx';

export default function CheckinLayout() {
  const nav = [
    { to: '/staff', icon: Home, label: 'Home', end: true },
    { to: '/staff/scanner', icon: QrCode, label: 'Scan' },
    { to: '/staff/manual-entry', icon: UserPlus, label: 'Manual' },
    { to: '/staff/no-shows', icon: ListTodo, label: 'No-Shows' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-safe">
      <main className="flex-1 overflow-y-auto mb-16">
        <Outlet />
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 bg-secondary text-white pb-safe">
        <div className="flex justify-around items-center h-16">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
