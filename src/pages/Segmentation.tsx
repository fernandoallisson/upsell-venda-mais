import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Pencil,
  PlusCircle,
  RefreshCcw,
  Tag,
  Trash2,
  UserCircle2,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import ExportSegmentModal from '../components/segments/ExportSegmentModal'
import { ApiError } from '../lib/api'
import {
  createSegment,
  getSegmentById,
  getSegments,
  updateSegment,
} from '../lib/services/segments/segments.service'
import type {
  CreateSegmentPayload,
  Segment,
  SegmentsResponse,
  UpdateSegmentPayload,
  SegmentRules,
} from '../lib/services/segments/segments.types'

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

const rulesCount = (rules: SegmentRules) =>
  Array.isArray(rules) ? rules.length : Object.keys(rules).length

type PaginationMeta = Pick<
  SegmentsResponse,
  | 'current_page'
  | 'last_page'
  | 'per_page'
  | 'total'
  | 'from'
  | 'to'
  | 'next_page_url'
  | 'prev_page_url'
>

const buildPageItems = (current: number, last: number) => {
  const delta = 2
  const pages: Array<number | '...'> = []

  const left = Math.max(1, current - delta)
  const right = Math.min(last, current + delta)

  pages.push(1)

  if (left > 2) pages.push('...')

  for (let p = left; p <= right; p += 1) {
    if (p !== 1 && p !== last) pages.push(p)
  }

  if (right < last - 1) pages.push('...')

  if (last !== 1) pages.push(last)

  const normalized: Array<number | '...'> = []
  for (const item of pages) {
    if (normalized.length === 0 || normalized[normalized.length - 1] !== item) {
      normalized.push(item)
    }
  }
  return normalized
}

const formatRuleLabel = (label: string) =>
  label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())

type RuleFieldValues = {
  days?: string
  operator?: string
  value?: string
  booleanValue?: 'yes' | 'no'
  product?: string
  category?: string
  text?: string
  startDate?: string
  endDate?: string
  preferenceKey?: string
  preferenceValue?: 'yes' | 'no'
}

type SegmentRuleDraft = {
  id: string
  category: string
  filter: string
  data: RuleFieldValues
}

type FilterDefinition = {
  value: string
  label: string
  description: string
  fields: Array<
    | 'days'
    | 'operatorValue'
    | 'boolean'
    | 'product'
    | 'category'
    | 'text'
    | 'dateRange'
    | 'preference'
  >
}

type RuleCategoryDefinition = {
  value: string
  label: string
  filters: FilterDefinition[]
}

const RULE_CATEGORIES: RuleCategoryDefinition[] = [
  {
    value: 'purchase_behavior',
    label: 'Comportamento de Compra',
    filters: [
      {
        value: 'last_purchase_within_days',
        label: 'Última compra dentro de X dias',
        description: 'Filtra clientes pela última compra recente.',
        fields: ['days'],
      },
      {
        value: 'inactive_days',
        label: 'Inativo há X dias',
        description: 'Identifica clientes sem compras recentes.',
        fields: ['days'],
      },
      {
        value: 'total_orders',
        label: 'Total de pedidos',
        description: 'Filtra pelo total de pedidos do cliente.',
        fields: ['operatorValue'],
      },
      {
        value: 'bought_upsell',
        label: 'Comprou produto upsell',
        description: 'Seleciona clientes que compraram um upsell.',
        fields: ['boolean'],
      },
    ],
  },
  {
    value: 'value_metrics',
    label: 'Valor e Ticket',
    filters: [
      {
        value: 'average_ticket',
        label: 'Ticket Médio',
        description: 'Filtra pelo ticket médio do cliente.',
        fields: ['operatorValue'],
      },
      {
        value: 'lifetime_value',
        label: 'Lifetime Value (LTV)',
        description: 'Filtra pelo valor total gerado pelo cliente.',
        fields: ['operatorValue'],
      },
    ],
  },
  {
    value: 'product_category',
    label: 'Produtos e Categorias',
    filters: [
      {
        value: 'bought_product',
        label: 'Comprou produto específico',
        description: 'Seleciona clientes que compraram um produto.',
        fields: ['product'],
      },
      {
        value: 'bought_category',
        label: 'Comprou de categoria',
        description: 'Seleciona clientes que compraram em uma categoria.',
        fields: ['category'],
      },
    ],
  },
  {
    value: 'utm_tracking',
    label: 'Origem (UTM)',
    filters: [
      {
        value: 'utm_source',
        label: 'UTM Source',
        description: 'Filtra pelo UTM Source utilizado.',
        fields: ['text'],
      },
      {
        value: 'utm_medium',
        label: 'UTM Medium',
        description: 'Filtra pelo UTM Medium utilizado.',
        fields: ['text'],
      },
      {
        value: 'utm_campaign',
        label: 'UTM Campaign',
        description: 'Filtra pelo UTM Campaign utilizado.',
        fields: ['text'],
      },
    ],
  },
  {
    value: 'date_range',
    label: 'Período de Cadastro/Pedido',
    filters: [
      {
        value: 'registered_between',
        label: 'Cadastrado entre datas',
        description: 'Filtra clientes cadastrados dentro do período.',
        fields: ['dateRange'],
      },
      {
        value: 'ordered_between',
        label: 'Fez pedido entre datas',
        description: 'Filtra clientes com pedidos no período.',
        fields: ['dateRange'],
      },
    ],
  },
  {
    value: 'customer_data',
    label: 'Dados do Cliente',
    filters: [
      {
        value: 'has_email',
        label: 'Possui email',
        description: 'Seleciona clientes com e-mail cadastrado.',
        fields: ['boolean'],
      },
      {
        value: 'has_phone',
        label: 'Possui telefone',
        description: 'Seleciona clientes com telefone cadastrado.',
        fields: ['boolean'],
      },
    ],
  },
  {
    value: 'preferences',
    label: 'Preferências',
    filters: [
      {
        value: 'preference_key',
        label: 'Preferência específica',
        description: 'Filtra clientes por preferência declarada.',
        fields: ['preference'],
      },
    ],
  },
]

const OPERATOR_OPTIONS = ['>', '<', '>=', '<=', '=', '!='] as const

const createRuleId = () => crypto.randomUUID()

const createEmptyRule = (): SegmentRuleDraft => ({
  id: createRuleId(),
  category: '',
  filter: '',
  data: {},
})

const getCategoryFilters = (categoryValue: string) =>
  RULE_CATEGORIES.find((category) => category.value === categoryValue)?.filters ??
  []

const getFilterDefinition = (categoryValue: string, filterValue: string) =>
  getCategoryFilters(categoryValue).find(
    (filter) => filter.value === filterValue,
  )

const findCategoryByFilter = (filterValue: string) => {
  for (const category of RULE_CATEGORIES) {
    if (category.filters.some((filter) => filter.value === filterValue)) {
      return category
    }
  }
  return null
}

const isRuleComplete = (rule: SegmentRuleDraft) => {
  if (!rule.category || !rule.filter) return false
  const filterDefinition = getFilterDefinition(rule.category, rule.filter)
  if (!filterDefinition) return false

  return filterDefinition.fields.every((field) => {
    switch (field) {
      case 'days':
        return Boolean(rule.data.days?.trim())
      case 'operatorValue':
        return Boolean(rule.data.operator && rule.data.value?.trim())
      case 'boolean':
        return Boolean(rule.data.booleanValue)
      case 'product':
        return Boolean(rule.data.product?.trim())
      case 'category':
        return Boolean(rule.data.category?.trim())
      case 'text':
        return Boolean(rule.data.text?.trim())
      case 'dateRange':
        return Boolean(rule.data.startDate && rule.data.endDate)
      case 'preference':
        return Boolean(rule.data.preferenceKey?.trim() && rule.data.preferenceValue)
      default:
        return false
    }
  })
}

const buildRulePayload = (rule: SegmentRuleDraft) => {
  const payload: Record<string, unknown> = {
    category: rule.category,
    filter: rule.filter,
  }

  switch (rule.filter) {
    case 'last_purchase_within_days':
    case 'inactive_days':
      payload.days = Number(rule.data.days)
      break
    case 'total_orders':
    case 'average_ticket':
    case 'lifetime_value':
      payload.operator = rule.data.operator
      payload.value = Number(rule.data.value)
      break
    case 'bought_upsell':
    case 'has_email':
    case 'has_phone':
      payload.value = rule.data.booleanValue === 'yes'
      break
    case 'bought_product':
      payload.product = rule.data.product
      break
    case 'bought_category':
      payload.category = rule.data.category
      break
    case 'utm_source':
    case 'utm_medium':
    case 'utm_campaign':
      payload.value = rule.data.text
      break
    case 'registered_between':
    case 'ordered_between':
      payload.start_date = rule.data.startDate
      payload.end_date = rule.data.endDate
      break
    case 'preference_key':
      payload.key = rule.data.preferenceKey
      payload.value = rule.data.preferenceValue === 'yes'
      break
    default:
      break
  }

  return payload
}

const normalizeRulesToDrafts = (rules: SegmentRules): SegmentRuleDraft[] => {
  if (Array.isArray(rules)) {
    return rules.map((rule) => {
      const rawRule = rule as Record<string, unknown>
      const filter = String(rawRule.filter ?? '')
      const category =
        typeof rawRule.category === 'string'
          ? rawRule.category
          : findCategoryByFilter(filter)?.value ?? ''
      const filterDefinition = getFilterDefinition(category, filter)
      const data: RuleFieldValues = {}
      const rawValue =
        rawRule.value !== undefined && rawRule.value !== null
          ? String(rawRule.value)
          : ''
      const categoryValue =
        rawRule.category_value ??
        rawRule.category_name ??
        (typeof rawRule.category === 'string' && rawRule.category !== category
          ? rawRule.category
          : undefined)

      if (filterDefinition?.fields.includes('days')) {
        data.days = rawRule.days ? String(rawRule.days) : ''
      }
      if (filterDefinition?.fields.includes('operatorValue')) {
        data.operator = rawRule.operator ? String(rawRule.operator) : ''
        data.value = rawValue
      }
      if (filterDefinition?.fields.includes('boolean')) {
        data.booleanValue =
          rawRule.value === true ? 'yes' : rawRule.value === false ? 'no' : undefined
      }
      if (filterDefinition?.fields.includes('product')) {
        data.product = rawRule.product ? String(rawRule.product) : rawValue
      }
      if (filterDefinition?.fields.includes('category')) {
        data.category = categoryValue ? String(categoryValue) : rawValue
      }
      if (filterDefinition?.fields.includes('text')) {
        data.text = rawValue
      }
      if (filterDefinition?.fields.includes('dateRange')) {
        data.startDate = rawRule.start_date ? String(rawRule.start_date) : ''
        data.endDate = rawRule.end_date ? String(rawRule.end_date) : ''
      }
      if (filterDefinition?.fields.includes('preference')) {
        data.preferenceKey = rawRule.key ? String(rawRule.key) : ''
        data.preferenceValue =
          rawRule.value === true ? 'yes' : rawRule.value === false ? 'no' : undefined
      }

      return {
        id: createRuleId(),
        category,
        filter,
        data,
      }
    })
  }

  return Object.entries(rules).map(([ruleKey, ruleValue]) => {
    const filter = ruleKey
    const category = findCategoryByFilter(filter)?.value ?? ''
    const filterDefinition = getFilterDefinition(category, filter)
    const data: RuleFieldValues = {}
    const rawRule = ruleValue as Record<string, unknown>

    if (filterDefinition?.fields.includes('operatorValue')) {
      data.operator = rawRule.operator ? String(rawRule.operator) : ''
      data.value =
        rawRule.value !== undefined && rawRule.value !== null
          ? String(rawRule.value)
          : ''
    }

    return {
      id: createRuleId(),
      category,
      filter,
      data,
    }
  })
}

const formatRuleValue = (rule: SegmentRuleDraft) => {
  const filterDefinition = getFilterDefinition(rule.category, rule.filter)
  if (!filterDefinition) return 'Regra cadastrada'

  const parts: string[] = []

  if (filterDefinition.fields.includes('days')) {
    parts.push(`${rule.data.days ?? ''} dias`)
  }
  if (filterDefinition.fields.includes('operatorValue')) {
    if (rule.data.operator && rule.data.value) {
      parts.push(`${rule.data.operator} ${rule.data.value}`)
    }
  }
  if (filterDefinition.fields.includes('boolean')) {
    parts.push(rule.data.booleanValue === 'yes' ? 'Sim' : 'Não')
  }
  if (filterDefinition.fields.includes('product')) {
    parts.push(`Produto: ${rule.data.product ?? ''}`)
  }
  if (filterDefinition.fields.includes('category')) {
    parts.push(`Categoria: ${rule.data.category ?? ''}`)
  }
  if (filterDefinition.fields.includes('text')) {
    parts.push(rule.data.text ?? '')
  }
  if (filterDefinition.fields.includes('dateRange')) {
    parts.push(`${rule.data.startDate ?? ''} → ${rule.data.endDate ?? ''}`)
  }
  if (filterDefinition.fields.includes('preference')) {
    parts.push(
      `${rule.data.preferenceKey ?? ''}: ${
        rule.data.preferenceValue === 'yes' ? 'Sim' : 'Não'
      }`,
    )
  }

  return parts.filter(Boolean).join(' · ')
}

type RuleBuilderProps = {
  rules: SegmentRuleDraft[]
  onAddRule: () => void
  onRemoveRule: (id: string) => void
  onUpdateRule: (id: string, updates: Partial<SegmentRuleDraft>) => void
  onUpdateRuleData: (id: string, data: Partial<RuleFieldValues>) => void
  previewCount?: number | null
  onCalculatePreview?: () => void
  showPreview?: boolean
}

const RuleBuilder = ({
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
  onUpdateRuleData,
  previewCount,
  onCalculatePreview,
  showPreview = false,
}: RuleBuilderProps) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          Regras de Segmentação
        </p>
        <p className="text-xs text-slate-500">
          Todas as regras são combinadas com E (AND).
        </p>
      </div>
      <button
        type="button"
        onClick={onAddRule}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
      >
        <PlusCircle className="h-4 w-4 text-indigo-500" />
        Adicionar Regra
      </button>
    </div>

    <div className="mt-4 space-y-4">
      {rules.map((rule, index) => {
        const categoryFilters = getCategoryFilters(rule.category)
        const filterDefinition = getFilterDefinition(rule.category, rule.filter)

        return (
          <div
            key={rule.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">
                Regra {index + 1}
              </p>
              <button
                type="button"
                onClick={() => onRemoveRule(rule.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-xs font-semibold text-slate-600">
                <span>Categoria</span>
                <select
                  value={rule.category}
                  onChange={(event) =>
                    onUpdateRule(rule.id, {
                      category: event.target.value,
                      filter: '',
                      data: {},
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                >
                  <option value="">Selecione uma categoria</option>
                  {RULE_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-xs font-semibold text-slate-600">
                <span>Filtro</span>
                <select
                  value={rule.filter}
                  onChange={(event) =>
                    onUpdateRule(rule.id, {
                      filter: event.target.value,
                      data: {},
                    })
                  }
                  disabled={!rule.category}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">Selecione um filtro</option>
                  {categoryFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filterDefinition ? (
              <p className="mt-2 text-xs text-slate-500">
                {filterDefinition.description}
              </p>
            ) : null}

            {filterDefinition ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {filterDefinition.fields.includes('days') ? (
                  <label className="space-y-2 text-xs font-semibold text-slate-600">
                    <span>Dias</span>
                    <input
                      type="number"
                      min={0}
                      value={rule.data.days ?? ''}
                      onChange={(event) =>
                        onUpdateRuleData(rule.id, { days: event.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    />
                  </label>
                ) : null}

                {filterDefinition.fields.includes('operatorValue') ? (
                  <>
                    <label className="space-y-2 text-xs font-semibold text-slate-600">
                      <span>Operador</span>
                      <select
                        value={rule.data.operator ?? ''}
                        onChange={(event) =>
                          onUpdateRuleData(rule.id, {
                            operator: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      >
                        <option value="">Selecione</option>
                        {OPERATOR_OPTIONS.map((operator) => (
                          <option key={operator} value={operator}>
                            {operator}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-xs font-semibold text-slate-600">
                      <span>Valor</span>
                      <input
                        type="number"
                        min={0}
                        value={rule.data.value ?? ''}
                        onChange={(event) =>
                          onUpdateRuleData(rule.id, {
                            value: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>
                  </>
                ) : null}

                {filterDefinition.fields.includes('boolean') ? (
                  <label className="space-y-2 text-xs font-semibold text-slate-600">
                    <span>Valor</span>
                    <select
                      value={rule.data.booleanValue ?? ''}
                      onChange={(event) =>
                        onUpdateRuleData(rule.id, {
                          booleanValue: event.target.value as 'yes' | 'no',
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    >
                      <option value="">Selecione</option>
                      <option value="yes">Sim</option>
                      <option value="no">Não</option>
                    </select>
                  </label>
                ) : null}

                {filterDefinition.fields.includes('product') ? (
                  <label className="space-y-2 text-xs font-semibold text-slate-600 md:col-span-2">
                    <span>Produto</span>
                    <input
                      type="text"
                      value={rule.data.product ?? ''}
                      onChange={(event) =>
                        onUpdateRuleData(rule.id, {
                          product: event.target.value,
                        })
                      }
                      placeholder="Digite o nome do produto"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    />
                  </label>
                ) : null}

                {filterDefinition.fields.includes('category') ? (
                  <label className="space-y-2 text-xs font-semibold text-slate-600 md:col-span-2">
                    <span>Categoria</span>
                    <input
                      type="text"
                      value={rule.data.category ?? ''}
                      onChange={(event) =>
                        onUpdateRuleData(rule.id, {
                          category: event.target.value,
                        })
                      }
                      placeholder="Digite a categoria"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    />
                  </label>
                ) : null}

                {filterDefinition.fields.includes('text') ? (
                  <label className="space-y-2 text-xs font-semibold text-slate-600 md:col-span-2">
                    <span>Valor</span>
                    <input
                      type="text"
                      value={rule.data.text ?? ''}
                      onChange={(event) =>
                        onUpdateRuleData(rule.id, {
                          text: event.target.value,
                        })
                      }
                      placeholder="Digite o valor"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    />
                  </label>
                ) : null}

                {filterDefinition.fields.includes('dateRange') ? (
                  <>
                    <label className="space-y-2 text-xs font-semibold text-slate-600">
                      <span>Data inicial</span>
                      <input
                        type="date"
                        value={rule.data.startDate ?? ''}
                        onChange={(event) =>
                          onUpdateRuleData(rule.id, {
                            startDate: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>
                    <label className="space-y-2 text-xs font-semibold text-slate-600">
                      <span>Data final</span>
                      <input
                        type="date"
                        value={rule.data.endDate ?? ''}
                        onChange={(event) =>
                          onUpdateRuleData(rule.id, {
                            endDate: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>
                  </>
                ) : null}

                {filterDefinition.fields.includes('preference') ? (
                  <>
                    <label className="space-y-2 text-xs font-semibold text-slate-600">
                      <span>Chave</span>
                      <input
                        type="text"
                        value={rule.data.preferenceKey ?? ''}
                        onChange={(event) =>
                          onUpdateRuleData(rule.id, {
                            preferenceKey: event.target.value,
                          })
                        }
                        placeholder="ex: newsletter"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>
                    <label className="space-y-2 text-xs font-semibold text-slate-600">
                      <span>Valor</span>
                      <select
                        value={rule.data.preferenceValue ?? ''}
                        onChange={(event) =>
                          onUpdateRuleData(rule.id, {
                            preferenceValue: event.target.value as 'yes' | 'no',
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      >
                        <option value="">Selecione</option>
                        <option value="yes">Sim</option>
                        <option value="no">Não</option>
                      </select>
                    </label>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>

    {showPreview ? (
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Preview de clientes correspondentes
            </p>
            <p className="text-xs text-slate-500">
              {previewCount === null
                ? 'Clique em calcular para ver a estimativa.'
                : `${previewCount} clientes encontrados.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCalculatePreview}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Calcular Preview
          </button>
        </div>
      </div>
    ) : null}
  </div>
)

const Segmentation = () => {
  const [segments, setSegments] = useState<Segment[]>([])
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [segmentForm, setSegmentForm] = useState({
    name: '',
  })
  const [createRules, setCreateRules] = useState<SegmentRuleDraft[]>([
    createEmptyRule(),
  ])
  const [previewCount, setPreviewCount] = useState<number | null>(null)
  const [createRulesError, setCreateRulesError] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
  })
  const [editRules, setEditRules] = useState<SegmentRuleDraft[]>([])
  const [editPreviewCount, setEditPreviewCount] = useState<number | null>(null)
  const [updateRulesError, setUpdateRulesError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const fetchSegmentDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getSegmentById(id)
      setSelectedSegment(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do segmento.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchSegments = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getSegments(targetPage)

        setSegments(response.data)
        setPagination({
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url,
        })
        setPage(response.current_page)

        const firstSegment = response.data[0] ?? null
        setSelectedSegment(firstSegment)

        if (firstSegment) {
          fetchSegmentDetails(firstSegment.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar segmentos.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchSegmentDetails, page],
  )

  useEffect(() => {
    fetchSegments(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedSegment) return
    setEditForm({
      name: selectedSegment.name,
    })
    setEditRules(normalizeRulesToDrafts(selectedSegment.rules))
    setEditPreviewCount(null)
    setIsEditOpen(false)
  }, [selectedSegment])

  useEffect(() => {
    if (isCreateOpen) return
    setCreateStatus('idle')
    setCreateError(null)
    setCreateRulesError(null)
    setSegmentForm({ name: '' })
    setCreateRules([createEmptyRule()])
    setPreviewCount(null)
  }, [isCreateOpen])

  useEffect(() => {
    if (isEditOpen) return
    setUpdateStatus('idle')
    setUpdateError(null)
    setUpdateRulesError(null)
    setEditPreviewCount(null)
  }, [isEditOpen])

  const totals = useMemo(() => {
    return segments.reduce(
      (acc, segment) => {
        acc.count += 1
        acc.rules += rulesCount(segment.rules)
        return acc
      },
      { count: 0, rules: 0 },
    )
  }, [segments])

  const handleSelectSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    fetchSegmentDetails(segment.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchSegments(nextPage)
  }

  const handleCreateSegment = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    if (!segmentForm.name.trim()) {
      setCreateRulesError('Informe o nome do segmento.')
      setCreateStatus('error')
      return
    }

    if (createRules.length === 0) {
      setCreateRulesError('Adicione ao menos uma regra de segmentação.')
      setCreateStatus('error')
      return
    }

    if (!createRules.every(isRuleComplete)) {
      setCreateRulesError('Preencha todos os campos das regras.')
      setCreateStatus('error')
      return
    }

    const payload: CreateSegmentPayload = {
      name: segmentForm.name,
      rules: createRules.map(buildRulePayload),
    }

    try {
      await createSegment(payload)
      setCreateStatus('success')
      setSegmentForm({ name: '' })
      setCreateRules([createEmptyRule()])
      setPreviewCount(null)
      setIsCreateOpen(false)
      fetchSegments(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar segmento.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateSegment = async () => {
    if (!selectedSegment) return

    setUpdateStatus('loading')
    setUpdateError(null)

    if (!editForm.name.trim()) {
      setUpdateRulesError('Informe o nome do segmento.')
      setUpdateStatus('error')
      return
    }

    if (editRules.length === 0) {
      setUpdateRulesError('Adicione ao menos uma regra de segmentação.')
      setUpdateStatus('error')
      return
    }

    if (!editRules.every(isRuleComplete)) {
      setUpdateRulesError('Preencha todos os campos das regras.')
      setUpdateStatus('error')
      return
    }

    const payload: UpdateSegmentPayload = {
      name: editForm.name,
      rules: editRules.map(buildRulePayload),
    }

    try {
      const updated = await updateSegment(selectedSegment.id, payload)
      setSelectedSegment(updated)
      setUpdateStatus('success')
      fetchSegments(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar segmento.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const isCreateValid =
    segmentForm.name.trim().length > 0 &&
    createRules.length > 0 &&
    createRules.every(isRuleComplete)

  const isUpdateValid =
    editForm.name.trim().length > 0 &&
    editRules.length > 0 &&
    editRules.every(isRuleComplete)

  const selectedRules = useMemo(() => {
    if (!selectedSegment) return []
    return normalizeRulesToDrafts(selectedSegment.rules)
  }, [selectedSegment])

  const handleAddRule = () => {
    setCreateRules((prev) => [...prev, createEmptyRule()])
    setCreateRulesError(null)
  }

  const handleRemoveRule = (id: string) => {
    setCreateRules((prev) => prev.filter((rule) => rule.id !== id))
    setCreateRulesError(null)
  }

  const handleUpdateRule = (
    id: string,
    updates: Partial<SegmentRuleDraft>,
  ) => {
    setCreateRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    )
    setCreateRulesError(null)
  }

  const handleUpdateRuleData = (
    id: string,
    data: Partial<RuleFieldValues>,
  ) => {
    setCreateRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, data: { ...rule.data, ...data } } : rule,
      ),
    )
    setCreateRulesError(null)
  }

  const handleAddEditRule = () => {
    setEditRules((prev) => [...prev, createEmptyRule()])
    setUpdateRulesError(null)
  }

  const handleRemoveEditRule = (id: string) => {
    setEditRules((prev) => prev.filter((rule) => rule.id !== id))
    setUpdateRulesError(null)
  }

  const handleUpdateEditRule = (
    id: string,
    updates: Partial<SegmentRuleDraft>,
  ) => {
    setEditRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    )
    setUpdateRulesError(null)
  }

  const handleUpdateEditRuleData = (
    id: string,
    data: Partial<RuleFieldValues>,
  ) => {
    setEditRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, data: { ...rule.data, ...data } } : rule,
      ),
    )
    setUpdateRulesError(null)
  }

  const handleCalculatePreview = () => {
    const validRulesCount = createRules.filter(isRuleComplete).length
    const estimate = Math.max(0, validRulesCount * 128)
    setPreviewCount(estimate)
  }

  const handleCalculateEditPreview = () => {
    const validRulesCount = editRules.filter(isRuleComplete).length
    const estimate = Math.max(0, validRulesCount * 128)
    setEditPreviewCount(estimate)
  }

  const handleCancelCreate = () => {
    setIsCreateOpen(false)
  }

  return (
    <DashboardPage
      title="Segmentação"
      subtitle="Clientes"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Segmentos</p>

          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">
              total{' '}
              {pagination
                ? `(pág. ${pagination.current_page} de ${pagination.last_page})`
                : ''}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Regras (página atual):{' '}
            <span className="font-semibold text-slate-700">{totals.rules}</span>
          </p>

          {pagination ? (
            <p className="mt-1 text-xs text-slate-400">
              Mostrando {pagination.from ?? 0}–{pagination.to ?? 0} de{' '}
              {pagination.total}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => fetchSegments(page)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          <RefreshCcw className="h-4 w-4" />
          Atualizar (página {page})
        </button>
      </section>

      {status === 'loading' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Não foi possível carregar os segmentos.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchSegments(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && segments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhum segmento encontrado.</p>
          <p className="text-sm text-slate-500">
            Assim que houver segmentos, eles serão listados aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && segments.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PlusCircle className="h-4 w-4 text-indigo-500" />
                  Novo segmento
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Nome do segmento</span>
                      <input
                        type="text"
                        value={segmentForm.name}
                        onChange={(event) =>
                          setSegmentForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Compradores frequentes"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      />
                    </label>

                    <RuleBuilder
                      rules={createRules}
                      onAddRule={handleAddRule}
                      onRemoveRule={handleRemoveRule}
                      onUpdateRule={handleUpdateRule}
                      onUpdateRuleData={handleUpdateRuleData}
                      previewCount={previewCount}
                      onCalculatePreview={handleCalculatePreview}
                      showPreview
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancelCreate}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateSegment}
                      disabled={!isCreateValid || createStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Tag className="h-4 w-4" />
                      Criar segmento
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Segmento criado!
                      </span>
                    ) : null}

                    {createStatus === 'error' ? (
                      <span className="text-xs font-semibold text-rose-600">
                        {createRulesError ?? createError}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
                <Filter className="h-4 w-4 text-indigo-500" />
                Lista de segmentos
              </div>

              <div className="space-y-3">
                {segments.map((segment) => {
                  const isActive = selectedSegment?.id === segment.id
                  const rulesCount = Object.keys(segment.rules).length

                  return (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => handleSelectSegment(segment)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {segment.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {segment.tenant_id}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {rulesCount} regra{rulesCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{formatDate(segment.created_at)}</span>
                        <span className="font-semibold text-slate-700">
                          Atualizado: {formatDate(segment.updated_at)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {pagination ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
                  <div className="text-xs text-slate-500">
                    Mostrando{' '}
                    <span className="font-semibold text-slate-700">
                      {pagination.from ?? 0}
                    </span>{' '}
                    –
                    <span className="font-semibold text-slate-700">
                      {pagination.to ?? 0}
                    </span>{' '}
                    de{' '}
                    <span className="font-semibold text-slate-700">
                      {pagination.total}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!pagination.prev_page_url}
                      onClick={() => handleGoToPage(pagination.current_page - 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <div className="mx-1 flex items-center gap-1">
                      {pageItems.map((item, idx) =>
                        item === '...' ? (
                          <span
                            key={`dots-${idx}`}
                            className="px-2 text-xs text-slate-400"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleGoToPage(item)}
                            className={`min-w-9 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              item === pagination.current_page
                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!pagination.next_page_url}
                      onClick={() => handleGoToPage(pagination.current_page + 1)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Detalhes</p>
                <p className="text-xs text-slate-500">
                  {selectedSegment?.name ?? 'Selecione um segmento'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedSegment ? (
                  <button
                    type="button"
                    onClick={() => setIsExportOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                ) : null}
                {detailStatus === 'loading' ? (
                  <span className="text-xs text-slate-400">Atualizando...</span>
                ) : null}
              </div>
            </div>

            {selectedSegment ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Segmento
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        {selectedSegment.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4 w-4 text-indigo-500" />
                        {selectedSegment.tenant_id}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Criado em {formatDate(selectedSegment.created_at)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Atualizado em {formatDate(selectedSegment.updated_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Resumo
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <p className="text-xs text-slate-500">
                        Regras cadastradas
                      </p>
                      <p className="text-2xl font-semibold text-slate-900">
                        {selectedRules.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4 text-indigo-500" />
                      Editar segmento
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">
                      {isEditOpen ? 'Recolher' : 'Expandir'}
                    </span>
                  </button>

                  {isEditOpen ? (
                    <>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Nome</span>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          />
                        </label>
                      </div>

                      <RuleBuilder
                        rules={editRules}
                        onAddRule={handleAddEditRule}
                        onRemoveRule={handleRemoveEditRule}
                        onUpdateRule={handleUpdateEditRule}
                        onUpdateRuleData={handleUpdateEditRuleData}
                        previewCount={editPreviewCount}
                        onCalculatePreview={handleCalculateEditPreview}
                        showPreview
                      />

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditOpen(false)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateSegment}
                          disabled={!isUpdateValid || updateStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Segmento atualizado!
                          </span>
                        ) : null}

                        {updateStatus === 'error' ? (
                          <span className="text-xs font-semibold text-rose-600">
                            {updateRulesError ?? updateError}
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Regras de segmentação
                  </p>
                  {selectedRules.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {selectedRules.map((rule) => {
                        const filterDefinition = getFilterDefinition(
                          rule.category,
                          rule.filter,
                        )
                        const categoryLabel =
                          RULE_CATEGORIES.find(
                            (category) => category.value === rule.category,
                          )?.label ?? 'Categoria'
                        const filterLabel =
                          filterDefinition?.label ?? formatRuleLabel(rule.filter)
                        const summary = formatRuleValue(rule)

                        return (
                          <div
                            key={rule.id}
                            className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">
                                {filterLabel}
                              </p>
                              <p className="text-xs text-slate-500">
                                {categoryLabel}
                              </p>
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {summary || '—'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Nenhuma regra cadastrada para este segmento.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione um segmento para ver os detalhes.
              </div>
            )}
          </section>
        </div>
      ) : null}
      {selectedSegment ? (
        <ExportSegmentModal
          segmentId={selectedSegment.id}
          segmentName={selectedSegment.name}
          open={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      ) : null}
    </DashboardPage>
  )
}

export default Segmentation
