import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../lib/api'
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from '../../../lib/services/customers/customers.service'
import type {
  Customer,
  CustomerPayload,
  CustomersResponse,
} from '../../../lib/services/customers/customers.types'
import { getOrders } from '../../../lib/services/orders/orders.service'
import type { Order } from '../../../lib/services/orders/orders.types'
import { getSegments } from '../../../lib/services/segments/segments.service'
import type { Segment } from '../../../lib/services/segments/segments.types'
import { COMPACT_PAGE_SIZE, loadCompactPage } from '../../../lib/utils/compactPagination'
import {
  createInitialCustomerForm,
  type AsyncStatus,
  type CustomerFormState,
  type MutationStatus,
  type PaginationMeta,
} from '../types/customers.types'
import { buildPageItems } from '../utils/pagination'

const toNumberSegments = (ids: string[]) =>
  ids.map((id) => Number(id)).filter((n) => Number.isFinite(n))

export const useCustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [detailStatus, setDetailStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [serverPageSize, setServerPageSize] = useState(COMPACT_PAGE_SIZE)

  const [customerSearch, setCustomerSearch] = useState('')
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [customerOrdersPage, setCustomerOrdersPage] = useState(1)
  const [customerOrdersStatus, setCustomerOrdersStatus] =
    useState<AsyncStatus>('idle')
  const [customerOrdersError, setCustomerOrdersError] = useState<string | null>(
    null,
  )
  const [ordersCustomerId, setOrdersCustomerId] = useState<number | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<MutationStatus>('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(
    createInitialCustomerForm(),
  )

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<MutationStatus>('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<CustomerFormState>(
    createInitialCustomerForm(),
  )

  const fetchCustomerDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getCustomerById(id)
      setSelectedCustomer(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do cliente.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchCustomers = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await loadCompactPage<Customer, CustomersResponse>(
          getCustomers,
          targetPage,
          serverPageSize,
        )

        setCustomers(response.data)
        setPagination(response.pagination)
        setServerPageSize(response.serverPageSize)
        setPage(response.pagination.current_page)

        const firstCustomer = response.data[0] ?? null
        setSelectedCustomer(firstCustomer)

        if (firstCustomer) {
          fetchCustomerDetails(firstCustomer.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar clientes.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchCustomerDetails, page, serverPageSize],
  )

  const fetchSegmentsList = useCallback(async () => {
    try {
      const response = await getSegments(1)
      setSegments(response.data)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao carregar segmentos.'
      setError(message)
    }
  }, [])

  useEffect(() => {
    fetchCustomers(1)
    fetchSegmentsList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCustomer) return

    setEditForm({
      external_id: selectedCustomer.external_id ?? '',
      email: selectedCustomer.email,
      birth_date: selectedCustomer.birth_date ?? '',
      phone: selectedCustomer.phone,
      first_name: selectedCustomer.first_name,
      last_name: selectedCustomer.last_name,
      preferences: {
        sms: selectedCustomer.preferences.sms,
        newsletter: selectedCustomer.preferences.newsletter,
      },
      segments: selectedCustomer.segments.map((segment) => String(segment.id)),
    })
    setIsEditOpen(false)
    setIsOrdersOpen(false)
    setCustomerOrders([])
    setCustomerOrdersPage(1)
    setCustomerOrdersStatus('idle')
    setCustomerOrdersError(null)
    setOrdersCustomerId(null)
  }, [selectedCustomer])

  useEffect(() => {
    if (isCreateOpen) return
    setCreateStatus('idle')
    setCreateError(null)
  }, [isCreateOpen])

  useEffect(() => {
    if (isEditOpen) return
    setUpdateStatus('idle')
    setUpdateError(null)
  }, [isEditOpen])

  const totals = useMemo(
    () =>
      customers.reduce(
        (acc, customer) => {
          acc.count += 1
          acc.orders += customer.total_orders_count
          return acc
        },
        { count: 0, orders: 0 },
      ),
    [customers],
  )

  const handleSelectCustomer = useCallback(
    (customer: Customer) => {
      setSelectedCustomer(customer)
      fetchCustomerDetails(customer.id)
    },
    [fetchCustomerDetails],
  )

  const handleGoToPage = useCallback(
    (nextPage: number) => {
      if (!pagination) return
      if (nextPage < 1 || nextPage > pagination.last_page) return
      fetchCustomers(nextPage)
    },
    [fetchCustomers, pagination],
  )

  const handleCreateCustomer = useCallback(async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload: CustomerPayload = {
      external_id: customerForm.external_id.trim() || null,
      email: customerForm.email.trim(),
      birth_date: customerForm.birth_date.trim() || null,
      phone: customerForm.phone.trim(),
      first_name: customerForm.first_name.trim(),
      last_name: customerForm.last_name.trim(),
      preferences: customerForm.preferences,
      segments: toNumberSegments(customerForm.segments),
    }

    try {
      await createCustomer(payload)
      setCreateStatus('success')
      setCustomerForm(createInitialCustomerForm())
      setIsCreateOpen(false)
      fetchCustomers(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar cliente.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }, [customerForm, fetchCustomers])

  const handleUpdateCustomer = useCallback(async () => {
    if (!selectedCustomer) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: CustomerPayload = {
      external_id: editForm.external_id.trim() || null,
      email: editForm.email.trim(),
      birth_date: editForm.birth_date.trim() || null,
      phone: editForm.phone.trim(),
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      preferences: editForm.preferences,
      segments: toNumberSegments(editForm.segments),
    }

    try {
      const updated = await updateCustomer(selectedCustomer.id, payload)
      setSelectedCustomer(updated)
      setUpdateStatus('success')
      fetchCustomers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar cliente.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }, [editForm, fetchCustomers, page, selectedCustomer])

  const handleDeleteCustomer = useCallback(async () => {
    if (!selectedCustomer) return

    const confirmed = window.confirm('Tem certeza que deseja remover este cliente?')
    if (!confirmed) return

    try {
      await deleteCustomer(selectedCustomer.id)
      setSelectedCustomer(null)
      fetchCustomers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover cliente.'
      setError(message)
    }
  }, [fetchCustomers, page, selectedCustomer])

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase()
    if (!query) return customers

    return customers.filter((customer) =>
      `${customer.first_name} ${customer.last_name}`
        .toLowerCase()
        .includes(query),
    )
  }, [customerSearch, customers])

  const fetchCustomerOrders = useCallback(async (customerId: number) => {
    setCustomerOrdersStatus('loading')
    setCustomerOrdersError(null)

    try {
      const firstPage = await getOrders(1)
      let allOrders = [...firstPage.data]

      if (firstPage.last_page > 1) {
        for (let current = 2; current <= firstPage.last_page; current += 1) {
          const response = await getOrders(current)
          allOrders = allOrders.concat(response.data)
        }
      }

      const filtered = allOrders.filter(
        (order) =>
          order.customer_id === customerId || order.customer.id === customerId,
      )

      setCustomerOrders(filtered)
      setCustomerOrdersPage(1)
      setOrdersCustomerId(customerId)
      setCustomerOrdersStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar pedidos do cliente.'
      setCustomerOrdersError(message)
      setCustomerOrdersStatus('error')
    }
  }, [])

  const handleOpenOrdersModal = useCallback(() => {
    if (!selectedCustomer) return
    setIsOrdersOpen(true)

    if (ordersCustomerId !== selectedCustomer.id || customerOrders.length === 0) {
      fetchCustomerOrders(selectedCustomer.id)
    }
  }, [customerOrders.length, fetchCustomerOrders, ordersCustomerId, selectedCustomer])

  const selectedSegments = useMemo(() => {
    if (!selectedCustomer) return []
    return selectedCustomer.segments
  }, [selectedCustomer])

  const customerOrdersPerPage = 5
  const customerOrdersLastPage = Math.max(
    1,
    Math.ceil(customerOrders.length / customerOrdersPerPage),
  )

  const customerOrdersPageItems = useMemo(
    () => buildPageItems(customerOrdersPage, customerOrdersLastPage),
    [customerOrdersLastPage, customerOrdersPage],
  )

  const visibleCustomerOrders = useMemo(() => {
    const start = (customerOrdersPage - 1) * customerOrdersPerPage
    return customerOrders.slice(start, start + customerOrdersPerPage)
  }, [customerOrders, customerOrdersPage])

  return {
    customers,
    selectedCustomer,
    segments,
    status,
    detailStatus,
    error,
    page,
    pagination,
    customerSearch,
    setCustomerSearch,
    isOrdersOpen,
    setIsOrdersOpen,
    customerOrders,
    customerOrdersPage,
    setCustomerOrdersPage,
    customerOrdersStatus,
    customerOrdersError,
    isCreateOpen,
    setIsCreateOpen,
    createStatus,
    createError,
    customerForm,
    setCustomerForm,
    isEditOpen,
    setIsEditOpen,
    updateStatus,
    updateError,
    editForm,
    setEditForm,
    totals,
    pageItems,
    filteredCustomers,
    selectedSegments,
    customerOrdersPerPage,
    customerOrdersLastPage,
    customerOrdersPageItems,
    visibleCustomerOrders,
    fetchCustomers,
    handleSelectCustomer,
    handleGoToPage,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    handleOpenOrdersModal,
  }
}
