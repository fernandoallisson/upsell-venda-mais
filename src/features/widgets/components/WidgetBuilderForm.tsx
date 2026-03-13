import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { CreateWidgetPayload, Widget, WidgetApiValidationErrors } from '../../../types/widget'
import {
  alignmentOptions,
  layoutOptions,
  mediaPositionOptions,
  mediaTypeOptions,
  shadowOptions,
  variantOptions,
  type WidgetVisualConfig,
} from '../types/widgetTemplate'
import { generateWidgetCss, generateWidgetHtml, normalizeWidgetConfig } from '../utils/widgetTemplateGenerator'
import WidgetLivePreview from './WidgetLivePreview'

type Props = {
  initialValue?: Widget
  submitting: boolean
  submitLabel: string
  apiErrors?: WidgetApiValidationErrors
  onSubmit: (payload: CreateWidgetPayload) => Promise<void>
}

type EditorTab = 'content' | 'layout' | 'style' | 'media' | 'advanced' | 'preview'

const tabs: Array<{ key: EditorTab; label: string }> = [
  { key: 'content', label: 'Conteúdo' },
  { key: 'layout', label: 'Layout' },
  { key: 'style', label: 'Estilo' },
  { key: 'media', label: 'Mídia' },
  { key: 'advanced', label: 'Avançado' },
  { key: 'preview', label: 'Preview' },
]

const WidgetBuilderForm = ({ initialValue, submitting, submitLabel, apiErrors, onSubmit }: Props) => {
  const [title, setTitle] = useState(initialValue?.title ?? 'Template de Widget')
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)
  const [localError, setLocalError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<EditorTab>('content')
  const [config, setConfig] = useState<WidgetVisualConfig>(() => normalizeWidgetConfig(initialValue?.config))

  const generatedHtml = useMemo(() => generateWidgetHtml(config), [config])
  const generatedCss = useMemo(() => generateWidgetCss(config), [config])

  const update = <K extends keyof WidgetVisualConfig>(key: K, value: WidgetVisualConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleUpload = (key: 'mediaUrl') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        update(key, reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)

    if (!title.trim()) {
      setLocalError('Informe o nome do template.')
      return
    }

    await onSubmit({
      title: title.trim(),
      config,
      html: generatedHtml,
      css: generatedCss,
      is_active: isActive,
    })
  }

  const fieldError = apiErrors ?? {}

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      {localError ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{localError}</div> : null}
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-slate-700">Nome do template</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          {fieldError.title?.[0] ? <p className="text-xs text-rose-600">{fieldError.title[0]}</p> : null}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Template ativo
        </label>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          {activeTab === 'content' ? (
            <>
              <label className="block text-sm">Título<input value={config.title} onChange={(e) => update('title', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
              <label className="block text-sm">Subtítulo<input value={config.subtitle} onChange={(e) => update('subtitle', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
              <label className="block text-sm">Descrição<textarea value={config.description} onChange={(e) => update('description', e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm">Texto do botão<input value={config.buttonText} onChange={(e) => update('buttonText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
                <label className="block text-sm">Link do botão<input value={config.buttonLink} onChange={(e) => update('buttonLink', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
              </div>
              <label className="block text-sm">Texto complementar<input value={config.extraText} onChange={(e) => update('extraText', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
            </>
          ) : null}

          {activeTab === 'layout' ? (
            <>
              <label className="block text-sm">Layout
                <select value={config.layout} onChange={(e) => update('layout', e.target.value as WidgetVisualConfig['layout'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                  {layoutOptions.map((value) => <option key={value}>{value}</option>)}
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm">Posição da mídia
                  <select value={config.mediaPosition} onChange={(e) => update('mediaPosition', e.target.value as WidgetVisualConfig['mediaPosition'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                    {mediaPositionOptions.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="block text-sm">Alinhamento
                  <select value={config.alignment} onChange={(e) => update('alignment', e.target.value as WidgetVisualConfig['alignment'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                    {alignmentOptions.map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-sm">Largura do widget ({config.width}px)<input type="range" min={320} max={900} value={config.width} onChange={(e) => update('width', Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="block text-sm">Altura mínima ({config.minHeight}px)<input type="range" min={120} max={500} value={config.minHeight} onChange={(e) => update('minHeight', Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="block text-sm">Tamanho da mídia ({config.mediaWidth}%)<input type="range" min={20} max={70} value={config.mediaWidth} onChange={(e) => update('mediaWidth', Number(e.target.value))} className="mt-2 w-full" /></label>
            </>
          ) : null}

          {activeTab === 'style' ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm">Variante<select value={config.variant} onChange={(e) => update('variant', e.target.value as WidgetVisualConfig['variant'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">{variantOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
                <label className="block text-sm">Sombra<select value={config.shadow} onChange={(e) => update('shadow', e.target.value as WidgetVisualConfig['shadow'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">{shadowOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm">Cor de fundo<input type="color" value={config.backgroundColor} onChange={(e) => update('backgroundColor', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 p-1" /></label>
                <label className="block text-sm">Cor do texto<input type="color" value={config.textColor} onChange={(e) => update('textColor', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 p-1" /></label>
                <label className="block text-sm">Cor do botão<input type="color" value={config.buttonColor} onChange={(e) => update('buttonColor', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 p-1" /></label>
                <label className="block text-sm">Cor da borda<input type="color" value={config.borderColor} onChange={(e) => update('borderColor', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 p-1" /></label>
              </div>
              <label className="block text-sm">Border radius ({config.borderRadius}px)<input type="range" min={0} max={40} value={config.borderRadius} onChange={(e) => update('borderRadius', Number(e.target.value))} className="mt-2 w-full" /></label>
              <label className="block text-sm">Padding ({config.padding}px)<input type="range" min={0} max={48} value={config.padding} onChange={(e) => update('padding', Number(e.target.value))} className="mt-2 w-full" /></label>
            </>
          ) : null}

          {activeTab === 'media' ? (
            <>
              <label className="block text-sm">Tipo de mídia<select value={config.mediaType} onChange={(e) => update('mediaType', e.target.value as WidgetVisualConfig['mediaType'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">{mediaTypeOptions.map((v) => <option key={v}>{v}</option>)}</select></label>
              <label className="block text-sm">URL da mídia<input value={config.mediaUrl} onChange={(e) => update('mediaUrl', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
              <label className="block text-sm">Upload de mídia<input type="file" accept="image/*,video/*" onChange={handleUpload('mediaUrl')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.showButton} onChange={(e) => update('showButton', e.target.checked)} /> Mostrar botão</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.showBadge} onChange={(e) => update('showBadge', e.target.checked)} /> Mostrar selo</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.showDescription} onChange={(e) => update('showDescription', e.target.checked)} /> Mostrar descrição</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.glass} onChange={(e) => update('glass', e.target.checked)} /> Efeito glass</label>
              </div>
            </>
          ) : null}

          {activeTab === 'advanced' ? (
            <>
              <p className="text-xs text-slate-500">Saída técnica gerada automaticamente (somente referência).</p>
              <label className="block text-xs font-semibold">HTML</label>
              <textarea readOnly value={generatedHtml} rows={8} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs" />
              <label className="block text-xs font-semibold">CSS</label>
              <textarea readOnly value={generatedCss} rows={8} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs" />
            </>
          ) : null}

          {activeTab === 'preview' ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <WidgetLivePreview config={config} />
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Preview ao vivo</p>
          <WidgetLivePreview config={config} />
        </div>
      </div>

      <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {submitting ? 'Salvando...' : submitLabel}
      </button>

      {fieldError.config?.[0] ? <p className="text-xs text-rose-600">{fieldError.config[0]}</p> : null}
      {fieldError.html?.[0] ? <p className="text-xs text-rose-600">{fieldError.html[0]}</p> : null}
      {fieldError.css?.[0] ? <p className="text-xs text-rose-600">{fieldError.css[0]}</p> : null}
    </form>
  )
}

export default WidgetBuilderForm
