import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import Table from '../../components/Table';
import CustomerDetail from './CustomerDetail';
import CustomerForm from './CustomerForm';

const blankForm = { name: '', email: '', phone: '', address: '', status: 'active', notes: '' };

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(filters.page), limit: '10' });
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    return params.toString();
  }, [filters]);

  const loadCustomers = () => {
    api.get(`/customers?${query}`)
      .then((response) => {
        setCustomers(response.data.data);
        setPagination(response.data.pagination);
      })
      .catch((apiError) => setError(apiError.response?.data?.message || 'Unable to load customers'));
  };

  useEffect(loadCustomers, [query]);

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm);
    setIsFormOpen(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      status: customer.status,
      notes: customer.notes || ''
    });
    setIsFormOpen(true);
  };

  const loadDetail = (id) => {
    api.get(`/customers/${id}`).then((response) => setSelected(response.data.data));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value || null]));
    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
      } else {
        await api.post('/customers', payload);
      }
      setIsFormOpen(false);
      loadCustomers();
      if (editingId) loadDetail(editingId);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '-' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => loadDetail(row.id)} className="text-sm font-medium text-brand">View</button>
          <button onClick={() => openEdit(row)} className="text-sm font-medium text-slate-600">Edit</button>
        </div>
      )
    }
  ];

  return (
    <main className="p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-ink">Customers</h1>
        <button onClick={openCreate} className="h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-blue-700">New customer</button>
      </div>
      {error ? <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_180px]">
        <input placeholder="Search name, email, phone" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-brand">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {isFormOpen ? <div className="mb-4"><CustomerForm form={form} onChange={setForm} onSubmit={submitForm} onCancel={() => setIsFormOpen(false)} isSubmitting={isSubmitting} title={editingId ? 'Edit customer' : 'New customer'} /></div> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div>
          <Table columns={columns} rows={customers} />
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <span>{pagination.total} customers</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50">Prev</button>
              <button disabled={filters.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
        <CustomerDetail customer={selected} />
      </div>
    </main>
  );
};

export default CustomerList;
