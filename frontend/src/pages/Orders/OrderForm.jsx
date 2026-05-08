import { Plus, Trash2 } from 'lucide-react';

const emptyItem = { product: '', quantity: 1, unitPrice: 0 };

const OrderForm = ({ customers, form, onChange, onSubmit, onCancel, isSubmitting }) => {
  const updateItem = (index, item) => {
    const items = [...form.items];
    items[index] = item;
    onChange({ ...form, items });
  };

  const total = form.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">New order</h2>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-ink">Close</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Customer</span>
          <select required value={form.customerId} onChange={(e) => onChange({ ...form, customerId: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand">
            <option value="">Select customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <input value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
        </label>
      </div>
      <div className="mt-4 space-y-3">
        {form.items.map((item, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[1fr_100px_120px_40px]">
            <input required placeholder="Product" value={item.product} onChange={(e) => updateItem(index, { ...item, product: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
            <input required min="1" type="number" value={item.quantity} onChange={(e) => updateItem(index, { ...item, quantity: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
            <input required min="0" step="0.01" type="number" value={item.unitPrice} onChange={(e) => updateItem(index, { ...item, unitPrice: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
            <button type="button" onClick={() => onChange({ ...form, items: form.items.filter((_, i) => i !== index) })} className="grid h-10 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label="Remove item">
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={() => onChange({ ...form, items: [...form.items, emptyItem] })} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700">
          <Plus size={16} /> Add item
        </button>
        <div className="text-sm font-semibold text-ink">Total ${total.toFixed(2)}</div>
      </div>
      <button type="submit" disabled={isSubmitting || form.items.length === 0} className="mt-4 h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {isSubmitting ? 'Saving' : 'Create order'}
      </button>
    </form>
  );
};

export default OrderForm;
