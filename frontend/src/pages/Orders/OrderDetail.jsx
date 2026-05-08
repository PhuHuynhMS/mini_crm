import StatusBadge from '../../components/StatusBadge';

const nextStatuses = {
  new: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

const OrderDetail = ({ order, onStatusChange }) => {
  if (!order) {
    return (
      <aside className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select an order to view details.
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Order #{order.id}</h2>
          <p className="text-sm text-slate-500">{order.customerName || `Customer #${order.customerId}`}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 text-2xl font-semibold text-ink">${Number(order.totalAmount).toFixed(2)}</div>
      <div className="mt-4 space-y-2">
        {order.items?.map((item) => (
          <div key={item.id} className="rounded border border-slate-100 px-3 py-2 text-sm">
            <div className="font-medium text-ink">{item.product}</div>
            <div className="text-slate-500">{item.quantity} x ${Number(item.unitPrice).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {(nextStatuses[order.status] || []).map((status) => (
          <button key={status} onClick={() => onStatusChange(order.id, status)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Mark {status}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default OrderDetail;
