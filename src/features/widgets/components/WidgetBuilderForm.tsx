import { useMemo, useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import {
  Layers,
  Paintbrush,
  SlidersHorizontal,
  Eye,
  Monitor,
  Smartphone,
  Maximize2,
  X,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Undo2,
  Save,
  Sparkles,
} from 'lucide-react'
import type { Widget, WidgetApiValidationErrors, WidgetFormPayload, WidgetConfig } from '../../../types/widget'
import {
  defaultWidgetVisualConfig,
  WIDGET_LIMITS,
  mediaTypeOptions,
  shadowOptions,
  variantOptions,
  type WidgetVisualConfig,
} from '../types/widgetTemplate'
import { isMediaApplicable, layoutPresetDefinitions } from '../utils/layoutPresetDefinitions'
import { generateWidgetCss, generateWidgetHtml, normalizeWidgetConfig } from '../utils/widgetTemplateGenerator'
import {
  buildHtmlWidgetTemplateConfig,
  generateHtmlWidgetTemplateCss,
  generateHtmlWidgetTemplateHtml,
  getHtmlWidgetTemplateHideableElements,
  getHtmlWidgetTemplateEditableFields,
  getHtmlWidgetTemplateById,
  isHtmlWidgetTemplateConfig,
} from '../utils/htmlWidgetTemplateGenerator'
import type { HtmlWidgetTemplate, HtmlWidgetTemplateContent } from '../utils/htmlWidgetTemplateTypes'
import WidgetLivePreview from './WidgetLivePreview'
import WidgetPreviewFrame from './WidgetPreviewFrame'
import WidgetTemplateGallery, { type WidgetTemplateSelection } from './WidgetTemplateGallery'
import WidgetColorPresets from './WidgetColorPresets'
import WidgetLayoutPicker from './WidgetLayoutPicker'
import HtmlTemplateInlineEditorPreview from './HtmlTemplateInlineEditorPreview'

type Props = {
  initialValue?: Widget
  submitting: boolean
  submitLabel: string
  apiErrors?: WidgetApiValidationErrors
  onSubmit: (payload: WidgetFormPayload) => Promise<void>
}

type EditorSection = 'layout' | 'structure' | 'style' | 'dimensions' | 'htmlContent'

type BuilderStep = 'template' | 'customize'

const variantLabels: Record<WidgetVisualConfig['variant'], string> = {
  modern: 'Moderno',
  minimal: 'Minimalista',
  premium: 'Premium',
  promotional: 'Promocional',
  glass: 'Glass',
  bold: 'Bold',
}

const shadowLabels: Record<WidgetVisualConfig['shadow'], string> = {
  none: 'Nenhuma',
  sm: 'Suave',
  md: 'Média',
  lg: 'Forte',
}

const WidgetBuilderForm = ({ initialValue, submitting, submitLabel, apiErrors, onSubmit }: Props) => {
  const isEditing = !!initialValue
  const initialAttributes = initialValue?.config?.attributes
  const initialHtmlTemplate = isHtmlWidgetTemplateConfig(initialAttributes)
    ? getHtmlWidgetTemplateById(initialAttributes.templateId)
    : null
  const [step, setStep] = useState<BuilderStep>(isEditing ? 'customize' : 'template')
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true)
  const [selectedHtmlTemplate, setSelectedHtmlTemplate] = useState<HtmlWidgetTemplate | null>(initialHtmlTemplate)
  const [htmlContent, setHtmlContent] = useState<HtmlWidgetTemplateContent>(() =>
    isHtmlWidgetTemplateConfig(initialAttributes) ? initialAttributes.contentOverrides ?? {} : {},
  )
  const [htmlFieldOverrides, setHtmlFieldOverrides] = useState<Record<string, string>>(() =>
    isHtmlWidgetTemplateConfig(initialAttributes) ? initialAttributes.fieldOverrides ?? {} : {},
  )
  const [hiddenElementIds, setHiddenElementIds] = useState<string[]>(() =>
    isHtmlWidgetTemplateConfig(initialAttributes) ? initialAttributes.hiddenElementIds ?? [] : [],
  )
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false)
  const [hiddenItemsExpanded, setHiddenItemsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<EditorSection>>(
    new Set(initialHtmlTemplate ? ['htmlContent'] : ['layout', 'style']),
  )
  const [config, setConfig] = useState<WidgetVisualConfig>(() =>
    normalizeWidgetConfig(initialValue?.config ?? { name: 'Widget padrão', slug: 'widget-padrao', attributes: defaultWidgetVisualConfig }),
  )

  const generatedHtml = useMemo(
    () =>
      selectedHtmlTemplate
        ? generateHtmlWidgetTemplateHtml(selectedHtmlTemplate, htmlContent, htmlFieldOverrides, hiddenElementIds)
        : generateWidgetHtml(config),
    [config, hiddenElementIds, htmlContent, htmlFieldOverrides, selectedHtmlTemplate],
  )
  const generatedCss = useMemo(
    () =>
      selectedHtmlTemplate
        ? generateHtmlWidgetTemplateCss(selectedHtmlTemplate)
        : generateWidgetCss(config),
    [config, selectedHtmlTemplate],
  )

  const update = useCallback(<K extends keyof WidgetVisualConfig>(key: K, value: WidgetVisualConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateHtmlFieldOverride = useCallback((fieldId: string, value: string) => {
    setHtmlFieldOverrides((prev) => ({ ...prev, [fieldId]: value }))
  }, [])

  const hideHtmlElement = useCallback((elementId: string) => {
    setHiddenElementIds((prev) => (prev.includes(elementId) ? prev : [...prev, elementId]))
  }, [])

  const restoreHtmlElement = useCallback((elementId: string) => {
    setHiddenElementIds((prev) => prev.filter((id) => id !== elementId))
  }, [])

  const handleLayout = useCallback((layout: WidgetVisualConfig['layout']) => {
    const def = layoutPresetDefinitions[layout]
    setConfig((prev) => {
      let mediaType = def.forceMediaType ?? prev.mediaType
      let showMedia = prev.showMedia

      if (def.forceMediaType === 'none') {
        showMedia = false
        mediaType = 'none'
      } else if (def.forceMediaType) {
        showMedia = true
        mediaType = def.forceMediaType
      } else if (!prev.showMedia || prev.mediaType === 'none') {
        showMedia = true
        mediaType = 'image'
      }

      return { ...prev, layout, mediaType, showMedia }
    })
  }, [])

  const toggleSection = (section: EditorSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const handleSelectTemplate = (selection: WidgetTemplateSelection) => {
    if (selection.kind === 'html') {
      setSelectedHtmlTemplate(selection.template)
      setHtmlContent({})
      setHtmlFieldOverrides({})
      setHiddenElementIds([])
      setExpandedSections(new Set(['htmlContent']))
      setTitle((current) => current || selection.name)
      setStep('customize')
      return
    }

    setSelectedHtmlTemplate(null)
    setHtmlContent({})
    setHtmlFieldOverrides({})
    setHiddenElementIds([])
    setExpandedSections(new Set(['layout', 'style']))
    setConfig(selection.config)
    setTitle((current) => current || selection.name)
    setStep('customize')
  }

  const handleResetToDefaults = () => {
    setSelectedHtmlTemplate(null)
    setHtmlContent({})
    setHtmlFieldOverrides({})
    setHiddenElementIds([])
    setExpandedSections(new Set(['layout', 'style']))
    setConfig(normalizeWidgetConfig({ name: '', slug: '', attributes: defaultWidgetVisualConfig }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLocalError(null)
    if (!title.trim()) return setLocalError('Informe o nome do widget.')

    const widgetConfig: WidgetConfig = {
      name: title.trim(),
      slug: title
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      attributes: selectedHtmlTemplate ? buildHtmlWidgetTemplateConfig(selectedHtmlTemplate, htmlContent, htmlFieldOverrides, hiddenElementIds) : { ...config, widgetEngine: 'visual' },
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

  // ─── Step 1: Template Gallery ───
  if (step === 'template') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <WidgetTemplateGallery
          onSelect={handleSelectTemplate}
          onSkip={() => setStep('customize')}
        />
      </div>
    )
  }

  // ─── Step 2: Customization Builder ───
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-0">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-t-2xl border border-slate-200 bg-white px-5 py-4">
          {/* Back to templates (only on create) */}
          {!isEditing && (
            <button
              type="button"
              onClick={() => setStep('template')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Modelos
            </button>
          )}

          {/* Title input */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do widget..."
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 transition focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {fieldError.title?.[0] ? <p className="shrink-0 text-xs text-rose-600">{fieldError.title[0]}</p> : null}
          </div>

          {/* Status toggle */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {isActive ? 'Ativo' : 'Inativo'}
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Resetar para valores padrão"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-500 transition hover:bg-slate-50"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Salvando...' : submitLabel}
          </button>
        </div>

        {localError ? (
          <div className="border-x border-slate-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">{localError}</div>
        ) : null}
        {fieldError.config?.[0] ? (
          <div className="border-x border-slate-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">{fieldError.config[0]}</div>
        ) : null}

        {/* Main Editor Area */}
        <div className="grid rounded-b-2xl border border-t-0 border-slate-200 bg-slate-50 lg:grid-cols-[380px_1fr]">
          {/* ── Left: Controls Panel ── */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto border-r border-slate-200 bg-white">
            {selectedHtmlTemplate ? (
              <HtmlTemplateEditor
                template={selectedHtmlTemplate}
                fieldOverrides={htmlFieldOverrides}
                hiddenElementIds={hiddenElementIds}
                hiddenItemsExpanded={hiddenItemsExpanded}
                expanded={expandedSections.has('htmlContent')}
                onToggle={() => toggleSection('htmlContent')}
                onFieldChange={updateHtmlFieldOverride}
                onRestoreElement={restoreHtmlElement}
                onToggleHiddenItems={() => setHiddenItemsExpanded((prev) => !prev)}
              />
            ) : (
              <>
                <CollapsiblePanel
                  icon={<Layers className="h-4 w-4" />}
                  title="Layout"
                  expanded={expandedSections.has('layout')}
                  onToggle={() => toggleSection('layout')}
                >
                  <div className="space-y-4">
                    <WidgetLayoutPicker value={config.layout} onChange={handleLayout} />
                    <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      {layoutPresetDefinitions[config.layout].description}
                    </p>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel
                  icon={<SlidersHorizontal className="h-4 w-4" />}
                  title="Estrutura"
                  expanded={expandedSections.has('structure')}
                  onToggle={() => toggleSection('structure')}
                >
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Defina os blocos visuais que o widget irá exibir.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        ['showTitle', 'Título'],
                        ['showSubtitle', 'Subtítulo'],
                        ['showDescription', 'Descrição'],
                        ['showButton', 'Botão CTA'],
                        ['showComplementaryText', 'Texto extra'],
                        ['showBadge', 'Badge/Selo'],
                        ['showMedia', 'Mídia'],
                      ] as Array<[keyof WidgetVisualConfig, string]>).map(([key, label]) => (
                        <ToggleSwitch key={key} label={label} checked={Boolean(config[key])} onChange={(v) => update(key, v as never)} />
                      ))}
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <ToggleSwitch label="Botão largura total" checked={config.buttonFullWidth} onChange={(v) => update('buttonFullWidth', v)} />
                      <ToggleSwitch
                        label="Mídia clicável (CTA)"
                        checked={config.mediaClickableCta}
                        disabled={!config.showMedia || config.mediaType === 'none'}
                        onChange={(v) => update('mediaClickableCta', v)}
                      />
                    </div>

                    <label className="block text-xs font-medium text-slate-600">
                      Tipo de mídia
                      <select
                        value={config.mediaType}
                        disabled={!config.showMedia}
                        onChange={(e) => update('mediaType', e.target.value as WidgetVisualConfig['mediaType'])}
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        {mediaTypeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt === 'image' ? 'Imagem' : opt === 'video' ? 'Vídeo' : 'Nenhuma'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel
                  icon={<Paintbrush className="h-4 w-4" />}
                  title="Estilo"
                  expanded={expandedSections.has('style')}
                  onToggle={() => toggleSection('style')}
                >
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Variante visual</p>
                      <div className="grid grid-cols-3 gap-2">
                        {variantOptions.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => update('variant', v)}
                            className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all ${
                              config.variant === v
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {variantLabels[v]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <WidgetColorPresets
                      currentBg={config.backgroundColor}
                      currentText={config.textColor}
                      currentButton={config.buttonColor}
                      currentBorder={config.borderColor}
                      onApply={(s) => setConfig((prev) => ({ ...prev, backgroundColor: s.bg, textColor: s.text, buttonColor: s.button, borderColor: s.border }))}
                      onChangeColor={(key, value) => update(key, value)}
                    />

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sombra</p>
                      <div className="grid grid-cols-4 gap-2">
                        {shadowOptions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => update('shadow', s)}
                            className={`rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition ${
                              config.shadow === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {shadowLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsiblePanel>

                <CollapsiblePanel
                  icon={<Eye className="h-4 w-4" />}
                  title="Dimensões"
                  expanded={expandedSections.has('dimensions')}
                  onToggle={() => toggleSection('dimensions')}
                >
                  <div className="space-y-4">
                    <RangeControl label="Largura" value={config.width} min={WIDGET_LIMITS.width.min} max={WIDGET_LIMITS.width.max} step={10} unit="px" onChange={(v) => update('width', v)} />
                    <RangeControl label="Altura mínima" value={config.minHeight} min={WIDGET_LIMITS.minHeight.min} max={WIDGET_LIMITS.minHeight.max} step={10} unit="px" onChange={(v) => update('minHeight', v)} />
                    <RangeControl
                      label="Tamanho da mídia"
                      value={config.mediaSize}
                      min={WIDGET_LIMITS.mediaSize.min}
                      max={WIDGET_LIMITS.mediaSize.max}
                      unit="%"
                      disabled={mediaSizeDisabled}
                      onChange={(v) => update('mediaSize', v)}
                    />
                    <RangeControl label="Border radius" value={config.borderRadius} min={WIDGET_LIMITS.borderRadius.min} max={WIDGET_LIMITS.borderRadius.max} unit="px" onChange={(v) => update('borderRadius', v)} />
                    <RangeControl label="Padding" value={config.padding} min={WIDGET_LIMITS.padding.min} max={WIDGET_LIMITS.padding.max} unit="px" onChange={(v) => update('padding', v)} />
                  </div>
                </CollapsiblePanel>
              </>
            )}
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="flex flex-col">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Preview ao vivo</span>
              </div>
              <div className="flex items-center gap-2">
                {(['desktop', 'mobile'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPreviewViewport(mode)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      previewViewport === mode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {mode === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                    {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowFullscreenPreview(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex min-h-[620px] flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
              <WidgetPreviewFrame viewport={previewViewport} compactChrome={Boolean(selectedHtmlTemplate)}>
                {selectedHtmlTemplate ? (
                  <HtmlTemplateInlineEditorPreview
                    template={selectedHtmlTemplate}
                    css={generatedCss}
                    content={htmlContent}
                    fieldOverrides={htmlFieldOverrides}
                    hiddenElementIds={hiddenElementIds}
                    compact={previewViewport === 'mobile'}
                    fill
                    onFieldChange={updateHtmlFieldOverride}
                    onHideElement={hideHtmlElement}
                  />
                ) : (
                  <WidgetLivePreview config={config} viewport={previewViewport} />
                )}
              </WidgetPreviewFrame>
            </div>
          </div>
        </div>
      </form>

      {/* ── Fullscreen Preview Modal ── */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-white">Preview em tela cheia</h3>
              <p className="text-xs text-slate-400">Visualize o widget em um cenário real</p>
            </div>
            <div className="flex items-center gap-3">
              {(['desktop', 'mobile'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewViewport(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    previewViewport === mode ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {mode === 'desktop' ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                  {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowFullscreenPreview(false)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Fechar
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-auto p-8">
            <div className="w-full max-w-5xl">
              {/* Browser chrome */}
              <div className="rounded-t-2xl border border-b-0 border-slate-300 bg-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <div className="ml-4 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-slate-400">https://sua-loja.com.br/produto</div>
                </div>
              </div>

              {/* Simulated page */}
              <div className="rounded-b-2xl border border-slate-300 bg-white" style={{ minHeight: '70vh' }}>
                <div className="border-b border-slate-100 px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-slate-200" />
                    <div className="flex gap-6">
                      <div className="h-3 w-16 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-6 space-y-3">
                    <div className="h-4 w-2/5 rounded bg-slate-100" />
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>

                  <WidgetPreviewFrame viewport={previewViewport} fullscreen compactChrome={Boolean(selectedHtmlTemplate)}>
                    {selectedHtmlTemplate ? (
                      <HtmlTemplateInlineEditorPreview
                        template={selectedHtmlTemplate}
                        css={generatedCss}
                        content={htmlContent}
                        fieldOverrides={htmlFieldOverrides}
                        hiddenElementIds={hiddenElementIds}
                        compact={previewViewport === 'mobile'}
                        fill
                        onFieldChange={updateHtmlFieldOverride}
                        onHideElement={hideHtmlElement}
                      />
                    ) : (
                      <WidgetLivePreview config={config} viewport={previewViewport} />
                    )}
                  </WidgetPreviewFrame>

                  <div className="mt-8 space-y-3">
                    <div className="h-3 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Sub-Components ───

type CollapsiblePanelProps = {
  icon: React.ReactNode
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const CollapsiblePanel = ({ icon, title, expanded, onToggle, children }: CollapsiblePanelProps) => (
  <div className="border-b border-slate-100">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"
    >
      <span className="text-slate-400">{icon}</span>
      <span className="flex-1 text-sm font-bold text-slate-800">{title}</span>
      {expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
    </button>
    {expanded && <div className="px-5 pb-5">{children}</div>}
  </div>
)

const HtmlTemplateEditor = ({
  template,
  fieldOverrides,
  hiddenElementIds,
  hiddenItemsExpanded,
  expanded,
  onToggle,
  onFieldChange,
  onRestoreElement,
  onToggleHiddenItems,
}: {
  template: HtmlWidgetTemplate
  fieldOverrides: Record<string, string>
  hiddenElementIds: string[]
  hiddenItemsExpanded: boolean
  expanded: boolean
  onToggle: () => void
  onFieldChange: (fieldId: string, value: string) => void
  onRestoreElement: (elementId: string) => void
  onToggleHiddenItems: () => void
}) => {
  const linkFields = getHtmlWidgetTemplateEditableFields(template).filter((field) => field.type === 'url')
  const hideableElements = getHtmlWidgetTemplateHideableElements(template)
  const hiddenElements = hiddenElementIds.map((id) => (
    hideableElements.find((element) => element.id === id) ?? { id, label: 'Item oculto' }
  ))

  return (
    <>
      <div className="space-y-4 p-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              HTML preservado
            </span>
            {template.supportsScript ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                Script
              </span>
            ) : null}
          </div>
          <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">{template.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</p>
          <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            {template.categoryLabel}
          </div>
        </div>
      </div>

      <CollapsiblePanel
        icon={<SlidersHorizontal className="h-4 w-4" />}
        title="Ajustes"
        expanded={expanded}
        onToggle={onToggle}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            Edite textos, precos, nomes, rotulos e botoes clicando diretamente no preview.
          </div>

          {linkFields.length > 0 ? (
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Links</p>
              {linkFields.map((field) => (
                <TextField
                  key={field.id}
                  label={field.label}
                  type="url"
                  value={fieldOverrides[field.id] ?? ''}
                  placeholder={field.defaultValue}
                  onChange={(next) => onFieldChange(field.id, next)}
                />
              ))}
            </div>
          ) : null}

          {hiddenElements.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-rose-100 bg-rose-50 p-3">
              <button
                type="button"
                onClick={onToggleHiddenItems}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Itens ocultos ({hiddenElements.length})
                </span>
                {hiddenItemsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-rose-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-rose-500" />
                )}
              </button>
              {hiddenItemsExpanded ? (
                <div className="space-y-2">
                  {hiddenElements.map((element) => (
                    <div key={element.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                      <span className="min-w-0 truncate text-xs text-slate-600">{element.label}</span>
                      <button
                        type="button"
                        onClick={() => onRestoreElement(element.id)}
                        className="shrink-0 rounded-md border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-700">
            Campos vazios mantem o valor original do modelo.
          </div>

        </div>
      </CollapsiblePanel>
    </>
  )
}

const TextField = ({
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  type?: 'text' | 'url'
  onChange: (value: string) => void
}) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-slate-600">{label}</span>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
    />
  </label>
)

type ToggleSwitchProps = {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}

const ToggleSwitch = ({ label, checked, disabled, onChange }: ToggleSwitchProps) => (
  <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${checked ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'} ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50'}`}>
    <div
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        if (disabled) return
        e.preventDefault()
        onChange(!checked)
      }}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300'} ${disabled ? '' : 'cursor-pointer'}`}
    >
      <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </div>
    <span className="font-medium">{label}</span>
  </label>
)

type RangeControlProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit: string
  disabled?: boolean
  onChange: (v: number) => void
}

const RangeControl = ({ label, value, min, max, step = 1, unit, disabled, onChange }: RangeControlProps) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <label className={`block ${disabled ? 'opacity-40' : ''}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-700">
          {value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="widget-range-slider w-full"
        />
        <div className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-500" style={{ width: `${percentage}%` }} />
      </div>
    </label>
  )
}

export default WidgetBuilderForm
