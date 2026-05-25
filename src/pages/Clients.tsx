import { useState } from 'react'
import DashboardPage from '../components/layout/DashboardPage'
import WorkspaceTabs from '../components/layout/WorkspaceTabs'
import CustomerCreateSection from '../features/customers/components/CustomerCreateSection'
import CustomerDetailsSection from '../features/customers/components/CustomerDetailsSection'
import CustomersListSection from '../features/customers/components/CustomersListSection'
import CustomersStatsHeader from '../features/customers/components/CustomersStatsHeader'
import OrdersModal from '../features/customers/components/OrdersModal'
import { useCustomersPage } from '../features/customers/hooks/useCustomersPage'

const Clients = () => {
  const [workspaceView, setWorkspaceView] = useState<'list' | 'details' | 'create'>('list')
  const {
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
  } = useCustomersPage()

  return (
    <DashboardPage title="Clientes" subtitle="CRM" containerClassName="viewport-workspace crud-workspace max-w-6xl">
      <CustomersStatsHeader
        pagination={pagination}
        totals={totals}
        page={page}
        onRefresh={() => fetchCustomers(page)}
      />

      {status === 'loading' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Não foi possível carregar os clientes.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchCustomers(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' ? (
        <>
        <WorkspaceTabs
          value={workspaceView}
          tabs={[
            { value: 'list', label: 'Lista' },
            { value: 'details', label: 'Detalhes', disabled: !selectedCustomer },
            { value: 'create', label: 'Novo' },
          ]}
          onChange={(next) => {
            setWorkspaceView(next)
            if (next === 'create') setIsCreateOpen(true)
          }}
        />
        <div className="desktop-workspace-columns grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="desktop-workspace-stack space-y-6">
            <div className={`desktop-workspace-panel ${workspaceView === 'create' ? 'is-active' : ''}`}>
            <CustomerCreateSection
              isCreateOpen={isCreateOpen}
              setIsCreateOpen={setIsCreateOpen}
              customerForm={customerForm}
              setCustomerForm={setCustomerForm}
              createStatus={createStatus}
              createError={createError}
              onCreateCustomer={handleCreateCustomer}
              segments={segments}
            />
            </div>

            <div className={`desktop-workspace-panel ${workspaceView === 'list' ? 'is-active' : ''}`}>
            <CustomersListSection
              customerSearch={customerSearch}
              onSearchChange={setCustomerSearch}
              filteredCustomers={filteredCustomers}
              customersCount={customers.length}
              selectedCustomerId={selectedCustomer?.id}
              onSelectCustomer={(customer) => {
                handleSelectCustomer(customer)
                setWorkspaceView('details')
              }}
              pagination={pagination}
              pageItems={pageItems}
              onGoToPage={handleGoToPage}
            />
            </div>
          </div>

          <div className={`desktop-workspace-panel ${workspaceView === 'details' ? 'is-active' : ''} space-y-6`}>
            <CustomerDetailsSection
              detailStatus={detailStatus}
              selectedCustomer={selectedCustomer}
              selectedSegments={selectedSegments}
              onOpenOrdersModal={handleOpenOrdersModal}
              isEditOpen={isEditOpen}
              setIsEditOpen={setIsEditOpen}
              editForm={editForm}
              setEditForm={setEditForm}
              updateStatus={updateStatus}
              updateError={updateError}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              segments={segments}
            />
          </div>
        </div>
        </>
      ) : null}

      <OrdersModal
        isOpen={isOrdersOpen}
        customerName={selectedCustomer?.first_name}
        customerOrders={customerOrders}
        customerOrdersStatus={customerOrdersStatus}
        customerOrdersError={customerOrdersError}
        visibleCustomerOrders={visibleCustomerOrders}
        customerOrdersPage={customerOrdersPage}
        setCustomerOrdersPage={setCustomerOrdersPage}
        customerOrdersPerPage={customerOrdersPerPage}
        customerOrdersLastPage={customerOrdersLastPage}
        customerOrdersPageItems={customerOrdersPageItems}
        onClose={() => setIsOrdersOpen(false)}
      />
    </DashboardPage>
  )
}

export default Clients
