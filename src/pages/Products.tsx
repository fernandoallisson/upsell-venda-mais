import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Barcode,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  Image as ImageIcon,
  Package,
  Pencil,
  PlusCircle,
  RefreshCcw,
  Tag,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import DashboardPage from '../components/layout/DashboardPage'
import { ApiError } from '../lib/api'
import { getCategories } from '../lib/services/categories/categories.service'
import type { Category } from '../lib/services/categories/categories.types'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../lib/services/products/products.service'
import type {
  CreateProductPayload,
  Product,
  ProductsResponse,
  UpdateProductPayload,
} from '../lib/services/products/products.types'

const formatCurrency = (value: string, currency: string) => {
  const number = Number(value)
  if (Number.isNaN(number)) return value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(number)
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

type PaginationMeta = Pick<
  ProductsResponse,
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

const parseNumber = (value: string) => {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [detailStatus, setDetailStatus] = useState<
    'idle' | 'loading' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [categoryModal, setCategoryModal] = useState<Category | null>(null)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  const [filters, setFilters] = useState({
    name: '',
    category_id: '',
    price_min: '',
    price_max: '',
    created_from: '',
    created_to: '',
    status: 'all',
  })

  const [isFiltersOpen, setIsFiltersOpen] = useState(true)

  // ✅ mesmo mecanismo expandir/recolher: CRIAR
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [createStatus, setCreateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [createError, setCreateError] = useState<string | null>(null)
  const [productForm, setProductForm] = useState({
    category_id: '',
    external_id: '',
    sku: '',
    name: '',
    image_url: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    is_active: true,
  })

  // ✅ mesmo mecanismo expandir/recolher: EDITAR
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    category_id: '',
    external_id: '',
    sku: '',
    name: '',
    image_url: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    is_active: true,
  })

  const fetchProductDetails = useCallback(async (id: number) => {
    setDetailStatus('loading')
    try {
      const response = await getProductById(id)
      setSelectedProduct(response)
      setDetailStatus('idle')
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar detalhes do produto.'
      setError(message)
      setDetailStatus('error')
    }
  }, [])

  const fetchProducts = useCallback(
    async (targetPage = page) => {
      setStatus('loading')
      setError(null)

      try {
        const response = await getProducts(targetPage)

        setProducts(response.data)
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

        const firstProduct = response.data[0] ?? null
        setSelectedProduct(firstProduct)

        if (firstProduct) {
          fetchProductDetails(firstProduct.id)
        }

        setStatus('idle')
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Erro ao carregar produtos.'
        setError(message)
        setStatus('error')
      }
    },
    [fetchProductDetails, page],
  )

  const fetchCategories = useCallback(async () => {
    try {
      const response = await getCategories(1)
      setCategories(response.data)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Erro ao carregar categorias para produtos.'
      setError(message)
    }
  }, [])

  const handleOpenCategoryModal = useCallback(() => {
    if (!selectedProduct?.category_id) return

    const fullCategory = categories.find(
      (category) => category.id === selectedProduct.category_id,
    )

    if (fullCategory) {
      setCategoryModal(fullCategory)
      return
    }

    if (selectedProduct.category) {
      setCategoryModal(selectedProduct.category)
    }
  }, [categories, selectedProduct])

  const handleCloseCategoryModal = useCallback(() => {
    setCategoryModal(null)
  }, [])

  useEffect(() => {
    fetchProducts(1)
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedProduct) return
    setEditForm({
      category_id:
        selectedProduct.category_id === null
          ? ''
          : String(selectedProduct.category_id),
      external_id: selectedProduct.external_id ?? '',
      sku: selectedProduct.sku,
      name: selectedProduct.name,
      image_url: selectedProduct.image_url ?? '',
      price: selectedProduct.price,
      compare_at_price: selectedProduct.compare_at_price,
      cost_price: selectedProduct.cost_price,
      is_active: selectedProduct.is_active,
    })

    // ✅ opcional (mesmo padrão que usamos em categorias): ao selecionar um produto, abre o painel de edição
    setIsEditOpen(false)
  }, [selectedProduct])

  // ✅ ao recolher criar, limpa feedback
  useEffect(() => {
    if (isCreateOpen) return
    setCreateStatus('idle')
    setCreateError(null)
  }, [isCreateOpen])

  // ✅ ao recolher editar, limpa feedback
  useEffect(() => {
    if (isEditOpen) return
    setUpdateStatus('idle')
    setUpdateError(null)
  }, [isEditOpen])

  const totals = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        acc.count += 1
        if (product.is_active) acc.active += 1
        return acc
      },
      { count: 0, active: 0 },
    )
  }, [products])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    fetchProductDetails(product.id)
  }

  const handleGoToPage = (nextPage: number) => {
    if (!pagination) return
    if (nextPage < 1 || nextPage > pagination.last_page) return
    fetchProducts(nextPage)
  }

  const handleCreateProduct = async () => {
    setCreateStatus('loading')
    setCreateError(null)

    const payload: CreateProductPayload = {
      category_id: Number(productForm.category_id),
      external_id: productForm.external_id,
      sku: productForm.sku,
      name: productForm.name,
      image_url: productForm.image_url,
      price: parseNumber(productForm.price) ?? 0,
      compare_at_price: parseNumber(productForm.compare_at_price) ?? 0,
      cost_price: parseNumber(productForm.cost_price) ?? 0,
      is_active: productForm.is_active,
    }

    try {
      await createProduct(payload)
      setCreateStatus('success')
      setProductForm({
        category_id: '',
        external_id: '',
        sku: '',
        name: '',
        image_url: '',
        price: '',
        compare_at_price: '',
        cost_price: '',
        is_active: true,
      })

      // ✅ fecha após sucesso
      setIsCreateOpen(false)

      fetchProducts(1)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao criar produto.'
      setCreateError(message)
      setCreateStatus('error')
    }
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return

    setUpdateStatus('loading')
    setUpdateError(null)

    const payload: UpdateProductPayload = {
      category_id: Number(editForm.category_id),
      external_id: editForm.external_id,
      sku: editForm.sku,
      name: editForm.name,
      ...(editForm.image_url.trim() ? { image_url: editForm.image_url } : {}),
      price: parseNumber(editForm.price) ?? 0,
      compare_at_price: parseNumber(editForm.compare_at_price) ?? 0,
      cost_price: parseNumber(editForm.cost_price) ?? 0,
      is_active: editForm.is_active,
    }

    try {
      const updated = await updateProduct(selectedProduct.id, payload)
      setSelectedProduct(updated)
      setUpdateStatus('success')
      fetchProducts(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao atualizar produto.'
      setUpdateError(message)
      setUpdateStatus('error')
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    const confirmed = window.confirm(
      'Tem certeza que deseja remover este produto?',
    )
    if (!confirmed) return

    try {
      await deleteProduct(selectedProduct.id)
      setSelectedProduct(null)
      fetchProducts(page)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao remover produto.'
      setError(message)
    }
  }

  const pageItems = useMemo(() => {
    if (!pagination) return []
    return buildPageItems(pagination.current_page, pagination.last_page)
  }, [pagination])

  const filteredProducts = useMemo(() => {
    const nameQuery = filters.name.trim().toLowerCase()
    const categoryId = filters.category_id.trim()
    const minPrice = parseNumber(filters.price_min)
    const maxPrice = parseNumber(filters.price_max)
    const createdFrom = filters.created_from
      ? new Date(`${filters.created_from}T00:00:00`)
      : null
    const createdTo = filters.created_to
      ? new Date(`${filters.created_to}T23:59:59`)
      : null

    return products.filter((product) => {
      if (nameQuery && !product.name.toLowerCase().includes(nameQuery)) {
        return false
      }

      if (categoryId && String(product.category_id ?? '') !== categoryId) {
        return false
      }

      const priceValue = parseNumber(product.price) ?? 0
      if (minPrice !== null && priceValue < minPrice) return false
      if (maxPrice !== null && priceValue > maxPrice) return false

      if (createdFrom || createdTo) {
        const createdAt = new Date(product.created_at)
        if (createdFrom && createdAt < createdFrom) return false
        if (createdTo && createdAt > createdTo) return false
      }

      if (filters.status === 'active' && !product.is_active) return false
      if (filters.status === 'inactive' && product.is_active) return false

      return true
    })
  }, [filters, products])

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'status') return value !== 'all'
    return value.trim().length > 0
  })

  const handleClearFilters = () => {
    setFilters({
      name: '',
      category_id: '',
      price_min: '',
      price_max: '',
      created_from: '',
      created_to: '',
      status: 'all',
    })
  }

  const isFormValid = (
    form: typeof productForm | typeof editForm,
    requireImage = true,
  ): boolean => {
    const requiredFields =
      form.external_id.trim() &&
      form.sku.trim() &&
      form.name.trim() &&
      (!requireImage || form.image_url.trim()) &&
      form.category_id.trim()

    const priceValues = [
      parseNumber(form.price),
      parseNumber(form.compare_at_price),
      parseNumber(form.cost_price),
    ]

    return (
      Boolean(requiredFields) && priceValues.every((value) => value !== null)
    )
  }

  return (
    <DashboardPage
      title="Produtos"
      subtitle="Catálogo"
      containerClassName="max-w-6xl"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Produtos</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-semibold text-slate-900">
              {pagination?.total ?? totals.count}
            </p>
            <span className="text-sm text-slate-400">{totals.active} ativos</span>
            <span className="text-sm text-slate-400">
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
          onClick={() => fetchProducts(page)}
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
          <p className="font-semibold">Não foi possível carregar os produtos.</p>
          <p className="text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchProducts(page)}
            className="mt-4 inline-flex items-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'idle' && products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          <p className="font-semibold">Nenhum produto encontrado.</p>
          <p className="text-sm text-slate-500">
            Assim que houver produtos, eles aparecerão aqui.
          </p>
        </div>
      ) : null}

      {status === 'idle' && products.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <Filter className="h-4 w-4 text-indigo-500" />
                  Filtros
                  {isFiltersOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFiltersOpen((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-600"
                  >
                    {isFiltersOpen ? 'Recolher' : 'Expandir'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                    className="text-xs font-semibold text-indigo-600 disabled:text-slate-300"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>

              {isFiltersOpen ? (
                <div className="mt-4 grid gap-4">
                <label className="space-y-2 text-sm text-slate-600">
                  <span>Nome do produto</span>
                  <input
                    value={filters.name}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    placeholder="Buscar pelo nome"
                  />
                </label>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Categoria</span>
                  <select
                    value={filters.category_id}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        category_id: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                  >
                    <option value="">Todas</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-600">
                    <span>Preço mínimo</span>
                    <input
                      type="number"
                      step="0.01"
                      value={filters.price_min}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          price_min: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      placeholder="0,00"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-600">
                    <span>Preço máximo</span>
                    <input
                      type="number"
                      step="0.01"
                      value={filters.price_max}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          price_max: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      placeholder="9999,00"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-600">
                    <span>Criado a partir de</span>
                    <input
                      type="date"
                      value={filters.created_from}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          created_from: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-slate-600">
                    <span>Criado até</span>
                    <input
                      type="date"
                      value={filters.created_to}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          created_to: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm text-slate-600">
                  <span>Status</span>
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                </label>

                <p className="text-xs text-slate-500">
                  Exibindo {filteredProducts.length} de {products.length} itens na
                  página atual.
                </p>
              </div>
              ) : null}
            </section>

            {/* ✅ Criar com expandir/recolher */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <button
                type="button"
                onClick={() => setIsCreateOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PlusCircle className="h-4 w-4 text-indigo-500" />
                  Novo produto
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {isCreateOpen ? 'Recolher' : 'Expandir'}
                </span>
              </button>

              {isCreateOpen ? (
                <>
                  <div className="mt-4 grid gap-4">
                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Categoria</span>
                      <select
                        value={productForm.category_id}
                        onChange={(event) =>
                          setProductForm((prev) => ({
                            ...prev,
                            category_id: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                      >
                        <option value="">Selecione</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>Nome do produto</span>
                      <input
                        value={productForm.name}
                        onChange={(event) =>
                          setProductForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="Smartphone X Pro"
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-600">
                      <span>External ID</span>
                      <input
                        value={productForm.external_id}
                        onChange={(event) =>
                          setProductForm((prev) => ({
                            ...prev,
                            external_id: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        placeholder="prod-000001"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>SKU</span>
                        <input
                          value={productForm.sku}
                          onChange={(event) =>
                            setProductForm((prev) => ({
                              ...prev,
                              sku: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="SMART-001"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Imagem</span>
                        <input
                          value={productForm.image_url}
                          onChange={(event) =>
                            setProductForm((prev) => ({
                              ...prev,
                              image_url: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="https://..."
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Preço</span>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(event) =>
                            setProductForm((prev) => ({
                              ...prev,
                              price: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="2999.90"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Preço comparativo</span>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.compare_at_price}
                          onChange={(event) =>
                            setProductForm((prev) => ({
                              ...prev,
                              compare_at_price: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="3499.90"
                        />
                      </label>
                      <label className="space-y-2 text-sm text-slate-600">
                        <span>Custo</span>
                        <input
                          type="number"
                          step="0.01"
                          value={productForm.cost_price}
                          onChange={(event) =>
                            setProductForm((prev) => ({
                              ...prev,
                              cost_price: event.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          placeholder="2000.00"
                        />
                      </label>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={productForm.is_active}
                        onChange={(event) =>
                          setProductForm((prev) => ({
                            ...prev,
                            is_active: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                      />
                      Produto ativo
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCreateProduct}
                      disabled={
                        !isFormValid(productForm) || createStatus === 'loading'
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Package className="h-4 w-4" />
                      Criar produto
                    </button>

                    {createStatus === 'success' ? (
                      <span className="text-xs font-semibold text-emerald-600">
                        Produto criado!
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
                <Package className="h-4 w-4 text-indigo-500" />
                Lista de produtos
              </div>

              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const isActive = selectedProduct?.id === product.id
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelectProduct(product)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-indigo-200 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.category?.name ?? 'Sem categoria'}
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
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>SKU {product.sku}</span>
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(product.price, 'BRL')}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Nenhum produto encontrado com os filtros aplicados.
                </div>
              ) : null}

              {pagination && filteredProducts.length > 0 ? (
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
                  {selectedProduct?.external_id ?? 'Selecione um produto'}
                </p>
              </div>
              {detailStatus === 'loading' ? (
                <span className="text-xs text-slate-400">Atualizando...</span>
              ) : null}
            </div>

            {selectedProduct ? (
              <div className="mt-6 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {selectedProduct.image_url ? (
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {selectedProduct.name}
                      </p>
                      {selectedProduct.category ? (
                        <button
                          type="button"
                          onClick={handleOpenCategoryModal}
                          className="text-xs font-medium text-indigo-600 transition hover:text-indigo-500"
                        >
                          {selectedProduct.category.name}
                        </button>
                      ) : (
                        <p className="text-xs text-slate-500">Sem categoria</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Barcode className="h-3.5 w-3.5 text-indigo-500" />
                          {selectedProduct.sku}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-indigo-500" />
                          {selectedProduct.external_id}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedProduct.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {selectedProduct.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Preços
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-indigo-500" />
                        {formatCurrency(selectedProduct.price, 'BRL')}
                      </div>
                      <div className="text-xs text-slate-500">
                        Comparativo:{' '}
                        {formatCurrency(selectedProduct.compare_at_price, 'BRL')}
                      </div>
                      <div className="text-xs text-slate-500">
                        Custo:{' '}
                        {formatCurrency(selectedProduct.cost_price, 'BRL')}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Status
                    </p>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Criado em {formatDate(selectedProduct.created_at)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        Atualizado em {formatDate(selectedProduct.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ Editar com expandir/recolher */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Pencil className="h-4 w-4 text-indigo-500" />
                      Editar produto
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">
                      {isEditOpen ? 'Recolher' : 'Expandir'}
                    </span>
                  </button>

                  {isEditOpen ? (
                    <>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2 text-sm text-slate-600">
                          <span>Categoria</span>
                          <select
                            value={editForm.category_id}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                category_id: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                          >
                            <option value="">Selecione</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Nome do produto</span>
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

                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>SKU</span>
                            <input
                              value={editForm.sku}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  sku: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Imagem</span>
                            <input
                              value={editForm.image_url}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  image_url: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Preço</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  price: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Preço comparativo</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.compare_at_price}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  compare_at_price: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-slate-600">
                            <span>Custo</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.cost_price}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  cost_price: event.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                            />
                          </label>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(event) =>
                              setEditForm((prev) => ({
                                ...prev,
                                is_active: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                          />
                          Produto ativo
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleUpdateProduct}
                          disabled={
                            !isFormValid(editForm, false) || updateStatus === 'loading'
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil className="h-4 w-4" />
                          Salvar alterações
                        </button>

                        {updateStatus === 'success' ? (
                          <span className="text-xs font-semibold text-emerald-600">
                            Produto atualizado!
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
                    Remover produto
                  </div>
                  <p className="mt-2 text-xs text-rose-600">
                    Esta ação é irreversível e remove o produto do catálogo.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteProduct}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir produto
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Selecione um produto para ver os detalhes.
              </div>
            )}
          </section>

          {categoryModal ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
              role="presentation"
              onClick={handleCloseCategoryModal}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-modal-title"
                className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      Categoria
                    </p>
                    <h3
                      id="category-modal-title"
                      className="mt-1 text-lg font-semibold text-slate-900"
                    >
                      {categoryModal.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseCategoryModal}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Fechar
                  </button>
                </div>

                <dl className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-400">ID</dt>
                    <dd className="mt-1 font-medium text-slate-900">{categoryModal.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-400">
                      ID externo
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {categoryModal.external_id ?? 'Não informado'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-400">
                      Criada em
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {formatDate(categoryModal.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase text-slate-400">
                      Atualizada em
                    </dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {formatDate(categoryModal.updated_at)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardPage>
  )
}

export default Products
