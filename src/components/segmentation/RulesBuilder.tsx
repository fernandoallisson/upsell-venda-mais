import { AlertCircle, Filter, Plus, Trash2 } from 'lucide-react'
import {
  createRuleForFilter,
  fieldSuggestions,
  operatorOptions,
  ruleFilters,
  ruleSummary,
  toApiRules,
  validateAll,
  type SegmentRuleFilter,
  type SegmentRuleUI,
} from '../../lib/segments/rulesBuilder'

const filterLabel = (filter: SegmentRuleFilter) =>
  ruleFilters.find((option) => option.value === filter)?.label ?? filter

type RulesBuilderProps = {
  value: SegmentRuleUI[]
  onChange: (rules: SegmentRuleUI[]) => void
  errorsById?: Record<string, string[]>
}

const RulesBuilder = ({ value, onChange, errorsById }: RulesBuilderProps) => {
  const handleAddRule = () => {
    onChange([...value, createRuleForFilter('last_purchase_within_days')])
  }

  const handleRuleChange = (nextRule: SegmentRuleUI) => {
    onChange(value.map((rule) => (rule.id === nextRule.id ? nextRule : rule)))
  }

  const handleRemoveRule = (id: string) => {
    onChange(value.filter((rule) => rule.id !== id))
  }

  const previewRules = toApiRules(value)
  const previewValidation = validateAll(value)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Construtor de regras
          </p>
          <p className="text-xs text-slate-500">
            Adicione filtros para formar o público do segmento.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddRule}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300"
        >
          <Plus className="h-4 w-4" />
          Adicionar regra
        </button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Clique em "Adicionar regra" para começar.
        </div>
      ) : (
        <div className="space-y-4">
          {value.map((rule, index) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              index={index}
              onChange={handleRuleChange}
              onRemove={handleRemoveRule}
              errors={errorsById?.[rule.id]}
            />
          ))}
        </div>
      )}

      <RulesSummary rules={value} />

      <details className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          Pré-visualização do JSON
        </summary>
        <div className="mt-3 text-xs text-slate-500">
          {previewValidation.isValid
            ? 'JSON enviado para o backend.'
            : 'Revise as regras antes de enviar.'}
        </div>
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
          {JSON.stringify(previewRules, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export const RulesSummary = ({ rules }: { rules: SegmentRuleUI[] }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Filter className="h-4 w-4 text-indigo-500" />
        Resumo das regras
      </div>
      {rules.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Nenhuma regra definida.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              <span className="font-medium text-slate-700">
                {ruleSummary(rule)}
              </span>
              <span className="text-xs text-slate-400">
                {filterLabel(rule.filter)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type RuleRowProps = {
  rule: SegmentRuleUI
  index: number
  onChange: (rule: SegmentRuleUI) => void
  onRemove: (id: string) => void
  errors?: string[]
}

const RuleRow = ({ rule, index, onChange, onRemove, errors }: RuleRowProps) => {
  const updateField = <K extends keyof SegmentRuleUI>(key: K, value: string) => {
    onChange({ ...rule, [key]: value } as SegmentRuleUI)
  }

  const handleFilterChange = (filter: SegmentRuleFilter) => {
    onChange({ ...createRuleForFilter(filter), id: rule.id })
  }

  const renderInputs = () => {
    switch (rule.filter) {
      case 'last_purchase_within_days':
      case 'days_since_last_order':
        return (
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Dias
            <input
              type="number"
              min="1"
              value={rule.days}
              onChange={(event) => updateField('days', event.target.value)}
              placeholder="90"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </label>
        )
      case 'utm_source':
      case 'utm_medium':
      case 'utm_campaign':
        return (
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Valor
            <input
              type="text"
              value={rule.value}
              onChange={(event) => updateField('value', event.target.value)}
              placeholder="tiktok"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </label>
        )
      case 'average_ticket':
      case 'lifetime_value':
      case 'total_orders_count':
        return (
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Operador
              <select
                value={rule.operator}
                onChange={(event) => updateField('operator', event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <option value="">Selecione</option>
                {operatorOptions.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Valor
              <input
                type="number"
                value={rule.value}
                onChange={(event) => updateField('value', event.target.value)}
                placeholder="100"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
          </div>
        )
      case 'has_purchased_product':
        return (
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            ID do produto
            <input
              type="number"
              min="1"
              value={rule.product_id}
              onChange={(event) => updateField('product_id', event.target.value)}
              placeholder="123"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </label>
        )
      case 'has_purchased_category':
        return (
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            ID da categoria
            <input
              type="number"
              min="1"
              value={rule.category_id}
              onChange={(event) => updateField('category_id', event.target.value)}
              placeholder="17"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
            />
          </label>
        )
      case 'preference':
        return (
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Chave
              <input
                type="text"
                value={rule.key}
                onChange={(event) => updateField('key', event.target.value)}
                placeholder="newsletter"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Tipo do valor
              <select
                value={rule.valueMode}
                onChange={(event) =>
                  onChange({
                    ...rule,
                    valueMode: event.target.value as
                      | 'none'
                      | 'string'
                      | 'number'
                      | 'boolean',
                    value: '',
                    valueBoolean: false,
                  })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <option value="none">Sem valor</option>
                <option value="string">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Booleano</option>
              </select>
            </label>
            {rule.valueMode === 'boolean' ? (
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={rule.valueBoolean}
                  onChange={(event) =>
                    onChange({
                      ...rule,
                      valueBoolean: event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                Ativo
              </label>
            ) : null}
            {rule.valueMode === 'string' ? (
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Valor
                <input
                  type="text"
                  value={rule.value}
                  onChange={(event) => updateField('value', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
            ) : null}
            {rule.valueMode === 'number' ? (
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Valor
                <input
                  type="number"
                  value={rule.value}
                  onChange={(event) => updateField('value', event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
            ) : null}
          </div>
        )
      case 'created_between':
      case 'has_order_between':
        return (
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Início
              <input
                type="date"
                value={rule.start}
                onChange={(event) => updateField('start', event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Fim
              <input
                type="date"
                value={rule.end}
                onChange={(event) => updateField('end', event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
          </div>
        )
      case 'email_present':
      case 'phone_present':
      case 'has_upsell':
        return (
          <p className="text-xs text-slate-500">
            Nenhum campo adicional para esta regra.
          </p>
        )
      case 'field':
        return (
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Campo
              <input
                type="text"
                list={`field-suggestions-${rule.id}`}
                value={rule.field}
                onChange={(event) => updateField('field', event.target.value)}
                placeholder="average_ticket"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
              <datalist id={`field-suggestions-${rule.id}`}>
                {fieldSuggestions.map((field) => (
                  <option key={field} value={field} />
                ))}
              </datalist>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Operador
              <select
                value={rule.operator}
                onChange={(event) => updateField('operator', event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <option value="">Selecione</option>
                {operatorOptions.map((operator) => (
                  <option key={operator} value={operator}>
                    {operator}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Tipo do valor
              <select
                value={rule.valueType}
                onChange={(event) =>
                  onChange({
                    ...rule,
                    valueType: event.target.value as 'string' | 'number',
                    value: '',
                  })
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <option value="string">Texto</option>
                <option value="number">Número</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-500">
              Valor
              <input
                type={rule.valueType === 'number' ? 'number' : 'text'}
                value={rule.value}
                onChange={(event) => updateField('value', event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
              />
            </label>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Regra {index + 1}
          </span>
          <select
            value={rule.filter}
            onChange={(event) =>
              handleFilterChange(event.target.value as SegmentRuleFilter)
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            {ruleFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onRemove(rule.id)}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:border-rose-300"
        >
          <Trash2 className="h-4 w-4" />
          Remover
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">{renderInputs()}</div>

      {errors && errors.length > 0 ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Ajuste esta regra
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default RulesBuilder
