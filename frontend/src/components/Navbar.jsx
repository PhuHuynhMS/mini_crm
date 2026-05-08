import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div>
        <p className="text-sm font-medium text-ink">{user?.name}</p>
        <p className="text-xs capitalize text-slate-500">{user?.role}</p>
      </div>
      <button
        type="button"
        onClick={logout}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-ink"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
};

export default Navbar;
