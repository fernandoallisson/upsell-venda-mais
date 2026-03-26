import { Maximize2, Monitor, Smartphone, Tablet, X } from 'lucide-react'
import { useState } from 'react'
import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'
import { isVideoUrl } from '../utils/widgetMedia'

type Props = {
  form: WidgetFormState
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

const deviceWidths: Record<DeviceMode, string> = {
  desktop: 'max-w-sm',
  tablet: 'max-w-[280px]',
  mobile: 'max-w-[220px]',
}

const fullscreenDeviceWidths: Record<DeviceMode, string> = {
  desktop: 'max-w-2xl',
  tablet: 'max-w-md',
  mobile: 'max-w-xs',
}

const MediaPreview = ({ form, width, height }: { form: WidgetFormState; width: string | number; height?: string | number }) => {
  const hasMedia = Boolean(form.media_url)

  if (!hasMedia) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-slate-300" />
          <p className="mt-2 text-xs text-slate-400">Mídia da oferta</p>
        </div>
      </div>
    )
  }

  if (isVideoUrl(form.media_url)) {
    return (
      <video
        src={form.media_url}
        muted
        playsInline
        controls={false}
        style={{ width, height, objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none' }}
      />
    )
  }

  return (
    <img
      src={form.media_url}
      alt="Pré-visualização"
      style={{ width, height, objectFit: 'cover' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

const Badge = ({ form }: Props) => form.badge ? (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: form.colors.accent,
      color: form.colors.buttonText,
      borderRadius: 999,
      padding: '4px 10px',
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 10,
    }}
  >
    {form.badge}
  </span>
) : null

const Subtitle = ({ form }: Props) => form.subtitle ? (
  <p style={{ color: form.colors.text, opacity: 0.65, fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
    {form.subtitle}
  </p>
) : null

const CloseButton = ({ form }: Props) => form.layout.showDismiss ? (
  <button
    id="upse-close"
    type="button"
    style={{
      color: form.colors.text,
      opacity: 0.45,
      fontSize: 18,
      lineHeight: 1,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      marginLeft: 12,
      alignSelf: 'flex-start',
    }}
  >
    ×
  </button>
) : null

const CtaButton = ({ form, fullWidth = true }: { form: WidgetFormState; fullWidth?: boolean }) => (
  <button
    type="button"
    style={{
      backgroundColor: form.colors.button,
      color: form.colors.buttonText,
      fontSize: form.typography.ctaSize,
      fontWeight: 600,
      borderRadius: Math.max(8, form.spacing.borderRadius - 4),
      padding: '10px 16px',
      width: fullWidth ? '100%' : undefined,
      border: 'none',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap',
    }}
  >
    {form.cta_text || 'Comprar agora'}
  </button>
)

const ClassicCard = ({ form }: Props) => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity]

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        borderRadius: spacing.borderRadius,
        border: layout.borderWidth > 0 ? `${layout.borderWidth}px solid ${colors.border}` : 'none',
        boxShadow: shadow,
        overflow: 'hidden',
      }}
    >
      {layout.imagePosition !== 'none' && (
        <MediaPreview form={form} width="100%" height={layout.imageHeight} />
      )}

      <div style={{ padding: spacing.padding, display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Badge form={form} />
          <p
            style={{
              color: colors.text,
              fontSize: typography.headlineSize,
              fontWeight: typography.headlineWeight,
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {form.headline || <span className="text-slate-300">Título da oferta</span>}
          </p>

          <Subtitle form={form} />

          <p
            style={{
              color: colors.text,
              fontSize: typography.descriptionSize,
              fontWeight: typography.descriptionWeight,
              opacity: 0.75,
              marginTop: 8,
              marginBottom: 0,
              lineHeight: 1.5,
            }}
          >
            {form.description || <span className="text-slate-300">Descrição da oferta...</span>}
          </p>

          <div style={{ marginTop: spacing.gap }}>
            <CtaButton form={form} />
          </div>
        </div>

        <CloseButton form={form} />
      </div>
    </div>
  )
}

const CompactCard = ({ form }: Props) => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity]

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        borderRadius: spacing.borderRadius,
        border: layout.borderWidth > 0 ? `${layout.borderWidth}px solid ${colors.border}` : 'none',
        boxShadow: shadow,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {layout.imagePosition !== 'none' && (
        <MediaPreview form={form} width={layout.imageHeight} height="100%" />
      )}

      <div style={{ padding: spacing.padding, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <Badge form={form} />
        <p style={{ color: colors.text, fontSize: typography.headlineSize, fontWeight: typography.headlineWeight, lineHeight: 1.3, margin: 0 }}>
          {form.headline || <span className="text-slate-300">Título</span>}
        </p>
        <Subtitle form={form} />
        <p style={{ color: colors.text, fontSize: typography.descriptionSize, opacity: 0.7, lineHeight: 1.4, margin: 0 }}>
          {form.description || <span className="text-slate-300">Descrição...</span>}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <CtaButton form={form} fullWidth={false} />
          <CloseButton form={form} />
        </div>
      </div>
    </div>
  )
}

const BannerCard = ({ form }: Props) => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity]

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        borderRadius: spacing.borderRadius,
        border: layout.borderWidth > 0 ? `${layout.borderWidth}px solid ${colors.border}` : 'none',
        boxShadow: shadow,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {layout.imagePosition !== 'none' && (
        <div style={{ margin: 12, flexShrink: 0 }}>
          <MediaPreview form={form} width={80} height={80} />
        </div>
      )}

      <div style={{ flex: 1, padding: `${spacing.padding / 2}px ${spacing.padding}px` }}>
        <Badge form={form} />
        <p style={{ color: colors.text, fontSize: typography.headlineSize, fontWeight: typography.headlineWeight, lineHeight: 1.3, margin: 0 }}>
          {form.headline || <span className="text-slate-300">Título</span>}
        </p>
        <Subtitle form={form} />
        <p style={{ color: colors.text, fontSize: typography.descriptionSize, opacity: 0.7, lineHeight: 1.4, marginTop: 4, marginBottom: 0 }}>
          {form.description || <span className="text-slate-300">Descrição...</span>}
        </p>
      </div>

      <div style={{ padding: spacing.padding, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <CtaButton form={form} fullWidth={false} />
        <CloseButton form={form} />
      </div>
    </div>
  )
}

const renderCard = (form: WidgetFormState) => {
  switch (form.template) {
    case 'compact':
    case 'minimal':
      return <CompactCard form={form} />
    case 'banner':
      return <BannerCard form={form} />
    case 'bold':
    case 'floating':
    case 'classic':
    default:
      return <ClassicCard form={form} />
  }
}

const DeviceSelector = ({ device, onChange }: { device: DeviceMode; onChange: (d: DeviceMode) => void }) => (
  <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-1">
    {([
      { key: 'desktop', icon: Monitor },
      { key: 'tablet', icon: Tablet },
      { key: 'mobile', icon: Smartphone },
    ] as const).map(({ key, icon: Icon }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`rounded-lg p-2 transition ${device === key ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    ))}
  </div>
)

const FullscreenPreviewModal = ({ form, device, onDeviceChange, onClose }: { form: WidgetFormState; device: DeviceMode; onDeviceChange: (d: DeviceMode) => void; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm">
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div>
        <h3 className="text-base font-semibold text-white">Preview em tela cheia</h3>
        <p className="text-xs text-slate-400">Visualize o widget como aparecerá em um cenário real</p>
      </div>
      <div className="flex items-center gap-3">
        <DeviceSelector device={device} onChange={onDeviceChange} />
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
          Fechar
        </button>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-center overflow-auto p-8">
      <div className="w-full max-w-5xl">
        {/* Simulated browser chrome */}
        <div className="rounded-t-2xl border border-b-0 border-slate-300 bg-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="ml-4 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-slate-400">
              https://sua-loja.com.br/produto
            </div>
          </div>
        </div>

        {/* Simulated page content */}
        <div className="rounded-b-2xl border border-slate-300 bg-white" style={{ minHeight: '70vh' }}>
          {/* Fake page header */}
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

          {/* Fake page body with widget */}
          <div className="p-8">
            <div className="mb-6 space-y-3">
              <div className="h-4 w-2/5 rounded bg-slate-100" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>

            <div className={`mx-auto transition-all ${fullscreenDeviceWidths[device]}`}>
              {renderCard(form)}
            </div>

            <div className="mt-8 space-y-3">
              <div className="h-3 w-2/3 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const WidgetPreview = ({ form }: Props) => {
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [showFullscreen, setShowFullscreen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Pré-visualização</p>
          <p className="text-xs text-slate-500">A mídia sempre usará o link do CTA e o fechamento usa o id upse-close.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFullscreen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Tela cheia
          </button>
          <DeviceSelector device={device} onChange={setDevice} />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
        <div className={`mx-auto transition-all ${deviceWidths[device]}`}>
          {renderCard(form)}
        </div>
      </div>

      {showFullscreen && (
        <FullscreenPreviewModal
          form={form}
          device={device}
          onDeviceChange={setDevice}
          onClose={() => setShowFullscreen(false)}
        />
      )}
    </div>
  )
}

export default WidgetPreview
