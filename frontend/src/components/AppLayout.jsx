import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div className="flex min-h-screen bg-surface text-ink">
    <Sidebar />
    <div className="min-w-0 flex-1">
      <Navbar />
      <Outlet />
    </div>
  </div>
);

export default AppLayout;
