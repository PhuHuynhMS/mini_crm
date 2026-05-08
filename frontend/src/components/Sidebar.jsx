import { LayoutDashboard, ShoppingCart, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart }
];

const Sidebar = () => (
  <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
    <div className="px-3 text-lg font-semibold text-ink">Mini CRM</div>
    <nav className="mt-8 space-y-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-blue-50 text-brand'
                : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
            ].join(' ')
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
