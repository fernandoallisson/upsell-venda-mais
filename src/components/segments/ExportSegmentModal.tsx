import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Download,
  FileDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Clock,
} from 'lucide-react'
import { ApiError } from '../../lib/api'
import { getAuthToken } from '../../lib/storage'
import type {
  ExportColumn,
  ExportMode,
  ExportStatusResponse,
} from '../../lib/services/segments/segments.types'
import {
  getExportColumns,
  startAsyncExport,
  getExportStatus,
  getAsyncExportDownloadUrl,
  getSyncExportStreamUrl,
} from '../../lib/services/segments/segments.service'

const API_BASE_URL = 'https://vitor-api.vendamais.top/api'

const buildFullUrl = (endpoint: string) =>
  endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

type ExportSegmentModalProps = {
  segmentId: number
  segmentName: string
  open: boolean
  onClose: () => void
}

type AsyncExportState = {
  exportId: string | null
  status: ExportStatusResponse['status'] | 'idle'
  progress: number
  message: string
}

const POLL_INTERVAL = 3000

const AVAILABLE_COLUMNS: ExportColumn[] = [
  { key: 'id', label: 'ID interno do cliente' },
  { key: 'external_id', label: 'ID externo do cliente' },
  { key: 'email', label: 'E-mail' },
  { key: 'phone', label: 'Telefone' },
  { key: 'first_name', label: 'Primeiro nome' },
  { key: 'last_name', label: 'Sobrenome' },
  { key: 'birth_date', label: 'Data de nascimento' },
  { key: 'total_orders_count', label: 'Total de pedidos' },
  { key: 'lifetime_value', label: 'Lifetime Value (LTV)' },
  { key: 'average_ticket', label: 'Ticket medio' },
  { key: 'last_purchase_at', label: 'Ultima compra' },
  { key: 'lifecycle_stage', label: 'Estagio do ciclo de vida' },
  { key: 'created_at', label: 'Data de criacao' },
  { key: 'updated_at', label: 'Ultima atualizacao' },
]

const ExportSegmentModal = ({
  segmentId,
  segmentName,
  open,
  onClose,
}: ExportSegmentModalProps) => {
  const [mode, setMode] = useState<ExportMode>('sync')
  const [columns, setColumns] = useState<ExportColumn[]>(AVAILABLE_COLUMNS)
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    () => new Set(AVAILABLE_COLUMNS.map((c) => c.key)),
  )
  const [columnsLoading, setColumnsLoading] = useState(false)
  const [columnsError, setColumnsError] = useState<string | null>(null)
  const [columnPage, setColumnPage] = useState(0)

  const [syncLoading, setSyncLoading] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const [asyncState, setAsyncState] = useState<AsyncExportState>({
    exportId: null,
    status: 'idle',
    progress: 0,
    message: '',
  })
  const [asyncError, setAsyncError] = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open) {
      stopPolling()
      setSyncLoading(false)
      setSyncError(null)
      setAsyncState({ exportId: null, status: 'idle', progress: 0, message: '' })
      setAsyncError(null)
      setColumnPage(0)
    }
  }, [open, stopPolling])

  const fetchColumns = useCallback(() => {
    setColumnsLoading(true)
    setColumnsError(null)
    getExportColumns()
      .then((fetched) => {
        if (fetched.length > 0) {
          setColumns(fetched)
          setSelectedColumns(new Set(fetched.map((c) => c.key)))
        } else {
          setColumnsError('Nenhuma coluna disponível retornada pela API.')
        }
      })
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Erro ao carregar colunas de exportação.'
        setColumnsError(message)
      })
      .finally(() => setColumnsLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    fetchColumns()
  }, [open, fetchColumns])

  useEffect(() => () => stopPolling(), [stopPolling])

  const toggleColumn = (key: string) => {
    setSelectedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const toggleAllColumns = () => {
    if (selectedColumns.size === columns.length) {
      setSelectedColumns(new Set())
    } else {
      setSelectedColumns(new Set(columns.map((c) => c.key)))
    }
  }

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleSyncExport = async () => {
    setSyncLoading(true)
    setSyncError(null)

    try {
      const token = getAuthToken()
      if (!token) throw new ApiError('Nao autenticado', 401)

      const streamEndpoint = getSyncExportStreamUrl(segmentId)
      const url = new URL(buildFullUrl(streamEndpoint))

      if (selectedColumns.size < columns.length && selectedColumns.size > 0) {
        url.searchParams.set('columns', Array.from(selectedColumns).join(','))
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/csv, application/octet-stream, */*',
        },
      })

      if (!response.ok) {
        const body = await response.text()
        let message = 'Erro ao exportar segmento'
        try {
          const json = JSON.parse(body)
          if (json.message) message = json.message
        } catch {
          if (body) message = body
        }
        throw new ApiError(message, response.status)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const safeName = segmentName.replace(/[^a-zA-Z0-9_-]/g, '_')
      triggerDownload(blobUrl, `segmento_${safeName}_${segmentId}.csv`)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao exportar segmento.'
      setSyncError(message)
    } finally {
      setSyncLoading(false)
    }
  }

  const pollExportStatus = useCallback(
    (exportId: string) => {
      stopPolling()

      const poll = async () => {
        try {
          const statusData = await getExportStatus(segmentId, exportId)

          setAsyncState((prev) => ({
            ...prev,
            status: statusData.status,
            progress: statusData.progress ?? prev.progress,
            message: statusData.message ?? '',
          }))

          if (statusData.status === 'completed') {
            stopPolling()
          }

          if (statusData.status === 'failed') {
            stopPolling()
            setAsyncError(statusData.message ?? 'A exportacao falhou.')
          }
        } catch (err) {
          stopPolling()
          const message =
            err instanceof ApiError
              ? err.message
              : 'Erro ao verificar status da exportacao.'
          setAsyncError(message)
        }
      }

      poll()
      pollRef.current = setInterval(poll, POLL_INTERVAL)
    },
    [segmentId, stopPolling],
  )

  const handleAsyncExport = async () => {
    setAsyncError(null)
    setAsyncState({
      exportId: null,
      status: 'pending',
      progress: 0,
      message: 'Iniciando exportacao...',
    })

    try {
      const result = await startAsyncExport(segmentId)
      const exportId = result.export_id

      setAsyncState({
        exportId,
        status: 'pending',
        progress: 0,
        message: result.message ?? 'Exportacao iniciada. Aguardando processamento...',
      })

      pollExportStatus(exportId)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao iniciar exportacao.'
      setAsyncError(message)
      setAsyncState((prev) => ({ ...prev, status: 'idle' }))
    }
  }

  const handleAsyncDownload = async () => {
    if (!asyncState.exportId) return

    try {
      const token = getAuthToken()
      if (!token) throw new ApiError('Nao autenticado', 401)

      const endpoint = getAsyncExportDownloadUrl(segmentId, asyncState.exportId)
      const url = buildFullUrl(endpoint)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/csv, application/octet-stream, */*',
        },
      })

      if (!response.ok) {
        throw new ApiError('Erro ao baixar arquivo exportado', response.status)
      }

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const safeName = segmentName.replace(/[^a-zA-Z0-9_-]/g, '_')
      triggerDownload(blobUrl, `segmento_${safeName}_${segmentId}.csv`)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Erro ao baixar arquivo.'
      setAsyncError(message)
    }
  }

  if (!open) return null

  const isAsyncBusy =
    asyncState.status === 'pending' || asyncState.status === 'processing'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50">
              <FileDown className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Exportar Segmento
              </h2>
              <p className="text-xs text-slate-500">{segmentName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('sync')}
              className={`rounded-xl border p-4 text-left transition ${
                mode === 'sync'
                  ? 'border-teal-200 bg-teal-50 ring-1 ring-teal-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Zap
                className={`h-5 w-5 ${
                  mode === 'sync' ? 'text-teal-600' : 'text-slate-400'
                }`}
              />
              <p
                className={`mt-2 text-sm font-semibold ${
                  mode === 'sync' ? 'text-teal-800' : 'text-slate-700'
                }`}
              >
                Sincrona
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Download direto via streaming. Ate 50.000 clientes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('async')}
              className={`rounded-xl border p-4 text-left transition ${
                mode === 'async'
                  ? 'border-teal-200 bg-teal-50 ring-1 ring-teal-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Clock
                className={`h-5 w-5 ${
                  mode === 'async' ? 'text-teal-600' : 'text-slate-400'
                }`}
              />
              <p
                className={`mt-2 text-sm font-semibold ${
                  mode === 'async' ? 'text-teal-800' : 'text-slate-700'
                }`}
              >
                Assincrona
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Job em background. Para mais de 50.000 clientes.
              </p>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Colunas para exportar
              </p>
              <button
                type="button"
                onClick={toggleAllColumns}
                className="text-xs font-medium text-teal-600 transition hover:text-teal-700"
              >
                {selectedColumns.size === columns.length
                  ? 'Desmarcar todas'
                  : 'Selecionar todas'}
              </button>
            </div>

            {columnsLoading ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando colunas...
              </div>
            ) : columnsError ? (
              <div className="mt-2 space-y-2">
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-500" />
                  <p className="text-xs text-rose-700">{columnsError}</p>
                </div>
                <button
                  type="button"
                  onClick={fetchColumns}
                  className="text-xs font-medium text-teal-600 transition hover:text-teal-700"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {columns.slice(columnPage * 6, columnPage * 6 + 6).map((col) => (
                  <label
                    key={col.key}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
              {columns.length > 6 ? (
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-slate-500">
                  <button type="button" disabled={columnPage === 0} onClick={() => setColumnPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Anterior</button>
                  <span>{columnPage + 1} / {Math.ceil(columns.length / 6)}</span>
                  <button type="button" disabled={columnPage + 1 >= Math.ceil(columns.length / 6)} onClick={() => setColumnPage((value) => value + 1)} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">Proxima</button>
                </div>
              ) : null}
              </>
            )}
          </div>

          {mode === 'sync' ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs text-amber-700">
                  Recomendado apenas para segmentos com ate 50.000 clientes.
                  Para volumes maiores, use a exportacao assincrona.
                </p>
              </div>

              {syncError ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                  <p className="text-xs text-rose-700">{syncError}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSyncExport}
                disabled={syncLoading || selectedColumns.size === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar agora
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-600">
                  O processo inicia um job em background. Acompanhe o progresso
                  abaixo e faca o download quando concluido.
                </p>
              </div>

              {asyncState.status !== 'idle' ? (
                <div className="rounded-xl border border-slate-200 px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {asyncState.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : asyncState.status === 'failed' ? (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
                      )}
                      <p className="text-xs font-semibold text-slate-700">
                        {asyncState.status === 'pending' && 'Pendente'}
                        {asyncState.status === 'processing' && 'Processando'}
                        {asyncState.status === 'completed' && 'Concluido'}
                        {asyncState.status === 'failed' && 'Falhou'}
                      </p>
                    </div>
                    {asyncState.progress > 0 ? (
                      <span className="text-xs font-semibold text-slate-600">
                        {Math.round(asyncState.progress)}%
                      </span>
                    ) : null}
                  </div>

                  {asyncState.progress > 0 ? (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${Math.min(asyncState.progress, 100)}%` }}
                      />
                    </div>
                  ) : null}

                  {asyncState.message ? (
                    <p className="text-xs text-slate-500">{asyncState.message}</p>
                  ) : null}

                  {asyncState.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={handleAsyncDownload}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Download className="h-4 w-4" />
                      Baixar arquivo
                    </button>
                  ) : null}
                </div>
              ) : null}

              {asyncError ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
                  <p className="text-xs text-rose-700">{asyncError}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleAsyncExport}
                disabled={isAsyncBusy || selectedColumns.size === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAsyncBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Iniciar exportacao
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExportSegmentModal
