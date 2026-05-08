import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Table from '../../components/Table';
import OrderDetail from './OrderDetail';
import OrderForm from './OrderForm';

const blankForm = { customerId: '', notes: '', items: [{ product: '', quantity: 1, unitPrice: 0 }] };

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ status: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(filters.page), limit: '10' });
    if (filters.status) params.set('status', filters.status);
    return params.toString();
  }, [filters]);

  const loadOrders = () => {
    api.get(`/orders?${query}`)
      .then((response) => {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      })
      .catch((apiError) => setError(apiError.response?.data?.message || 'Unable to load orders'));
  };

  useEffect(loadOrders, [query]);
  useEffect(() => {
    api.get('/customers?limit=100').then((response) => setCustomers(response.data.data));
  }, []);

  const loadDetail = (id) => {
    api.get(`/orders/${id}`).then((response) => setSelected(response.data.data));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        customerId: Number(form.customerId),
        notes: form.notes || null,
        items: form.items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      };
      await api.post('/orders', payload);
      setForm(blankForm);
      setIsFormOpen(false);
      loadOrders();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to save order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    loadOrders();
    loadDetail(id);
  };

  const columns = [
    { key: 'id', label: 'Order', render: (row) => `#${row.id}` },
    { key: 'customerName', label: 'Customer', render: (row) => row.customerName || `Customer #${row.customerId}` },
    { key: 'totalAmount', label: 'Total', render: (row) => `$${Number(row.totalAmount).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', label: '', render: (row) => <button onClick={() => loadDetail(row.id)} className="text-sm font-medium text-brand">View</button> }
  ];

  return (
    <main className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-ink">Orders</h1>
        <button onClick={() => setIsFormOpen(true)} className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-blue-700">New order</button>
      </div>
      {error ? <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mb-4 max-w-xs">
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {isFormOpen ? <div className="mb-4"><OrderForm customers={customers} form={form} onChange={setForm} onSubmit={submitForm} onCancel={() => setIsFormOpen(false)} isSubmitting={isSubmitting} /></div> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div>
          <Table columns={columns} rows={orders} />
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>{pagination.total} orders</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50">Prev</button>
              <button disabled={filters.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
        <OrderDetail order={selected} onStatusChange={updateStatus} />
      </div>
    </main>
  );
};

export default OrderList;
