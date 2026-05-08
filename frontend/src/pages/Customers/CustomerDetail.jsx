import StatusBadge from '../../components/StatusBadge';

const CustomerDetail = ({ customer }) => {
  if (!customer) {
    return (
      <aside className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select a customer to view details.
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{customer.name}</h2>
          <p className="text-sm text-slate-500">{customer.email || 'No email'}</p>
        </div>
        <StatusBadge status={customer.status} />
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-500">Phone</dt>
          <dd className="text-slate-700">{customer.phone || '-'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Address</dt>
          <dd className="text-slate-700">{customer.address || '-'}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Notes</dt>
          <dd className="text-slate-700">{customer.notes || '-'}</dd>
        </div>
      </dl>
      <h3 className="mt-5 text-sm font-semibold text-ink">Recent orders</h3>
      <div className="mt-2 space-y-2">
        {customer.recentOrders?.length ? customer.recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 text-sm">
            <span>#{order.id}</span>
            <span className="font-medium">${Number(order.totalAmount).toFixed(2)}</span>
          </div>
        )) : <p className="text-sm text-slate-500">No recent orders.</p>}
      </div>
    </aside>
  );
};

export default CustomerDetail;
