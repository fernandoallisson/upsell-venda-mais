import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { useState } from 'react'
import { SHADOW_MAP } from '../constants'
import type { WidgetFormState } from '../types'

type Props = {
  form: WidgetFormState
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

const deviceWidths: Record<DeviceMode, string> = {
  desktop: 'max-w-sm',
  tablet: 'max-w-[280px]',
  mobile: 'max-w-[220px]',
}

const ClassicCard = ({ form }: Props) => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity]
  const hasImage = Boolean(form.image_url)

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
        hasImage ? (
          <img
            src={form.image_url}
            alt="Pré-visualização"
            style={{ height: layout.imageHeight, width: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div
            className="flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
            style={{ height: layout.imageHeight }}
          >
            <div className="text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-slate-300" />
              <p className="mt-2 text-xs text-slate-400">Imagem da oferta</p>
            </div>
          </div>
        )
      )}

      <div style={{ padding: spacing.padding }}>
        <p
          style={{
            color: colors.text,
            fontSize: typography.headlineSize,
            fontWeight: typography.headlineWeight,
            lineHeight: 1.3,
          }}
        >
          {form.headline || <span className="text-slate-300">Título da oferta</span>}
        </p>

        <p
          style={{
            color: colors.text,
            fontSize: typography.descriptionSize,
            fontWeight: typography.descriptionWeight,
            opacity: 0.75,
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          {form.description || <span className="text-slate-300">Descrição da oferta...</span>}
        </p>

        <div style={{ marginTop: spacing.gap }}>
          <button
            type="button"
            style={{
              backgroundColor: colors.button,
              color: colors.buttonText,
              fontSize: typography.ctaSize,
              fontWeight: 600,
              borderRadius: Math.max(8, spacing.borderRadius - 4),
              padding: '10px 16px',
              width: '100%',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {form.cta_text || 'Comprar agora'}
          </button>

          {layout.showDismiss && (
            <button
              type="button"
              style={{
                color: colors.text,
                opacity: 0.4,
                fontSize: 12,
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                marginTop: 4,
              }}
            >
              {layout.dismissText || 'Não, obrigado'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const CompactCard = ({ form }: Props) => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity]
  const hasImage = Boolean(form.image_url)

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
        hasImage ? (
          <img
            src={form.image_url}
            alt="Pré-visualização"
            style={{ width: layout.imageHeight, objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div
            className="flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"
            style={{ width: layout.imageHeight }}
          >
            <div className="mx-auto h-8 w-8 rounded-full bg-slate-300" />
          </div>
        )
      )}

      <div style={{ padding: spacing.padding, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
        <p style={{ color: colors.text, fontSize: typography.headlineSize, fontWeight: typography.headlineWeight, lineHeight: 1.3 }}>
          {form.headline || <span className="text-slate-300">Título</span>}
        </p>
        <p style={{ color: colors.text, fontSize: typography.descriptionSize, opacity: 0.7, lineHeight: 1.4 }}>
          {form.description || <span className="text-slate-300">Descrição...</span>}
        </p>
        <button
          type="button"
          style={{
            backgroundColor: colors.button,
            color: colors.buttonText,
            fontSize: typography.ctaSize,
            fontWeight: 600,
            borderRadius: Math.max(6, spacing.borderRadius - 4),
            padding: '8px 14px',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {form.cta_text || 'Comprar agora'}
        </button>
      </div>
    </div>
  )
}

const BannerCard = ({ form }: Props) => {
  const { colors, spacing, typography, layout } = form
  const shadow = SHADOW_MAP[layout.shadowIntensity]
  const hasImage = Boolean(form.image_url)

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
      {hasImage && (
        <img
          src={form.image_url}
          alt="Pré-visualização"
          style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0, margin: 12, borderRadius: 8 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}

      <div style={{ flex: 1, padding: `${spacing.padding / 2}px ${spacing.padding}px` }}>
        <p style={{ color: colors.text, fontSize: typography.headlineSize, fontWeight: typography.headlineWeight, lineHeight: 1.3 }}>
          {form.headline || <span className="text-slate-300">Título</span>}
        </p>
        <p style={{ color: colors.text, fontSize: typography.descriptionSize, opacity: 0.7, lineHeight: 1.4, marginTop: 4 }}>
          {form.description || <span className="text-slate-300">Descrição...</span>}
        </p>
      </div>

      <div style={{ padding: spacing.padding, flexShrink: 0 }}>
        <button
          type="button"
          style={{
            backgroundColor: colors.button,
            color: colors.buttonText,
            fontSize: typography.ctaSize,
            fontWeight: 600,
            borderRadius: Math.max(6, spacing.borderRadius - 4),
            padding: '10px 20px',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {form.cta_text || 'Comprar'}
        </button>
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

const WidgetPreview = ({ form }: Props) => {
  const [device, setDevice] = useState<DeviceMode>('desktop')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Pré-visualização</p>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          {([
            { key: 'desktop' as DeviceMode, icon: Monitor },
            { key: 'tablet' as DeviceMode, icon: Tablet },
            { key: 'mobile' as DeviceMode, icon: Smartphone },
          ]).map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              className={`rounded-md p-1.5 transition ${
                device === key
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center rounded-xl border border-slate-100 bg-slate-50 p-6">
        <div className={`w-full transition-all duration-300 ${deviceWidths[device]}`}>
          {renderCard(form)}
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/60 p-6">
        <p className="mb-3 text-center text-xs font-semibold text-white/60">Pré-visualização Modal</p>
        <div className="flex justify-center">
          <div className={`w-full transition-all duration-300 ${deviceWidths[device]}`}>
            {renderCard(form)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WidgetPreview
