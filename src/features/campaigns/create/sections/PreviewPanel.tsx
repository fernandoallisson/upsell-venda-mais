import { Eye, MapPin } from 'lucide-react'
import { DISPLAY_LOCATIONS } from '../constants'
import type { CampaignFormState } from '../types'

type Props = {
  form: CampaignFormState
  fullscreen?: boolean
}

type CardProps = {
  form: CampaignFormState
  size?: 'sm' | 'md'
}

const OfferCard = ({ form, size = 'md' }: CardProps) => {
  const hasImage = Boolean(form.image_url)
  const hasHeadline = Boolean(form.headline)
  const hasDescription = Boolean(form.description)
  const hasCta = Boolean(form.cta_text)

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg"
      style={{ backgroundColor: form.colors.bg }}
    >
      {hasImage ? (
        <img
          src={form.image_url}
          alt="Preview"
          className={`w-full object-cover ${size === 'sm' ? 'h-28' : 'h-40'}`}
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div
          className={`flex w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 ${size === 'sm' ? 'h-24' : 'h-36'}`}
        >
          <div className="text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-slate-300" />
            <p className="mt-2 text-xs text-slate-400">Imagem da oferta</p>
          </div>
        </div>
      )}

      <div className={size === 'sm' ? 'p-3' : 'p-5'}>
        <p
          className={`font-bold leading-snug ${size === 'sm' ? 'text-sm' : 'text-base'}`}
          style={{ color: form.colors.text }}
        >
          {hasHeadline ? (
            form.headline
          ) : (
            <span className="text-slate-300">Titulo da oferta</span>
          )}
        </p>

        {(hasDescription || !hasHeadline) && (
          <p
            className="mt-1.5 text-xs leading-relaxed"
            style={{ color: form.colors.text, opacity: 0.75 }}
          >
            {hasDescription ? (
              form.description
            ) : (
              <span className="text-slate-300">
                Descricao da sua oferta aparecera aqui...
              </span>
            )}
          </p>
        )}

        <div className={`space-y-1.5 ${size === 'sm' ? 'mt-3' : 'mt-4'}`}>
          <button
            type="button"
            className="w-full rounded-xl px-4 py-2 text-xs font-semibold transition"
            style={{
              backgroundColor: form.colors.button,
              color: form.colors.buttonText,
            }}
          >
            {hasCta ? form.cta_text : 'Comprar Agora'}
          </button>
          <button
            type="button"
            className="w-full py-1 text-xs transition"
            style={{ color: form.colors.text, opacity: 0.5 }}
          >
            Nao, obrigado
          </button>
        </div>
      </div>
    </div>
  )
}

const ModalWrapper = ({ form }: { form: CampaignFormState }) => (
  <div className="relative flex items-end justify-center rounded-xl bg-slate-900/60 p-4 pb-6" style={{ minHeight: 260 }}>
    <div className="w-full max-w-xs">
      <OfferCard form={form} size="md" />
    </div>
  </div>
)

const InlineWrapper = ({ form }: { form: CampaignFormState }) => (
  <div className="rounded-xl bg-white p-3">
    <div className="mb-2 h-6 w-32 rounded-md bg-slate-100" />
    <div className="mb-2 h-4 w-24 rounded bg-slate-100" />
    <OfferCard form={form} size="sm" />
    <div className="mt-2 h-4 w-16 rounded bg-slate-100" />
  </div>
)

const LOCATION_TYPES: Record<string, 'modal' | 'inline'> = {
  product_page: 'modal',
  side_cart: 'inline',
  cart_page: 'modal',
  pre_checkout: 'inline',
  post_purchase: 'modal',
}

const PreviewPanel = ({ form, fullscreen = false }: Props) => {
  const selectedLocations = DISPLAY_LOCATIONS.filter((loc) =>
    form.display_locations.includes(loc.key),
  )

  const firstLocation = selectedLocations[0]

  if (fullscreen) {
    const locationsToShow =
      selectedLocations.length > 0 ? selectedLocations : DISPLAY_LOCATIONS

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">
            Preview por Local de Exibicao
          </p>
        </div>

        <div className="space-y-6">
          {locationsToShow.map((loc) => {
            const type = LOCATION_TYPES[loc.key] ?? 'modal'
            return (
              <div key={loc.key}>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <MapPin className="h-3 w-3" />
                    {loc.label}
                  </div>
                  <span className="text-xs text-slate-400">{loc.widgetType}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  {type === 'modal' ? (
                    <ModalWrapper form={form} />
                  ) : (
                    <InlineWrapper form={form} />
                  )}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">{loc.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">
            Preview em Tempo Real
          </p>
        </div>
        {firstLocation && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <MapPin className="h-3 w-3" />
            {firstLocation.label}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-xs">
        <OfferCard form={form} size="md" />

        {!form.headline && !form.description && !form.cta_text && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Preencha os campos de conteudo para ver o preview
          </p>
        )}
      </div>
    </section>
  )
}

export default PreviewPanel
