import type { Dispatch, SetStateAction } from 'react'
import type { CustomersResponse } from '../../../lib/services/customers/customers.types'

export type AsyncStatus = 'idle' | 'loading' | 'error'
export type MutationStatus = 'idle' | 'loading' | 'success' | 'error'

export type PaginationMeta = Pick<
  CustomersResponse,
  | 'current_page'
  | 'last_page'
  | 'per_page'
  | 'total'
  | 'from'
  | 'to'
  | 'next_page_url'
  | 'prev_page_url'
>

export type CustomerFormState = {
  external_id: string
  email: string
  birth_date: string
  phone: string
  first_name: string
  last_name: string
  preferences: {
    sms: boolean
    newsletter: boolean
  }
  segments: string[]
}

export const createInitialCustomerForm = (): CustomerFormState => ({
  external_id: '',
  email: '',
  birth_date: '',
  phone: '',
  first_name: '',
  last_name: '',
  preferences: {
    sms: false,
    newsletter: false,
  },
  segments: [],
})

export const toggleFormSegment = <T extends { segments: string[] }>(
  value: string,
  setter: Dispatch<SetStateAction<T>>,
) => {
  setter((prev) => {
    const exists = prev.segments.includes(value)
    const segments = exists
      ? prev.segments.filter((segment) => segment !== value)
      : [...prev.segments, value]

    return {
      ...prev,
      segments,
    }
  })
}

export const isCustomerFormValid = (form: CustomerFormState): boolean => {
  const requiredFields =
    form.email.trim() &&
    form.phone.trim() &&
    form.first_name.trim() &&
    form.last_name.trim()

  return Boolean(requiredFields)
}
