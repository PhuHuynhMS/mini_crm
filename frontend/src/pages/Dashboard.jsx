import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const formatter = new Intl.NumberFormat('en-US');
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/summary')
      .then((response) => setSummary(response.data.data))
      .catch((apiError) => setError(apiError.response?.data?.message || 'Unable to load dashboard'));
  }, []);

  const metrics = [
    { label: 'Active customers', value: formatter.format(summary?.activeCustomers || 0) },
    { label: 'Orders today', value: formatter.format(summary?.todayOrders || 0) },
    { label: 'Revenue this month', value: currency.format(summary?.monthlyRevenue || 0) },
    { label: 'Tracked statuses', value: formatter.format(summary?.ordersByStatus?.length || 0) }
  ];

  return (
    <main className="p-5">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      </div>
      {error ? <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{metric.value}</p>
          </div>
        ))}
      </section>
      <section className="mt-5 rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-ink">Orders by status</h2>
        <div className="mt-4 space-y-3">
          {(summary?.ordersByStatus || []).map((item) => {
            const max = Math.max(...summary.ordersByStatus.map((row) => row.total), 1);
            return (
              <div key={item.status} className="grid grid-cols-[110px_1fr_48px] items-center gap-3">
                <StatusBadge status={item.status} />
                <div className="h-2 overflow-hidden rounded bg-slate-100">
                  <div className="h-full bg-brand" style={{ width: `${(item.total / max) * 100}%` }} />
                </div>
                <span className="text-right text-sm font-medium text-slate-600">{item.total}</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
