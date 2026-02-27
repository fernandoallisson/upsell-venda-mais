import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Layers,
  Package,
  Pencil,
  PlusCircle,
  RefreshCcw,
  Tag,
  Trash2,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from '../lib/services/categories/categories.service'
import type {
  CategoriesResponse,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../lib/services/categories/categories.types'
import { getProducts } from '../lib/services/products/products.service'
import type { Product } from '../lib/services/products/products.types'

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

const formatCurrency = (value: string, currency: string) => {
  const number = Number(value)
  if (Number.isNaN(number)) return value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(number)
}

type PaginationMeta = Pick<
  CategoriesResponse,
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

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])
  const [categoryProductsPage, setCategoryProductsPage] = useState(1)
  const [categoryProductsStatus, setCategoryProductsStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [categoryProductsError, setCategoryProductsError] = useState<
    string | null
  >(null)
  const [categoryProductsCategoryId, setCategoryProductsCategoryId] = useState<
    number | null
  >(null)

  // ✅ painel expandir/recolher (criar)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    external_id: '',
  })

  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    external_id: '',
  })

  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchCategoryDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getCategoryById(id)
      setSelectedCategory(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes da categoria.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchCategories = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getCategories(targetPage)

        setCategories(response.data)
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

        const firstCategory = response.data[0] ?? null
        setSelectedCategory(firstCategory)

        if (firstCategory) {
          fetchCategoryDetails(firstCategory.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Erro ao carregar categorias.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchCategoryDetails, page],
  )

  useEffect(() => {
    fetchCategories(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    setEditForm({
      name: selectedCategory.name,
      external_id: selectedCategory.external_id ?? '',
    })

    setIsEditOpen(false)
    setIsProductsOpen(false)
    setCategoryProducts([])
    setCategoryProductsPage(1)
    setCategoryProductsStatus('idle')
    setCategoryProductsError(null)
    setCategoryProductsCategoryId(null)
  }, [selectedCategory])

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

  const totals = useMemo(() => {
    return categories.reduce(
      (acc) => {
        acc.count += 1
        return acc
      },
      { count: 0 },
    )
  }, [categories])

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category)
    fetchCategoryDetails(category.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchCategories(nextPage)
  }

  const fetchCategoryProducts = useCallback(async (categoryId: number) => {
    setCategoryProductsStatus('loading')
    setCategoryProductsError(null)

    try {
      const firstPage = await getProducts(1)
      let allProducts = [...firstPage.data]

      if (firstPage.last_page > 1) {
        for (let current = 2; current <= firstPage.last_page; current += 1) {
          const response = await getProducts(current)
          allProducts = allProducts.concat(response.data)
        }
      }

      const filtered = allProducts.filter(
        (product) => product.category_id === categoryId,
      )

      setCategoryProducts(filtered)
      setCategoryProductsPage(1)
      setCategoryProductsCategoryId(categoryId)
      setCategoryProductsStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar produtos da categoria.'
      setCategoryProductsError(message)
      setCategoryProductsStatus('error')
    }
  }, [])

  const handleOpenCategoryProducts = () => {
    if (!selectedCategory) return
    setIsProductsOpen(true)

    if (
      categoryProductsCategoryId !== selectedCategory.id ||
      categoryProducts.length === 0
    ) {
      fetchCategoryProducts(selectedCategory.id)
    }
  }

  const handleCreateCategory = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload: CreateCategoryPayload = {
      name: categoryForm.name,
      external_id: categoryForm.external_id,
    }

    try {
      await createCategory(payload)
      setCreateStatus('success')
      setCategoryForm({ name: '', external_id: '' })

      // ✅ fecha após sucesso
      setIsCreateOpen(false)

      fetchCategories(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar categoria.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: UpdateCategoryPayload = {
      name: editForm.name,
      external_id: editForm.external_id,
    }

    try {
      const updated = await updateCategory(selectedCategory.id, payload)
      setSelectedCategory(updated)
      setUpdateStatus('success')
      fetchCategories(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar categoria.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return

    const confirmed = window.confirm(
      'Tem certeza que deseja remover esta categoria?',
    )
    if (!confirmed) return

    try {
      await deleteCategory(selectedCategory.id)
      setSelectedCategory(null)
      fetchCategories(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover categoria.'
      setError(message)
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const categoryProductsPerPage = 6
  const categoryProductsLastPage = Math.max(
    1,
    Math.ceil(categoryProducts.length / categoryProductsPerPage),
  )

  const categoryProductsPageItems = useMemo(
    () => buildPageItems(categoryProductsPage, categoryProductsLastPage),
    [categoryProductsLastPage, categoryProductsPage],
  )

  const visibleCategoryProducts = useMemo(() => {
    const start = (categoryProductsPage - 1) * categoryProductsPerPage
    return categoryProducts.slice(start, start + categoryProductsPerPage)
  }, [categoryProducts, categoryProductsPage, categoryProductsPerPage])

  const isCreateValid =
    categoryForm.name.trim().length > 0 &&
    categoryForm.external_id.trim().length > 0

  const isUpdateValid =
    editForm.name.trim().length > 0 && editForm.external_id.trim().length > 0

  return (
    <DashboardPage
      title="Categorias"
      subtitle="Catálogo"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Categorias</p>
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
          onClick={() => fetchCategories(page)}
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
          <p className="font-semibold">Não foi possível carregar as categorias.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchCategories(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-6">
            {/* Criar (expandir/recolher) */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PlusCircle className="h-4 w-4 text-indigo-500" />
                  Nova categoria
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Nome</span>
                      <input
                        value={categoryForm.name}
                        onChange={(event) =>
                          setCategoryForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="Ex: Eletrônicos"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>External ID</span>
                      <input
                        value={categoryForm.external_id}
                        onChange={(event) =>
                          setCategoryForm((prev) => ({
                            ...prev,
                            external_id: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="cat-eletronicos-001"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={!isCreateValid || createStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Tag className="h-4 w-4" />
                      Criar categoria
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Categoria criada!
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

            {/* Lista */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 px-2 pb-3 text-sm font-semibold text-slate-700">
                <Layers className="h-4 w-4 text-indigo-500" />
                Lista de categorias
              </div>

              <div className="space-y-3">
                {categories.map((category) => {
                  const isActive = selectedCategory?.id === category.id
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {category.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {category.external_id}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          ID {category.id}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Criado em {formatDate(category.created_at)}</span>
                        <span>
                          Atualizado em {formatDate(category.updated_at)}
                        </span>
                      </div>
                    </button>
                  )
                })}

                {categories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    Nenhuma categoria encontrada ainda. Você já pode criar a
                    primeira categoria acima.
                  </div>
                ) : null}
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

          {/* Detalhes */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Detalhes</p>
                <p className="text-xs text-slate-500">
                  {selectedCategory?.external_id ?? 'Selecione uma categoria'}
                </p>
              </div>
              {detailStatus === 'loading' ? (
                <span className="text-xs text-slate-400">Atualizando...</span>
              ) : null}
            </div>

            {selectedCategory ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Identificação
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-500" />
                        {selectedCategory.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-500" />
                        {selectedCategory.external_id}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Criado em {formatDate(selectedCategory.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Atualização
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Atualizado em {formatDate(selectedCategory.updated_at)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Tenant: {selectedCategory.tenant_id}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Produtos da categoria
                      </p>
                      <p className="text-xs text-slate-500">
                        Veja todos os itens vinculados a esta categoria.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenCategoryProducts}
                      className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:border-indigo-300"
                    >
                      <Package className="h-4 w-4" />
                      Ver produtos
                    </button>
                  </div>
                </div>

                {/* ✅ Editar agora também é expansível */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4 text-indigo-500" />
                      Editar categoria
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

                        <label className="space-y-2 text-sm text-slate-600">
                          <span>External ID</span>
                          <input
                            value={editForm.external_id}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                external_id: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUpdateCategory}
                          disabled={!isUpdateValid || updateStatus === 'loading'}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Categoria atualizada!
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

                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <Trash2 className="h-4 w-4" />
                    Remover categoria
                  </div>
                  <p className="mt-2 text-xs text-rose-600">
                    Esta ação é irreversível e remove a categoria do catálogo.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir categoria
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione uma categoria para ver os detalhes.
              </div>
            )}
          </section>
        </div>
      ) : null}

      {isProductsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Produtos de {selectedCategory?.name ?? 'categoria'}
                </p>
                <p className="text-xs text-slate-500">
                  {categoryProducts.length} itens encontrados
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductsOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {categoryProductsStatus === 'loading' ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`loading-${index}`}
                      className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"
                    />
                  ))}
                </div>
              ) : null}

              {categoryProductsStatus === 'error' ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <p className="font-semibold">Erro ao carregar produtos.</p>
                  <p className="text-xs text-rose-600">
                    {categoryProductsError}
                  </p>
                </div>
              ) : null}

              {categoryProductsStatus === 'idle' &&
              categoryProducts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Nenhum produto encontrado para esta categoria.
                </div>
              ) : null}

              {categoryProductsStatus === 'idle' &&
              categoryProducts.length > 0 ? (
                <div className="space-y-3">
                  {visibleCategoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          SKU {product.sku} ·{' '}
                          {formatCurrency(product.price, 'BRL')}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.is_active
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {categoryProductsStatus === 'idle' &&
            categoryProducts.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Mostrando{' '}
                  <span className="font-semibold text-slate-700">
                    {(categoryProductsPage - 1) * categoryProductsPerPage + 1}
                  </span>{' '}
                  –
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      categoryProductsPage * categoryProductsPerPage,
                      categoryProducts.length,
                    )}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-slate-700">
                    {categoryProducts.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={categoryProductsPage === 1}
                    onClick={() =>
                      setCategoryProductsPage((prev) => Math.max(1, prev - 1))
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>

                  <div className="mx-1 flex items-center gap-1">
                    {categoryProductsPageItems.map((item, idx) =>
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
                          onClick={() => setCategoryProductsPage(item)}
                          className={`min-w-9 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            item === categoryProductsPage
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
                    disabled={categoryProductsPage === categoryProductsLastPage}
                    onClick={() =>
                      setCategoryProductsPage((prev) =>
                        Math.min(categoryProductsLastPage, prev + 1),
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default Categories
