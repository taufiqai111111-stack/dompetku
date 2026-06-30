import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  TrendingUp, 
  Box, 
  History, 
  HandCoins,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { useStore } from '../hooks/useStore';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dasbor', color: 'text-sky-600' },
    { to: '/rekening', icon: Wallet, label: 'Rekening', color: 'text-sky-600' },
    { to: '/transfer', icon: ArrowRightLeft, label: 'Transfer', color: 'text-cyan-600' },
    { to: '/investasi', icon: TrendingUp, label: 'Investasi', color: 'text-emerald-600' },
    { to: '/aset', icon: Box, label: 'Aset', color: 'text-teal-600' },
    { to: '/transaksi', icon: History, label: 'Transaksi', color: 'text-slate-600' },
    { to: '/piutang', icon: HandCoins, label: 'Piutang', color: 'text-blue-600' },
    { to: '/hutang', icon: HandCoins, label: 'Hutang', color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-sky-600 flex items-center gap-2">
            <Wallet className="w-8 h-8" />
            DompetKu
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )
              }
            >
              <item.icon className={cn("w-5 h-5", item.color)} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-20 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sky-600 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          DompetKu
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-800/50 z-10" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-[60px] left-0 right-0 bg-white border-b border-slate-200 p-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  <item.icon className={cn("w-5 h-5", item.color)} />
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
