const styles = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  processing: 'bg-amber-50 text-amber-700 ring-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200'
};

const StatusBadge = ({ status }) => (
  <span
    className={[
      'inline-flex items-center rounded px-2 py-1 text-xs font-medium capitalize ring-1 ring-inset',
      styles[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
    ].join(' ')}
  >
    {status}
  </span>
);

export default StatusBadge;
