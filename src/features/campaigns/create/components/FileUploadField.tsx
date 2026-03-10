import { useCallback, useRef, useState } from 'react'
import { Loader2, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<{ url: string }>
  accept: string
  icon: React.ReactNode
  placeholder: string
  preview?: 'image' | 'video'
}

const FileUploadField = ({
  label,
  value,
  onChange,
  onUpload,
  accept,
  icon,
  placeholder,
  preview,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  const clearStatus = useCallback(() => {
    setStatus('idle')
    setStatusMsg('')
  }, [])

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || uploading) return

      setUploading(true)
      clearStatus()

      try {
        const result = await onUpload(file)
        onChange(result.url)
        setStatus('success')
        setStatusMsg('Upload realizado com sucesso')
        setTimeout(clearStatus, 4000)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao enviar arquivo'
        setStatus('error')
        setStatusMsg(msg)
      } finally {
        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [onUpload, onChange, uploading, clearStatus],
  )

  const hasImagePreview = preview === 'image' && value

  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold text-slate-600">{label}</span>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {icon}
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              clearStatus()
            }}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
          />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload
            </>
          )}
        </button>
      </div>

      {status !== 'idle' && (
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            status === 'success' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {status === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          )}
          <span className="flex-1">{statusMsg}</span>
          <button
            type="button"
            onClick={clearStatus}
            className="ml-1 rounded p-0.5 transition hover:bg-slate-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {hasImagePreview && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="Preview"
            className="h-32 w-full object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {preview === 'video' && value && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="truncate text-xs text-slate-500">{value}</span>
        </div>
      )}
    </div>
  )
}

export default FileUploadField
