import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  Pencil,
  PlusCircle,
  RefreshCcw,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import WorkspaceTabs from '../components/layout/WorkspaceTabs'
import { ApiError, invalidateApiCache } from '../lib/api'
import { API_CACHE_TAGS } from '../lib/services/cacheTags'
import {
  createUser,
  deleteUserById,
  getUserById,
  getUsers,
  updateUserById,
} from '../lib/services/users/users.service'
import {
  getAllPermissions,
  getUserPermissions,
  syncUserPermissionsBySlugs,
} from '../lib/services/permissions/permissions.service'
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserListItem,
  UsersResponse,
} from '../lib/services/users/users.types'
import type {
  Permission,
} from '../lib/services/permissions/permissions.types'
import { PermissionsSection } from '../features/users/components/PermissionsSection'
import { COMPACT_PAGE_SIZE, loadCompactPage } from '../lib/utils/compactPagination'

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

type PaginationMeta = Pick<
  UsersResponse,
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

const Users = () => {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [serverPageSize, setServerPageSize] = useState(COMPACT_PAGE_SIZE)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [userForm, setUserForm] = useState<CreateUserPayload>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [createPermissionSlugs, setCreatePermissionSlugs] = useState<string[]>([])

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [workspaceView, setWorkspaceView] = useState<'list' | 'details' | 'create'>('list')
  const [detailView, setDetailView] = useState<'summary' | 'edit' | 'permissions' | 'actions'>('summary')
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [allPermissions, setAllPermissions] = useState<Record<string, Permission[]>>({})
  const [permCategories, setPermCategories] = useState<string[]>([])
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  const [userPermissionSlugs, setUserPermissionSlugs] = useState<string[]>([])
  const [permSyncStatus, setPermSyncStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [permSyncError, setPermSyncError] = useState<string | null>(null)

  const loadAllPermissions = useCallback(async () => {
    if (permissionsLoaded) return
    try {
      const res = await getAllPermissions()
      setAllPermissions(res.permissions)
      setPermCategories(res.categories)
      setPermissionsLoaded(true)
    } catch {
      return
    }
  }, [permissionsLoaded])

  const fetchUserDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    setPermSyncStatus('idle')
    setPermSyncError(null)
    try {
      const [userRes, permRes] = await Promise.all([
        getUserById(id),
        getUserPermissions(id).catch(() => null),
      ])
      setSelectedUser(userRes)
      setUserPermissionSlugs(
        permRes?.permissions?.map((p) => p.slug) ?? [],
      )
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do usuário.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchUsers = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await loadCompactPage<UserListItem, UsersResponse>(
          getUsers,
          targetPage,
          serverPageSize,
        )

        setUsers(response.data)
        setPagination(response.pagination)
        setServerPageSize(response.serverPageSize)
        setPage(response.pagination.current_page)

        const firstUser = response.data[0] ?? null
        setSelectedUserId(firstUser?.id ?? null)
        setSelectedUser(null)

        if (firstUser) {
          fetchUserDetails(firstUser.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar usuários.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchUserDetails, page, serverPageSize],
  )

  useEffect(() => {
    fetchUsers(1)
    loadAllPermissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedUser) return
    setEditForm({
      name: selectedUser.name,
      email: selectedUser.email,
      password: '',
      password_confirmation: '',
    })
    setIsEditOpen(false)
  }, [selectedUser])

  useEffect(() => {
    if (isCreateOpen) {
      loadAllPermissions()
      return
    }
    setCreateStatus('idle')
    setCreateError(null)
    setCreatePermissionSlugs([])
  }, [isCreateOpen, loadAllPermissions])

  useEffect(() => {
    if (isEditOpen) return
    setUpdateStatus('idle')
    setUpdateError(null)
  }, [isEditOpen])

  const totals = useMemo(() => {
    return users.reduce(
      (acc) => {
        acc.count += 1
        return acc
      },
      { count: 0 },
    )
  }, [users])

  const isCreateValid =
    userForm.name.trim().length > 0 &&
    userForm.email.trim().length > 0 &&
    userForm.password.length > 0 &&
    userForm.password_confirmation.length > 0 &&
    userForm.password === userForm.password_confirmation

  const isUpdateValid = (() => {
    if (editForm.name.trim().length === 0 || editForm.email.trim().length === 0)
      return false
    const passwordFilled =
      editForm.password.length > 0 || editForm.password_confirmation.length > 0
    if (!passwordFilled) return true
    return editForm.password === editForm.password_confirmation
  })()

  const handleSelectUser = (user: UserListItem) => {
    setSelectedUserId(user.id)
    setWorkspaceView('details')
    setDetailView('summary')
    fetchUserDetails(user.id)
  }

  const handleGoToPage = (target: number) => {
    if (target < 1) return
    if (pagination && target > pagination.last_page) return
    fetchUsers(target)
  }

  const handleCreateUser = async () => {
    if (!isCreateValid) return
    setCreateStatus('loading')
    setCreateError(null)

    try {
      const newUser = await createUser(userForm)

      if (createPermissionSlugs.length > 0) {
        await syncUserPermissionsBySlugs(newUser.id, {
          permissions: createPermissionSlugs,
        }).catch(() => null)
      }

      setCreateStatus('success')
      setUserForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      })
      setCreatePermissionSlugs([])
      fetchUsers(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar usuário.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUserId || !isUpdateValid) return
    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: UpdateUserPayload = {
      name: editForm.name,
      email: editForm.email,
    }

    if (editForm.password || editForm.password_confirmation) {
      payload.password = editForm.password
      payload.password_confirmation = editForm.password_confirmation
    }

    try {
      const response = await updateUserById(selectedUserId, payload)
      setSelectedUser(response)
      setUpdateStatus('success')
      fetchUsers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar usuário.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const handleSyncPermissions = async () => {
    if (!selectedUserId) return
    setPermSyncStatus('loading')
    setPermSyncError(null)

    try {
      const res = await syncUserPermissionsBySlugs(selectedUserId, {
        permissions: userPermissionSlugs,
      })
      setUserPermissionSlugs(res.permissions?.map((p) => p.slug) ?? userPermissionSlugs)
      setPermSyncStatus('success')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar permissões.'
      setPermSyncError(message)
      setPermSyncStatus('error')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUserId) return

    try {
      await deleteUserById(selectedUserId)
      fetchUsers(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover usuário.'
      setError(message)
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  return (
    <DashboardPage
      title="Usuários"
      subtitle="Administração"
      containerClassName="viewport-workspace crud-workspace max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Usuários</p>
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
          {pagination ? (
            <p className="mt-1 text-xs text-slate-400">
              Mostrando {pagination.from ?? 0}–{pagination.to ?? 0} de{' '}
              {pagination.total}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            invalidateApiCache([API_CACHE_TAGS.users, API_CACHE_TAGS.permissions])
            fetchUsers(page)
          }}
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
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold">Não foi possível carregar usuários.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchUsers(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && users.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhum usuário encontrado.</p>
          <p className="text-sm text-slate-500">
            Assim que houver usuários, eles aparecerão aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && users.length > 0 ? (
        <>
        <WorkspaceTabs
          value={workspaceView}
          tabs={[
            { value: 'list', label: 'Lista' },
            { value: 'details', label: 'Detalhes', disabled: !selectedUser },
            { value: 'create', label: 'Novo' },
          ]}
          onChange={(next) => {
            setWorkspaceView(next)
            if (next === 'create') setIsCreateOpen(true)
          }}
        />
        <div className="desktop-workspace-columns grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="desktop-workspace-stack space-y-6">
            <section className={`desktop-workspace-panel ${workspaceView === 'create' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PlusCircle className="h-4 w-4 text-sky-500" />
                  Novo usuário
                </div>
                <span className="text-xs font-semibold text-sky-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Nome</span>
                      <input
                        value={userForm.name}
                        onChange={(event) =>
                          setUserForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                        placeholder="Ex: João Silva"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>E-mail</span>
                      <input
                        value={userForm.email}
                        onChange={(event) =>
                          setUserForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                        placeholder="joao@empresa.com"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Senha</span>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(event) =>
                          setUserForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                        placeholder="Senha forte"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Confirmar senha</span>
                      <input
                        type="password"
                        value={userForm.password_confirmation}
                        onChange={(event) =>
                          setUserForm((prev) => ({
                            ...prev,
                            password_confirmation: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                        placeholder="Repita a senha"
                      />
                    </label>

                    {permissionsLoaded && (
                      <PermissionsSection
                        title="Permissões"
                        allPermissions={allPermissions}
                        categories={permCategories}
                        selectedSlugs={createPermissionSlugs}
                        onChange={setCreatePermissionSlugs}
                        defaultOpen={false}
                        showSelectAll={true}
                      />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateUser}
                      disabled={!isCreateValid || createStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <UserIcon className="h-4 w-4" />
                      Criar usuário
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Usuário criado!
                      </span>
                    ) : null}

                    {createStatus === 'error' ? (
                      <span className="text-xs font-semibold text-rose-600">
                        {createError}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </section>

            <section className={`workspace-list-panel desktop-workspace-panel ${workspaceView === 'list' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-4 shadow-sm`}>
              <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
                <UserIcon className="h-4 w-4 text-sky-500" />
                Lista de usuários
              </div>

              <div className="workspace-list-items space-y-3">
                {users.slice(0, 5).map((user) => {
                  const isActive = selectedUserId === user.id
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className={`workspace-list-row w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-sky-200 bg-sky-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          ID {user.id}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Criado em {formatDate(user.created_at)}</span>
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
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
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

          <section className={`desktop-workspace-panel ${workspaceView === 'details' ? 'is-active' : ''} rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Detalhes</p>
                <p className="text-xs text-slate-500">
                  {selectedUser?.email ?? 'Selecione um usuário'}
                </p>
              </div>
              {detailStatus === 'loading' ? (
                <span className="text-xs text-slate-400">Atualizando...</span>
              ) : null}
            </div>

            {selectedUser ? (
              <>
              <WorkspaceTabs
                value={detailView}
                onChange={setDetailView}
                tabs={[
                  { value: 'summary', label: 'Resumo' },
                  { value: 'edit', label: 'Editar' },
                  { value: 'permissions', label: 'Permissoes' },
                  { value: 'actions', label: 'Ações' },
                ]}
              />
              <div className="mt-4 space-y-4">
                <div className={`desktop-workspace-panel ${detailView === 'summary' ? 'is-active' : ''} grid gap-4 md:grid-cols-2`}>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Identificação
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-sky-500" />
                        {selectedUser.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-sky-500" />
                        {selectedUser.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-sky-500" />
                        Criado em {formatDate(selectedUser.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Atualização
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-sky-500" />
                        Atualizado em {formatDate(selectedUser.updated_at)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Tenant: {selectedUser.tenant_id ?? '—'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`desktop-workspace-panel ${detailView === 'edit' ? 'is-active' : ''} rounded-xl border border-slate-200 p-4`}>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4 text-sky-500" />
                      Editar usuário
                    </div>
                    <span className="text-xs font-semibold text-sky-600">
                      {isEditOpen ? 'Recolher' : 'Expandir'}
                    </span>
                  </button>

                  {isEditOpen ? (
                    <>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Nome</span>
                          <input
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                name: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>E-mail</span>
                          <input
                            value={editForm.email}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                email: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Nova senha (opcional)</span>
                          <input
                            type="password"
                            value={editForm.password}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                password: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Confirmar senha</span>
                          <input
                            type="password"
                            value={editForm.password_confirmation}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                password_confirmation: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-300"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUpdateUser}
                          disabled={!isUpdateValid || updateStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Usuário atualizado!
                          </span>
                        ) : null}

                        {updateStatus === 'error' ? (
                          <span className="text-xs font-semibold text-rose-600">
                            {updateError}
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>

                {permissionsLoaded && (
                  <div className={`desktop-workspace-panel ${detailView === 'permissions' ? 'is-active' : ''}`}>
                  <PermissionsSection
                    title="Permissões do usuário"
                    allPermissions={allPermissions}
                    categories={permCategories}
                    selectedSlugs={userPermissionSlugs}
                    onChange={setUserPermissionSlugs}
                    defaultOpen={false}
                    showSelectAll={false}
                    onSave={handleSyncPermissions}
                    saveLabel="Salvar permissões"
                    saveDisabled={permSyncStatus === 'loading'}
                    status={permSyncStatus}
                    statusMessage={permSyncError}
                  />
                  </div>
                )}

                <div className={`desktop-workspace-panel ${detailView === 'actions' ? 'is-active' : ''} rounded-xl border border-rose-200 bg-rose-50 p-4`}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    Remover usuário
                  </div>
                  <p className="mt-2 text-xs text-rose-600">
                    Esta ação é irreversível e remove o usuário do sistema.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir usuário
                  </button>
                </div>
              </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione um usuário para ver os detalhes.
              </div>
            )}
          </section>
        </div>
        </>
      ) : null}
    </DashboardPage>
  )
}

export default Users
