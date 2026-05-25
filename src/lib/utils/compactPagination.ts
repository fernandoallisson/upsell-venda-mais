export const COMPACT_PAGE_SIZE = 5

type PaginatedData<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

type CompactPaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
  next_page_url: string | null
  prev_page_url: string | null
}

type PageLoader<T, TResponse extends PaginatedData<T>> = (options: {
  page: number
  perPage: number
}) => Promise<TResponse>

export const loadCompactPage = async <T, TResponse extends PaginatedData<T>>(
  loader: PageLoader<T, TResponse>,
  page: number,
  knownServerPageSize = COMPACT_PAGE_SIZE,
) => {
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * COMPACT_PAGE_SIZE
  const expectedPageSize = Math.max(COMPACT_PAGE_SIZE, knownServerPageSize)
  let serverPage = Math.floor(start / expectedPageSize) + 1
  let response = await loader({ page: serverPage, perPage: COMPACT_PAGE_SIZE })
  const serverPageSize = Math.max(
    COMPACT_PAGE_SIZE,
    response.per_page || response.data.length || COMPACT_PAGE_SIZE,
  )
  const requiredServerPage = Math.floor(start / serverPageSize) + 1

  if (requiredServerPage !== serverPage) {
    serverPage = requiredServerPage
    response = await loader({ page: serverPage, perPage: COMPACT_PAGE_SIZE })
  }

  const lastPage = Math.max(1, Math.ceil(response.total / COMPACT_PAGE_SIZE))
  const currentPage = Math.min(safePage, lastPage)
  const currentStart = (currentPage - 1) * COMPACT_PAGE_SIZE
  const offset = currentStart % serverPageSize
  const data = response.data.slice(offset, offset + COMPACT_PAGE_SIZE)
  const pagination: CompactPaginationMeta = {
    current_page: currentPage,
    last_page: lastPage,
    per_page: COMPACT_PAGE_SIZE,
    total: response.total,
    from: response.total === 0 ? null : currentStart + 1,
    to: data.length === 0 ? null : currentStart + data.length,
    prev_page_url: currentPage > 1 ? 'compact-prev' : null,
    next_page_url: currentPage < lastPage ? 'compact-next' : null,
  }

  return { data, pagination, serverPageSize }
}
