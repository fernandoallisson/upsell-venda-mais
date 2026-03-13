const WidgetStatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
    }`}
  >
    {active ? 'Ativo' : 'Inativo'}
  </span>
)

export default WidgetStatusBadge
