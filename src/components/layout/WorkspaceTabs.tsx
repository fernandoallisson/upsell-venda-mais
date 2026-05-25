type WorkspaceTab<T extends string> = {
  value: T
  label: string
  disabled?: boolean
}

type WorkspaceTabsProps<T extends string> = {
  value: T
  tabs: Array<WorkspaceTab<T>>
  onChange: (value: T) => void
}

const WorkspaceTabs = <T extends string,>({
  value,
  tabs,
  onChange,
}: WorkspaceTabsProps<T>) => (
  <nav className="workspace-tabs rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label="Vistas do modulo">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        disabled={tab.disabled}
        onClick={() => onChange(tab.value)}
        className={`rounded-lg px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          tab.value === value
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-500 hover:bg-slate-50'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
)

export default WorkspaceTabs
