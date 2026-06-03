import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileSidebar from './MobileSidebar';
import BottomNav from './BottomNav';
import XPNotification from '../common/XPNotification';

export default function AppLayout() {
  return (
    <div className="app-shell flex h-screen overflow-hidden">
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
          <div className="main-surface app-content">
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
