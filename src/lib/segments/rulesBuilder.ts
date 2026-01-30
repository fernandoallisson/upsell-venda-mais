import type { SegmentRules } from '../services/segments/segments.types'

export type SegmentRuleFilter =
  | 'last_purchase_within_days'
  | 'days_since_last_order'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign'
  | 'average_ticket'
  | 'lifetime_value'
  | 'total_orders_count'
  | 'has_purchased_product'
  | 'has_purchased_category'
  | 'has_upsell'
  | 'preference'
  | 'created_between'
  | 'email_present'
  | 'phone_present'
  | 'has_order_between'
  | 'field'

export type RuleOperator = '>' | '<' | '>=' | '<=' | '=' | '!='

type RuleBase = {
  id: string
  filter: SegmentRuleFilter
}

export type SegmentRuleUI =
  | (RuleBase & {
      filter: 'last_purchase_within_days' | 'days_since_last_order'
      days: string
    })
  | (RuleBase & {
      filter: 'utm_source' | 'utm_medium' | 'utm_campaign'
      value: string
    })
  | (RuleBase & {
      filter: 'average_ticket' | 'lifetime_value' | 'total_orders_count'
      operator: RuleOperator | ''
      value: string
    })
  | (RuleBase & {
      filter: 'has_purchased_product'
      product_id: string
    })
  | (RuleBase & {
      filter: 'has_purchased_category'
      category_id: string
    })
  | (RuleBase & {
      filter: 'preference'
      key: string
      valueMode: 'none' | 'string' | 'number' | 'boolean'
      value: string
      valueBoolean: boolean
    })
  | (RuleBase & {
      filter: 'created_between' | 'has_order_between'
      start: string
      end: string
    })
  | (RuleBase & {
      filter: 'email_present' | 'phone_present' | 'has_upsell'
    })
  | (RuleBase & {
      filter: 'field'
      field: string
      operator: RuleOperator | ''
      valueType: 'string' | 'number'
      value: string
    })

export type ApiRule = Record<string, string | number | boolean>

export const ruleFilters: Array<{ value: SegmentRuleFilter; label: string }> = [
  { value: 'last_purchase_within_days', label: 'Última compra nos últimos dias' },
  { value: 'days_since_last_order', label: 'Dias desde o último pedido' },
  { value: 'utm_source', label: 'UTM Source' },
  { value: 'utm_medium', label: 'UTM Medium' },
  { value: 'utm_campaign', label: 'UTM Campaign' },
  { value: 'average_ticket', label: 'Ticket médio' },
  { value: 'lifetime_value', label: 'Lifetime value' },
  { value: 'total_orders_count', label: 'Total de pedidos' },
  { value: 'has_purchased_product', label: 'Comprou produto (ID)' },
  { value: 'has_purchased_category', label: 'Comprou categoria (ID)' },
  { value: 'has_upsell', label: 'Comprou upsell' },
  { value: 'preference', label: 'Preferência' },
  { value: 'created_between', label: 'Criado entre datas' },
  { value: 'email_present', label: 'Email presente' },
  { value: 'phone_present', label: 'Telefone presente' },
  { value: 'has_order_between', label: 'Pedido entre datas' },
  { value: 'field', label: 'Campo personalizado (fallback)' },
]

export const operatorOptions: RuleOperator[] = ['>', '<', '>=', '<=', '=', '!=']

export const fieldSuggestions = [
  'average_ticket',
  'lifetime_value',
  'total_orders_count',
  'last_purchase_at',
  'created_at',
]

const createId = () => Math.random().toString(36).slice(2, 10)

export const createRuleForFilter = (
  filter: SegmentRuleFilter,
  id: string = createId(),
): SegmentRuleUI => {
  switch (filter) {
    case 'last_purchase_within_days':
    case 'days_since_last_order':
      return { id, filter, days: '' }
    case 'utm_source':
    case 'utm_medium':
    case 'utm_campaign':
      return { id, filter, value: '' }
    case 'average_ticket':
    case 'lifetime_value':
    case 'total_orders_count':
      return { id, filter, operator: '', value: '' }
    case 'has_purchased_product':
      return { id, filter, product_id: '' }
    case 'has_purchased_category':
      return { id, filter, category_id: '' }
    case 'preference':
      return {
        id,
        filter,
        key: '',
        valueMode: 'none',
        value: '',
        valueBoolean: false,
      }
    case 'created_between':
    case 'has_order_between':
      return { id, filter, start: '', end: '' }
    case 'email_present':
    case 'phone_present':
    case 'has_upsell':
      return { id, filter }
    case 'field':
      return { id, filter, field: '', operator: '', valueType: 'string', value: '' }
    default:
      return { id, filter }
  }
}

const parsePositiveInt = (value: string): number | null => {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

const parseNumberValue = (value: string): number | null => {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return null
  return parsed
}

export const validateRule = (rule: SegmentRuleUI): string[] => {
  const errors: string[] = []

  switch (rule.filter) {
    case 'last_purchase_within_days':
    case 'days_since_last_order': {
      if (!parsePositiveInt(rule.days)) {
        errors.push('Informe dias como inteiro positivo.')
      }
      break
    }
    case 'utm_source':
    case 'utm_medium':
    case 'utm_campaign': {
      if (!rule.value.trim()) errors.push('Informe um valor de UTM.')
      break
    }
    case 'average_ticket':
    case 'lifetime_value':
    case 'total_orders_count': {
      if (!rule.operator) errors.push('Selecione um operador.')
      if (parseNumberValue(rule.value) === null) {
        errors.push('Informe um valor numérico.')
      }
      break
    }
    case 'has_purchased_product': {
      if (!parsePositiveInt(rule.product_id)) {
        errors.push('Informe um ID de produto válido.')
      }
      break
    }
    case 'has_purchased_category': {
      if (!parsePositiveInt(rule.category_id)) {
        errors.push('Informe um ID de categoria válido.')
      }
      break
    }
    case 'preference': {
      if (!rule.key.trim()) errors.push('Informe a chave da preferência.')
      if (rule.valueMode === 'number' && parseNumberValue(rule.value) === null) {
        errors.push('Informe um valor numérico válido.')
      }
      if (rule.valueMode === 'string' && !rule.value.trim()) {
        errors.push('Informe um valor para a preferência.')
      }
      break
    }
    case 'created_between':
    case 'has_order_between': {
      if (!rule.start) errors.push('Informe a data inicial.')
      if (!rule.end) errors.push('Informe a data final.')
      if (rule.start && rule.end && rule.start > rule.end) {
        errors.push('A data inicial deve ser menor ou igual à final.')
      }
      break
    }
    case 'field': {
      if (!rule.field.trim()) errors.push('Informe o nome do campo.')
      if (!rule.operator) errors.push('Selecione um operador.')
      if (rule.valueType === 'number' && parseNumberValue(rule.value) === null) {
        errors.push('Informe um valor numérico válido.')
      }
      if (rule.valueType === 'string' && !rule.value.trim()) {
        errors.push('Informe um valor para comparação.')
      }
      break
    }
    default:
      break
  }

  return errors
}

export const validateAll = (rules: SegmentRuleUI[]) => {
  const errorsById: Record<string, string[]> = {}
  const seen = new Map<string, string>()
  const duplicateIds: string[] = []

  rules.forEach((rule) => {
    const errors = validateRule(rule)
    if (errors.length > 0) {
      errorsById[rule.id] = errors
    }

    if (errors.length === 0) {
      const apiRule = toApiRule(rule)
      const key = apiRule ? JSON.stringify(apiRule) : ''
      if (key && seen.has(key)) {
        duplicateIds.push(rule.id)
      } else if (key) {
        seen.set(key, rule.id)
      }
    }
  })

  duplicateIds.forEach((id) => {
    const current = errorsById[id] ?? []
    errorsById[id] = [...current, 'Regra duplicada.']
  })

  const isValid =
    rules.length > 0 &&
    Object.keys(errorsById).length === 0 &&
    duplicateIds.length === 0

  return { isValid, errorsById, duplicateIds }
}

const toApiRule = (rule: SegmentRuleUI): ApiRule | null => {
  const errors = validateRule(rule)
  if (errors.length > 0) return null

  switch (rule.filter) {
    case 'last_purchase_within_days':
    case 'days_since_last_order':
      return {
        filter: rule.filter,
        days: parsePositiveInt(rule.days) as number,
      }
    case 'utm_source':
    case 'utm_medium':
    case 'utm_campaign':
      return { filter: rule.filter, value: rule.value.trim() }
    case 'average_ticket':
    case 'lifetime_value':
    case 'total_orders_count':
      return {
        filter: rule.filter,
        operator: rule.operator,
        value: parseNumberValue(rule.value) as number,
      }
    case 'has_purchased_product':
      return {
        filter: rule.filter,
        product_id: parsePositiveInt(rule.product_id) as number,
      }
    case 'has_purchased_category':
      return {
        filter: rule.filter,
        category_id: parsePositiveInt(rule.category_id) as number,
      }
    case 'preference': {
      if (rule.valueMode === 'none') {
        return { filter: rule.filter, key: rule.key.trim() }
      }
      if (rule.valueMode === 'boolean') {
        return {
          filter: rule.filter,
          key: rule.key.trim(),
          value: rule.valueBoolean,
        }
      }
      if (rule.valueMode === 'number') {
        return {
          filter: rule.filter,
          key: rule.key.trim(),
          value: parseNumberValue(rule.value) as number,
        }
      }
      return {
        filter: rule.filter,
        key: rule.key.trim(),
        value: rule.value.trim(),
      }
    }
    case 'created_between':
    case 'has_order_between':
      return {
        filter: rule.filter,
        start: rule.start,
        end: rule.end,
      }
    case 'email_present':
    case 'phone_present':
    case 'has_upsell':
      return { filter: rule.filter }
    case 'field': {
      const value =
        rule.valueType === 'number'
          ? (parseNumberValue(rule.value) as number)
          : rule.value.trim()
      return {
        filter: rule.filter,
        field: rule.field.trim(),
        operator: rule.operator,
        value,
      }
    }
    default:
      return null
  }
}

export const toApiRules = (rules: SegmentRuleUI[]) =>
  rules
    .map((rule) => toApiRule(rule))
    .filter((rule): rule is ApiRule => rule !== null)

export const fromApiRules = (rules: SegmentRules): SegmentRuleUI[] => {
  if (Array.isArray(rules)) {
    return rules.map((rule) => {
      if (typeof rule === 'string') {
        return createRuleForFilter(rule as SegmentRuleFilter)
      }

      const filter = String((rule as Record<string, unknown>).filter ?? 'field')
      const id = createId()
      switch (filter) {
        case 'last_purchase_within_days':
        case 'days_since_last_order':
          return {
            id,
            filter,
            days: String((rule as Record<string, unknown>).days ?? ''),
          }
        case 'utm_source':
        case 'utm_medium':
        case 'utm_campaign':
          return {
            id,
            filter,
            value: String((rule as Record<string, unknown>).value ?? ''),
          }
        case 'average_ticket':
        case 'lifetime_value':
        case 'total_orders_count':
          return {
            id,
            filter,
            operator: String((rule as Record<string, unknown>).operator ?? ''),
            value: String((rule as Record<string, unknown>).value ?? ''),
          }
        case 'has_purchased_product':
          return {
            id,
            filter,
            product_id: String((rule as Record<string, unknown>).product_id ?? ''),
          }
        case 'has_purchased_category':
          return {
            id,
            filter,
            category_id: String((rule as Record<string, unknown>).category_id ?? ''),
          }
        case 'preference': {
          const rawValue = (rule as Record<string, unknown>).value
          const valueMode =
            typeof rawValue === 'boolean'
              ? 'boolean'
              : typeof rawValue === 'number'
                ? 'number'
                : rawValue
                  ? 'string'
                  : 'none'
          return {
            id,
            filter,
            key: String((rule as Record<string, unknown>).key ?? ''),
            valueMode,
            value: rawValue ? String(rawValue) : '',
            valueBoolean: Boolean(rawValue),
          }
        }
        case 'created_between':
        case 'has_order_between':
          return {
            id,
            filter,
            start: String((rule as Record<string, unknown>).start ?? ''),
            end: String((rule as Record<string, unknown>).end ?? ''),
          }
        case 'email_present':
        case 'phone_present':
        case 'has_upsell':
          return { id, filter }
        case 'field':
        default:
          return {
            id,
            filter: 'field',
            field: String((rule as Record<string, unknown>).field ?? filter),
            operator: String((rule as Record<string, unknown>).operator ?? ''),
            valueType:
              typeof (rule as Record<string, unknown>).value === 'number'
                ? 'number'
                : 'string',
            value: String((rule as Record<string, unknown>).value ?? ''),
          }
      }
    })
  }

  return Object.entries(rules).map(([filter, value]) => {
    const id = createId()
    if (!value || typeof value !== 'object') {
      return createRuleForFilter(filter as SegmentRuleFilter, id)
    }

    if (filter === 'days_since_last_order') {
      return { id, filter, days: String((value as { value?: number }).value ?? '') }
    }

    if (filter === 'last_purchase_within_days') {
      return { id, filter, days: String((value as { value?: number }).value ?? '') }
    }

    if (filter === 'average_ticket' || filter === 'lifetime_value' || filter === 'total_orders_count') {
      return {
        id,
        filter: filter as SegmentRuleFilter,
        operator: String((value as { operator?: string }).operator ?? ''),
        value: String((value as { value?: number }).value ?? ''),
      }
    }

    return createRuleForFilter(filter as SegmentRuleFilter, id)
  })
}

export const ruleSummary = (rule: SegmentRuleUI): string => {
  switch (rule.filter) {
    case 'last_purchase_within_days':
      return rule.days
        ? `Última compra nos últimos ${rule.days} dias`
        : 'Última compra nos últimos dias'
    case 'days_since_last_order':
      return rule.days
        ? `Dias desde o último pedido: ${rule.days}`
        : 'Dias desde o último pedido'
    case 'utm_source':
      return rule.value ? `UTM source = ${rule.value}` : 'UTM source'
    case 'utm_medium':
      return rule.value ? `UTM medium = ${rule.value}` : 'UTM medium'
    case 'utm_campaign':
      return rule.value ? `UTM campaign = ${rule.value}` : 'UTM campaign'
    case 'average_ticket':
      return rule.value && rule.operator
        ? `Ticket médio ${rule.operator} ${rule.value}`
        : 'Ticket médio'
    case 'lifetime_value':
      return rule.value && rule.operator
        ? `Lifetime value ${rule.operator} ${rule.value}`
        : 'Lifetime value'
    case 'total_orders_count':
      return rule.value && rule.operator
        ? `Total de pedidos ${rule.operator} ${rule.value}`
        : 'Total de pedidos'
    case 'has_purchased_product':
      return rule.product_id
        ? `Comprou produto ID ${rule.product_id}`
        : 'Comprou produto'
    case 'has_purchased_category':
      return rule.category_id
        ? `Comprou categoria ID ${rule.category_id}`
        : 'Comprou categoria'
    case 'has_upsell':
      return 'Comprou upsell'
    case 'preference': {
      if (!rule.key) return 'Preferência'
      if (rule.valueMode === 'none') return `Preferência ${rule.key}`
      if (rule.valueMode === 'boolean') {
        return `Preferência ${rule.key} = ${rule.valueBoolean ? 'sim' : 'não'}`
      }
      if (rule.valueMode === 'number') {
        return rule.value
          ? `Preferência ${rule.key} = ${rule.value}`
          : `Preferência ${rule.key}`
      }
      return rule.value
        ? `Preferência ${rule.key} = ${rule.value}`
        : `Preferência ${rule.key}`
    }
    case 'created_between':
      return rule.start && rule.end
        ? `Criado entre ${rule.start} e ${rule.end}`
        : 'Criado entre datas'
    case 'email_present':
      return 'Email presente'
    case 'phone_present':
      return 'Telefone presente'
    case 'has_order_between':
      return rule.start && rule.end
        ? `Pedidos entre ${rule.start} e ${rule.end}`
        : 'Pedido entre datas'
    case 'field':
      return rule.field && rule.operator && rule.value
        ? `${rule.field} ${rule.operator} ${rule.value}`
        : 'Campo personalizado'
    default:
      return 'Regra'
  }
}
