import { useState, type Dispatch, type SetStateAction } from 'react'
import type { Segment } from '../../../lib/services/segments/segments.types'
import {
  toggleFormSegment,
  type CustomerFormState,
} from '../types/customers.types'

type CustomerFormFieldsProps = {
  form: CustomerFormState
  setForm: Dispatch<SetStateAction<CustomerFormState>>
  segments: Segment[]
  firstNamePlaceholder?: string
  lastNamePlaceholder?: string
  emailPlaceholder?: string
  phonePlaceholder?: string
  externalIdPlaceholder?: string
}

const CustomerFormFields = ({
  form,
  setForm,
  segments,
  firstNamePlaceholder,
  lastNamePlaceholder,
  emailPlaceholder,
  phonePlaceholder,
  externalIdPlaceholder,
}: CustomerFormFieldsProps) => {
  const [segmentsPage, setSegmentsPage] = useState(0)

  return (
    <div className="mt-4 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Primeiro nome</span>
          <input
            value={form.first_name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                first_name: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
            placeholder={firstNamePlaceholder}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-600">
          <span>Sobrenome</span>
          <input
            value={form.last_name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                last_name: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
            placeholder={lastNamePlaceholder}
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-600">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              email: event.target.value,
            }))
          }
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
          placeholder={emailPlaceholder}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-600">
          <span>Data de nascimento (opcional)</span>
          <input
            type="date"
            value={form.birth_date}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                birth_date: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-600">
          <span>Telefone</span>
          <input
            value={form.phone}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                phone: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
            placeholder={phonePlaceholder}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-600">
          <span>External ID (opcional)</span>
          <input
            value={form.external_id}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                external_id: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
            placeholder={externalIdPlaceholder}
          />
        </label>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Preferências</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.preferences.sms}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    sms: event.target.checked,
                  },
                }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            SMS
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.preferences.newsletter}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    newsletter: event.target.checked,
                  },
                }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Newsletter
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Segmentos vinculados</p>
        {segments.length === 0 ? (
          <p className="text-xs text-slate-400">
            Nenhum segmento disponível para seleção.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {segments.slice(segmentsPage * 4, segmentsPage * 4 + 4).map((segment) => (
              <label
                key={segment.id}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={form.segments.includes(String(segment.id))}
                  onChange={() => toggleFormSegment(String(segment.id), setForm)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                {segment.name}
              </label>
            ))}
          </div>
        )}
        {segments.length > 4 ? (
          <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
            <button type="button" disabled={segmentsPage === 0} onClick={() => setSegmentsPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Anterior</button>
            <span>{segmentsPage + 1} / {Math.ceil(segments.length / 4)}</span>
            <button type="button" disabled={segmentsPage + 1 >= Math.ceil(segments.length / 4)} onClick={() => setSegmentsPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Proxima</button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CustomerFormFields
