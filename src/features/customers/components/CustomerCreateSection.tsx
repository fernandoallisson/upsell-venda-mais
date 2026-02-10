import { PlusCircle, User } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { Segment } from '../../../lib/services/segments/segments.types'
import CustomerFormFields from './CustomerFormFields'
import {
  isCustomerFormValid,
  type CustomerFormState,
  type MutationStatus,
} from '../types/customers.types'

type CustomerCreateSectionProps = {
  isCreateOpen: boolean
  setIsCreateOpen: Dispatch<SetStateAction<boolean>>
  customerForm: CustomerFormState
  setCustomerForm: Dispatch<SetStateAction<CustomerFormState>>
  createStatus: MutationStatus
  createError: string | null
  onCreateCustomer: () => void
  segments: Segment[]
}

const CustomerCreateSection = ({
  isCreateOpen,
  setIsCreateOpen,
  customerForm,
  setCustomerForm,
  createStatus,
  createError,
  onCreateCustomer,
  segments,
}: CustomerCreateSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setIsCreateOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <PlusCircle className="h-4 w-4 text-indigo-500" />
          Novo cliente
        </div>
        <span className="text-xs font-semibold text-indigo-600">
          {isCreateOpen ? 'Recolher' : 'Expandir'}
        </span>
      </button>

      {isCreateOpen ? (
        <>
          <CustomerFormFields
            form={customerForm}
            setForm={setCustomerForm}
            segments={segments}
            firstNamePlaceholder="Ana"
            lastNamePlaceholder="Almeida"
            emailPlaceholder="ana.almeida@example.com"
            phonePlaceholder="(11) 99999-9999"
            externalIdPlaceholder="cust-000036"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateCustomer}
              disabled={!isCustomerFormValid(customerForm) || createStatus === 'loading'}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <User className="h-4 w-4" />
              Criar cliente
            </button>

            {createStatus === 'success' ? (
              <span className="text-xs font-semibold text-emerald-600">
                Cliente criado!
              </span>
            ) : null}
            {createStatus === 'error' ? (
              <span className="text-xs font-semibold text-rose-600">{createError}</span>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  )
}

export default CustomerCreateSection
