import { ChevronDown, ChevronRight, Shield } from 'lucide-react'
import { useState } from 'react'
import type { Permission } from '../../../lib/services/permissions/permissions.types'

const CATEGORY_LABELS: Record<string, string> = {
  analytics: 'Analytics',
  categories: 'Categorias',
  customers: 'Clientes',
  offers: 'Ofertas',
  orders: 'Pedidos',
  products: 'Produtos',
  segments: 'Segmentos',
  settings: 'Configurações',
  upsell: 'Upsell',
  users: 'Usuários',
}

type PermissionsSectionProps = {
  title: string
  allPermissions: Record<string, Permission[]>
  categories: string[]
  selectedSlugs: string[]
  onChange: (slugs: string[]) => void
  defaultOpen?: boolean
  showSelectAll?: boolean
  status?: 'idle' | 'loading' | 'success' | 'error'
  statusMessage?: string | null
  onSave?: () => void
  saveLabel?: string
  saveDisabled?: boolean
}

export const PermissionsSection = ({
  title,
  allPermissions,
  categories,
  selectedSlugs,
  onChange,
  defaultOpen = false,
  showSelectAll = false,
  status,
  statusMessage,
  onSave,
  saveLabel = 'Salvar permissões',
  saveDisabled = false,
}: PermissionsSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  )

  const allSlugs = categories.flatMap(
    (cat) => allPermissions[cat]?.map((p) => p.slug) ?? [],
  )

  const allSelected = allSlugs.length > 0 && allSlugs.every((s) => selectedSlugs.includes(s))
  const noneSelected = allSlugs.every((s) => !selectedSlugs.includes(s))

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([])
    } else {
      onChange(allSlugs)
    }
  }

  const handleTogglePermission = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      onChange(selectedSlugs.filter((s) => s !== slug))
    } else {
      onChange([...selectedSlugs, slug])
    }
  }

  const handleToggleCategory = (category: string) => {
    const catSlugs = allPermissions[category]?.map((p) => p.slug) ?? []
    const allCatSelected = catSlugs.every((s) => selectedSlugs.includes(s))
    if (allCatSelected) {
      onChange(selectedSlugs.filter((s) => !catSlugs.includes(s)))
    } else {
      const merged = Array.from(new Set([...selectedSlugs, ...catSlugs]))
      onChange(merged)
    }
  }

  const toggleExpandCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Shield className="h-4 w-4 text-sky-500" />
          {title}
          {selectedSlugs.length > 0 && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-700">
              {selectedSlugs.length}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-sky-600">
          {isOpen ? 'Recolher' : 'Expandir'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {showSelectAll && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                  allSelected
                    ? 'border-sky-500 bg-sky-500'
                    : noneSelected
                      ? 'border-slate-300 bg-white'
                      : 'border-sky-400 bg-sky-200'
                }`}
              >
                {allSelected && (
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {!allSelected && !noneSelected && (
                  <span className="h-0.5 w-2.5 rounded bg-sky-600" />
                )}
              </button>
              <span className="text-sm font-medium text-slate-700">
                {allSelected ? 'Desmarcar tudo' : 'Marcar tudo'}
              </span>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => {
              const perms = allPermissions[category]
              if (!perms || perms.length === 0) return null

              const catSlugs = perms.map((p) => p.slug)
              const catSelectedCount = catSlugs.filter((s) =>
                selectedSlugs.includes(s),
              ).length
              const allCatSelected = catSelectedCount === catSlugs.length
              const someCatSelected =
                catSelectedCount > 0 && catSelectedCount < catSlugs.length
              const isCatExpanded = expandedCategories.has(category)

              return (
                <div
                  key={category}
                  className="rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(category)}
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                        allCatSelected
                          ? 'border-sky-500 bg-sky-500'
                          : someCatSelected
                            ? 'border-sky-400 bg-sky-200'
                            : 'border-slate-300 bg-white'
                      }`}
                    >
                      {allCatSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {someCatSelected && (
                        <span className="h-0.5 w-2.5 rounded bg-sky-600" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpandCategory(category)}
                      className="flex flex-1 items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-700">
                        {CATEGORY_LABELS[category] ?? category}
                      </span>
                      <div className="flex items-center gap-2">
                        {catSelectedCount > 0 && (
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                            {catSelectedCount}/{catSlugs.length}
                          </span>
                        )}
                        {isCatExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                  </div>

                  {isCatExpanded && (
                    <div className="border-t border-slate-100 px-4 pb-3 pt-2 space-y-2">
                      {perms.map((perm) => {
                        const isChecked = selectedSlugs.includes(perm.slug)
                        return (
                          <label
                            key={perm.slug}
                            className="flex cursor-pointer items-start gap-3"
                          >
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(perm.slug)}
                              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                                isChecked
                                  ? 'border-sky-500 bg-sky-500'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && (
                                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {perm.name}
                              </p>
                              {perm.description && (
                                <p className="text-xs text-slate-400">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {onSave && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onSave}
                disabled={saveDisabled || status === 'loading'}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Shield className="h-4 w-4" />
                {saveLabel}
              </button>

              {status === 'success' && (
                <span className="text-xs font-semibold text-emerald-600">
                  Permissões atualizadas!
                </span>
              )}

              {status === 'error' && (
                <span className="text-xs font-semibold text-rose-600">
                  {statusMessage ?? 'Erro ao atualizar permissões.'}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
