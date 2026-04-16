import { Check } from 'lucide-react'
import { layoutOptions, layoutLabels, type WidgetLayout } from '../types/widgetTemplate'

type Props = {
  value: WidgetLayout
  onChange: (layout: WidgetLayout) => void
}

/**
 * Mini SVG thumbnails representing each layout visually
 */
const LayoutThumbnail = ({ layout, active }: { layout: WidgetLayout; active: boolean }) => {
  const accent = active ? '#2563eb' : '#94a3b8'
  const fill = active ? '#dbeafe' : '#e2e8f0'
  const bg = active ? '#eff6ff' : '#f8fafc'

  const thumbnails: Record<WidgetLayout, JSX.Element> = {
    'media-left': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="5" width="24" height="34" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="32" y="8" width="20" height="3" rx="1" fill={accent} />
        <rect x="32" y="14" width="28" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="32" y="19" width="24" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="32" y="28" width="16" height="6" rx="2" fill={accent} />
      </svg>
    ),
    'media-right': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="36" y="5" width="24" height="34" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="4" y="8" width="20" height="3" rx="1" fill={accent} />
        <rect x="4" y="14" width="28" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="4" y="19" width="24" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="4" y="28" width="16" height="6" rx="2" fill={accent} />
      </svg>
    ),
    'media-top': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="4" width="56" height="16" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="4" y="24" width="24" height="3" rx="1" fill={accent} />
        <rect x="4" y="30" width="40" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="4" y="35" width="16" height="5" rx="2" fill={accent} />
      </svg>
    ),
    'media-bottom': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="5" width="24" height="3" rx="1" fill={accent} />
        <rect x="4" y="11" width="40" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="4" y="16" width="16" height="5" rx="2" fill={accent} />
        <rect x="4" y="24" width="56" height="16" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
      </svg>
    ),
    'text-only': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="14" y="7" width="36" height="4" rx="1" fill={accent} />
        <rect x="10" y="15" width="44" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="14" y="20" width="36" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="16" y="25" width="32" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="20" y="32" width="24" height="6" rx="2" fill={accent} />
      </svg>
    ),
    'image-only': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={fill} stroke={accent} strokeWidth="1" />
        <circle cx="20" cy="15" r="5" fill={accent} opacity="0.3" />
        <polygon points="10,35 28,18 40,28 50,20 58,30 58,38 6,38" fill={accent} opacity="0.2" />
      </svg>
    ),
    'image-button': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="4" width="56" height="24" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="4" y="31" width="16" height="3" rx="1" fill={accent} />
        <rect x="4" y="36" width="20" height="5" rx="2" fill={accent} />
      </svg>
    ),
    'video-text': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="4" width="56" height="20" rx="3" fill="#1e293b" />
        <polygon points="28,10 28,20 37,15" fill="white" />
        <rect x="4" y="28" width="24" height="3" rx="1" fill={accent} />
        <rect x="4" y="34" width="40" height="2" rx="1" fill={accent} opacity="0.3" />
      </svg>
    ),
    'video-button': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="4" width="56" height="22" rx="3" fill="#1e293b" />
        <polygon points="28,11 28,21 37,16" fill="white" />
        <rect x="4" y="30" width="16" height="3" rx="1" fill={accent} />
        <rect x="4" y="36" width="24" height="5" rx="2" fill={accent} />
      </svg>
    ),
    'card-horizontal': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="6" width="22" height="32" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="30" y="10" width="20" height="3" rx="1" fill={accent} />
        <rect x="30" y="16" width="28" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="30" y="21" width="22" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="30" y="30" width="14" height="5" rx="2" fill={accent} />
      </svg>
    ),
    'card-vertical': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="8" y="3" width="48" height="16" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="8" y="22" width="28" height="3" rx="1" fill={accent} />
        <rect x="8" y="28" width="40" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="8" y="34" width="20" height="5" rx="2" fill={accent} />
      </svg>
    ),
    banner: (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="12" width="62" height="20" rx="10" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="6" y="15" width="10" height="14" rx="4" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="20" y="18" width="14" height="3" rx="1" fill={accent} />
        <rect x="20" y="23" width="20" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="44" y="17" width="14" height="8" rx="4" fill={accent} />
      </svg>
    ),
    modal: (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="0" y="0" width="64" height="44" fill="#0f172a" opacity="0.15" rx="4" />
        <rect x="8" y="4" width="48" height="36" rx="6" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="12" y="8" width="40" height="12" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="12" y="24" width="20" height="3" rx="1" fill={accent} />
        <rect x="12" y="30" width="16" height="5" rx="2" fill={accent} />
      </svg>
    ),
    toast: (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="0" y="0" width="64" height="44" rx="4" fill="transparent" />
        <rect x="16" y="12" width="44" height="22" rx="5" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="20" y="16" width="10" height="14" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="33" y="17" width="14" height="2" rx="1" fill={accent} />
        <rect x="33" y="22" width="20" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="33" y="27" width="10" height="4" rx="1.5" fill={accent} />
      </svg>
    ),
    'promo-block': (
      <svg viewBox="0 0 64 44" className="h-full w-full">
        <rect x="1" y="1" width="62" height="42" rx="4" fill={bg} stroke={accent} strokeWidth="1" />
        <rect x="4" y="5" width="24" height="34" rx="3" fill={fill} stroke={accent} strokeWidth="0.5" />
        <rect x="32" y="5" width="12" height="4" rx="2" fill={accent} />
        <rect x="32" y="12" width="20" height="3" rx="1" fill={accent} />
        <rect x="32" y="18" width="28" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="32" y="23" width="24" height="2" rx="1" fill={accent} opacity="0.3" />
        <rect x="32" y="32" width="18" height="6" rx="2" fill={accent} />
      </svg>
    ),
  }

  return thumbnails[layout] || thumbnails['media-left']
}

const WidgetLayoutPicker = ({ value, onChange }: Props) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
    {layoutOptions.map((layout) => {
      const active = value === layout
      return (
        <button
          key={layout}
          type="button"
          onClick={() => onChange(layout)}
          title={layoutLabels[layout]}
          className={`group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
            active
              ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="h-9 w-full">
            <LayoutThumbnail layout={layout} active={active} />
          </div>
          <span className={`text-[10px] font-semibold leading-tight text-center ${active ? 'text-blue-700' : 'text-slate-500'}`}>
            {layoutLabels[layout]}
          </span>
          {active && (
            <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
          )}
        </button>
      )
    })}
  </div>
)

export default WidgetLayoutPicker
