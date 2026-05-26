import { Calendar, Mail, Pencil, Phone, Tag, Trash2 } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import WorkspaceTabs from '../../../components/layout/WorkspaceTabs'
import type { Customer, CustomerSegment } from '../../../lib/services/customers/customers.types'
import type { Segment } from '../../../lib/services/segments/segments.types'
import CustomerFormFields from './CustomerFormFields'
import {
  isCustomerFormValid,
  type AsyncStatus,
  type CustomerFormState,
  type MutationStatus,
} from '../types/customers.types'
import {
  formatCurrency,
  formatDate,
  formatDateOnly,
  formatLifecycleStage,
} from '../utils/formatters'

type CustomerDetailsSectionProps = {
  detailStatus: AsyncStatus
  selectedCustomer: Customer | null
  selectedSegments: CustomerSegment[]
  onOpenOrdersModal: () => void
  isEditOpen: boolean
  setIsEditOpen: Dispatch<SetStateAction<boolean>>
  editForm: CustomerFormState
  setEditForm: Dispatch<SetStateAction<CustomerFormState>>
  updateStatus: MutationStatus
  updateError: string | null
  onUpdateCustomer: () => void
  onDeleteCustomer: () => void
  segments: Segment[]
}

const CustomerDetailsSection = ({
  detailStatus,
  selectedCustomer,
  selectedSegments,
  onOpenOrdersModal,
  isEditOpen,
  setIsEditOpen,
  editForm,
  setEditForm,
  updateStatus,
  updateError,
  onUpdateCustomer,
  onDeleteCustomer,
  segments,
}: CustomerDetailsSectionProps) => {
  const [detailView, setDetailView] = useState<'summary' | 'relations' | 'edit' | 'actions'>('summary')

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {detailStatus === 'loading' ? (
        <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ) : null}

      {detailStatus !== 'loading' && selectedCustomer ? (
        <>
          <WorkspaceTabs
            value={detailView}
            onChange={setDetailView}
            tabs={[
              { value: 'summary', label: 'Resumo' },
              { value: 'relations', label: 'Preferências' },
              { value: 'edit', label: 'Editar' },
              { value: 'actions', label: 'Ações' },
            ]}
          />
          <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''}`}>
            <p className="text-xs font-semibold text-slate-500">Cliente selecionado</p>
            <h3 className="text-xl font-semibold text-slate-900">
              {selectedCustomer.first_name} {selectedCustomer.last_name}
            </h3>
            <p className="text-sm text-slate-500">
              {formatLifecycleStage(selectedCustomer.lifecycle_stage)}
            </p>
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''} mt-6 grid gap-4 md:grid-cols-2`}>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Total gasto</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(selectedCustomer.lifetime_value, 'BRL')}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Ticket médio</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(selectedCustomer.average_ticket, 'BRL')}
              </p>
            </div>
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''} mt-6 grid gap-4 text-sm text-slate-600`}>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-500" />
              {selectedCustomer.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-500" />
              {selectedCustomer.phone}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Nascimento: {formatDateOnly(selectedCustomer.birth_date)}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Última compra: {formatDate(selectedCustomer.last_purchase_at)}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-500" />
              <button
                type="button"
                onClick={onOpenOrdersModal}
                className="text-left text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                {selectedCustomer.total_orders_count} pedidos no total
              </button>
            </div>
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'relations' ? 'is-active' : ''} mt-6`}>
            <p className="text-xs font-semibold text-slate-500">Preferências</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedCustomer.preferences.sms ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  SMS
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Sem SMS
                </span>
              )}
              {selectedCustomer.preferences.newsletter ? (
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  Newsletter
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Sem newsletter
                </span>
              )}
            </div>
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'relations' ? 'is-active' : ''} mt-6`}>
            <p className="text-xs font-semibold text-slate-500">Segmentos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSegments.length === 0 ? (
                <span className="text-xs text-slate-400">Nenhum segmento vinculado.</span>
              ) : (
                selectedSegments.map((segment) => (
                  <span
                    key={segment.id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {segment.name}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'edit' ? 'is-active' : ''} mt-6 rounded-xl border border-slate-200 p-4`}>
            <button
              type="button"
              onClick={() => setIsEditOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Pencil className="h-4 w-4 text-indigo-500" />
                Editar cliente
              </div>
              <span className="text-xs font-semibold text-indigo-600">
                {isEditOpen ? 'Recolher' : 'Expandir'}
              </span>
            </button>

            {isEditOpen ? (
              <>
                <CustomerFormFields
                  form={editForm}
                  setForm={setEditForm}
                  segments={segments}
                />

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onUpdateCustomer}
                    disabled={!isCustomerFormValid(editForm) || updateStatus === 'loading'}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Pencil className="h-4 w-4" />
                    Atualizar cliente
                  </button>

                  {updateStatus === 'success' ? (
                    <span className="text-xs font-semibold text-emerald-600">
                      Cliente atualizado!
                    </span>
                  ) : null}
                  {updateStatus === 'error' ? (
                    <span className="text-xs font-semibold text-rose-600">{updateError}</span>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          <div className={`desktop-workspace-panel ${detailView === 'actions' ? 'is-active' : ''} mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4`}>
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
              <Trash2 className="h-4 w-4" />
              Remover cliente
            </div>
            <p className="mt-2 text-xs text-rose-600">
              Esta ação é irreversível e remove o cliente do CRM.
            </p>
            <button
              type="button"
              onClick={onDeleteCustomer}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              Excluir cliente
            </button>
          </div>
        </>
      ) : null}

      {detailStatus !== 'loading' && !selectedCustomer ? (
        <div className="text-sm text-slate-500">Selecione um cliente para ver detalhes.</div>
      ) : null}
    </section>
  )
}

export default CustomerDetailsSection
