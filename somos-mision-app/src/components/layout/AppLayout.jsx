import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileSidebar from './MobileSidebar';
import BottomNav from './BottomNav';
import XPNotification from '../common/XPNotification';
import { useAppStore } from '../../store/useAppStore';

export default function AppLayout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      <MobileSidebar />

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 pb-24 lg:pb-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* XP notification floating */}
      <XPNotification />
    </div>
  );
}
