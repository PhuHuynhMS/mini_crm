const CustomerForm = ({ form, onChange, onSubmit, onCancel, isSubmitting, title }) => (
  <form onSubmit={onSubmit} className="rounded-md border border-slate-200 bg-white p-4">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-ink">
        Close
      </button>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Name</span>
        <input required value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input type="email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Phone</span>
        <input value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Status</span>
        <select value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Address</span>
        <input value={form.address} onChange={(e) => onChange({ ...form, address: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 outline-none focus:border-brand" />
      </label>
      <label className="block md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand" />
      </label>
    </div>
    <button type="submit" disabled={isSubmitting} className="mt-4 h-10 rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
      {isSubmitting ? 'Saving' : 'Save customer'}
    </button>
  </form>
);

export default CustomerForm;
