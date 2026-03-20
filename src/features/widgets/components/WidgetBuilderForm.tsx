import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Widget, WidgetApiValidationErrors, WidgetFormPayload, WidgetConfig } from '../../../types/widget'
import {
  defaultWidgetVisualConfig,
  layoutLabels,
  layoutOptions,
  mediaTypeOptions,
  shadowOptions,
  variantOptions,
  type WidgetVisualConfig,
} from '../types/widgetTemplate'
import { isMediaApplicable, layoutPresetDefinitions } from '../utils/layoutPresetDefinitions'
import { generateWidgetCss, generateWidgetHtml, normalizeWidgetConfig } from '../utils/widgetTemplateGenerator'
import WidgetLivePreview from './WidgetLivePreview'
import WidgetPreviewFrame from './WidgetPreviewFrame'

type Props = {
  initialValue?: Widget
  submitting: boolean
  submitLabel: string
  apiErrors?: WidgetApiValidationErrors
  onSubmit: (payload: WidgetFormPayload) => Promise<void>
}

type EditorTab = 'structure' | 'layout' | 'style' | 'preview'

const tabs: Array<{ key: EditorTab; label: string }> = [
  { key: 'structure', label: 'Estrutura' },
  { key: 'layout', label: 'Layout' },
  { key: 'style', label: 'Estilo' },
  { key: 'preview', label: 'Preview' },
]

const WidgetBuilderForm = ({ initialValue, submitting, submitLabel, apiErrors, onSubmit }: Props) => {
  const [title, setTitle] = useState(initialValue?.title ?? 'Template de Widget')
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)
  const [localError, setLocalError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<EditorTab>('structure')
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false)
  const [config, setConfig] = useState<WidgetVisualConfig>(() => normalizeWidgetConfig(initialValue?.config ?? { name: 'Widget padrão', slug: 'widget-padrao', attributes: defaultWidgetVisualConfig }))

  const generatedHtml = useMemo(() => generateWidgetHtml(config), [config])
  const generatedCss = useMemo(() => generateWidgetCss(config), [config])

  const update = <K extends keyof WidgetVisualConfig>(key: K, value: WidgetVisualConfig[K]) => setConfig((prev) => ({ ...prev, [key]: value }))

  const handleLayout = (layout: WidgetVisualConfig['layout']) => {
    const def = layoutPresetDefinitions[layout]
    setConfig((prev) => {
      let mediaType = def.forceMediaType ?? prev.mediaType
      let showMedia = prev.showMedia

      if (def.forceMediaType === 'none') {
        showMedia = false
        mediaType = 'none'
      } else if (def.forceMediaType) {
        // Preset forces a specific media type (image/video) — re-enable media
        showMedia = true
        mediaType = def.forceMediaType
      } else if (!prev.showMedia || prev.mediaType === 'none') {
        // No forced media type, but user had disabled media — restore default
        showMedia = true
        mediaType = 'image'
      }

      return { ...prev, layout, mediaType, showMedia }
    })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)
    if (!title.trim()) return setLocalError('Informe o nome do template.')

    const widgetConfig: WidgetConfig = {
      name: title.trim(),
      slug: title.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      attributes: config,
    }

    await onSubmit({
      title: title.trim(),
      config: widgetConfig,
      html: generatedHtml,
      css: generatedCss,
      is_active: isActive,
    })
  }

  const fieldError = apiErrors ?? {}
  const mediaSizeDisabled = !layoutPresetDefinitions[config.layout].supportsMediaSize || !isMediaApplicable(config.layout) || !config.showMedia || config.mediaType === 'none'

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {localError ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{localError}</div> : null}
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-slate-700">Nome do template</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            {fieldError.title?.[0] ? <p className="text-xs text-rose-600">{fieldError.title[0]}</p> : null}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Template ativo</label>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-2">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {tab.label}
            </button>
          ))}
          <button type="button" onClick={() => setShowFullscreenPreview(true)} className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Abrir preview fullscreen</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            {activeTab === 'structure' ? (
              <>
                <p className="text-sm text-slate-600">Defina os blocos visuais que o template irá renderizar com conteúdo simulado.</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {([
                    ['showTitle', 'Exibir título'],
                    ['showSubtitle', 'Exibir subtítulo'],
                    ['showDescription', 'Exibir descrição'],
                    ['showButton', 'Exibir botão'],
                    ['showComplementaryText', 'Exibir texto complementar'],
                    ['showBadge', 'Exibir selo/badge'],
                    ['showMedia', 'Exibir mídia'],
                  ] as Array<[keyof WidgetVisualConfig, string]>).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><input type="checkbox" checked={Boolean(config[key])} onChange={(e) => update(key, e.target.checked as never)} /> {label}</label>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><input type="checkbox" checked={config.buttonFullWidth} onChange={(e) => update('buttonFullWidth', e.target.checked)} /> Botão com largura total</label>
                  <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><input type="checkbox" checked={config.mediaClickableCta} disabled={!config.showMedia || config.mediaType === 'none'} onChange={(e) => update('mediaClickableCta', e.target.checked)} /> Mídia clicável como CTA</label>
                </div>
                <label className="block text-sm">Tipo de mídia
                  <select value={config.mediaType} disabled={!config.showMedia} onChange={(e) => update('mediaType', e.target.value as WidgetVisualConfig['mediaType'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100">
                    {mediaTypeOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              </>
            ) : null}

            {activeTab === 'layout' ? (
              <>
                <label className="block text-sm">Preset de layout
                  <select value={config.layout} onChange={(e) => handleLayout(e.target.value as WidgetVisualConfig['layout'])} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2">
                    {layoutOptions.map((option) => <option key={option} value={option}>{layoutLabels[option]}</option>)}
                  </select>
                </label>
                <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">{layoutPresetDefinitions[config.layout].description}</p>
                <label className="block text-sm">Largura do widget ({config.width}px)<input type="range" min={280} max={960} step={10} value={config.width} onChange={(e) => update('width', Number(e.target.value))} className="mt-2 w-full" /></label>
                <label className="block text-sm">Altura mínima ({config.minHeight}px)<input type="range" min={120} max={520} step={10} value={config.minHeight} onChange={(e) => update('minHeight', Number(e.target.value))} className="mt-2 w-full" /></label>
                <label className="block text-sm">Tamanho da mídia ({config.mediaSize}%)<input type="range" min={20} max={70} value={config.mediaSize} disabled={mediaSizeDisabled} onChange={(e) => update('mediaSize', Number(e.target.value))} className="mt-2 w-full disabled:opacity-40" /></label>
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
                <label className="block text-sm">Padding ({config.padding}px)<input type="range" min={0} max={56} value={config.padding} onChange={(e) => update('padding', Number(e.target.value))} className="mt-2 w-full" /></label>
              </>
            ) : null}

            {activeTab === 'preview' ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex gap-2">
                  {(['desktop', 'mobile'] as const).map((mode) => (
                    <button key={mode} type="button" onClick={() => setPreviewViewport(mode)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${previewViewport === mode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{mode === 'desktop' ? 'Desktop' : 'Mobile'}</button>
                  ))}
                </div>
                <div className="rounded-xl bg-slate-100 p-4">
                  <WidgetPreviewFrame viewport={previewViewport}>
                    <WidgetLivePreview config={config} viewport={previewViewport} />
                  </WidgetPreviewFrame>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Preview ao vivo</p>
            <div className="rounded-xl bg-slate-100 p-4">
              <WidgetLivePreview config={config} compact />
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Salvando...' : submitLabel}</button>
        {fieldError.config?.[0] ? <p className="text-xs text-rose-600">{fieldError.config[0]}</p> : null}
      </form>

      {showFullscreenPreview ? (
        <div className="fixed inset-0 z-50 bg-slate-950/70 p-6">
          <div className="flex h-full flex-col rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Preview em tela cheia</h3>
              <div className="flex items-center gap-2">
                {(['desktop', 'mobile'] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setPreviewViewport(mode)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${previewViewport === mode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{mode === 'desktop' ? 'Desktop' : 'Mobile'}</button>
                ))}
                <button type="button" onClick={() => setShowFullscreenPreview(false)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Fechar</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-200 p-8">
              <WidgetPreviewFrame viewport={previewViewport} fullscreen>
                <WidgetLivePreview config={config} viewport={previewViewport} />
              </WidgetPreviewFrame>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default WidgetBuilderForm
