import { Eye, MapPin } from 'lucide-react'
import { DISPLAY_LOCATIONS } from '../constants'
import type { CampaignFormState } from '../types'

type Props = {
  form: CampaignFormState
  fullscreen?: boolean
}

const PreviewPanel = ({ form, fullscreen = false }: Props) => {
  const firstLocation = DISPLAY_LOCATIONS.find((loc) =>
    form.display_locations.includes(loc.key),
  )

  const hasImage = Boolean(form.image_url)
  const hasHeadline = Boolean(form.headline)
  const hasDescription = Boolean(form.description)
  const hasCta = Boolean(form.cta_text)

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
        fullscreen ? 'p-8' : 'p-6'
      }`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-semibold text-slate-800">Preview em Tempo Real</p>
        </div>
        {firstLocation && (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <MapPin className="h-3 w-3" />
            {firstLocation.label}
          </div>
        )}
      </div>

      <div
        className={`mx-auto ${
          fullscreen ? 'max-w-md' : 'max-w-xs'
        }`}
      >
        <div
          className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg"
          style={{ backgroundColor: form.colors.bg }}
        >
          {hasImage ? (
            <img
              src={form.image_url}
              alt="Preview"
              className="h-40 w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-slate-300" />
                <p className="mt-2 text-xs text-slate-400">Imagem da oferta</p>
              </div>
            </div>
          )}

          <div className="p-5">
            <p
              className={`font-bold leading-snug ${
                fullscreen ? 'text-lg' : 'text-base'
              }`}
              style={{ color: form.colors.text }}
            >
              {hasHeadline ? form.headline : (
                <span className="text-slate-300">Titulo da oferta</span>
              )}
            </p>

            {(hasDescription || !hasHeadline) && (
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: form.colors.text, opacity: 0.75 }}
              >
                {hasDescription ? form.description : (
                  <span className="text-slate-300">
                    Descricao da sua oferta aparecera aqui...
                  </span>
                )}
              </p>
            )}

            <div className="mt-4 space-y-2">
              <button
                type="button"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                style={{
                  backgroundColor: form.colors.button,
                  color: form.colors.buttonText,
                }}
              >
                {hasCta ? form.cta_text : 'Comprar Agora'}
              </button>
              <button
                type="button"
                className="w-full py-1.5 text-xs transition"
                style={{ color: form.colors.text, opacity: 0.5 }}
              >
                Nao, obrigado
              </button>
            </div>
          </div>
        </div>

        {!hasHeadline && !hasDescription && !hasCta && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Preencha os campos de conteudo para ver o preview
          </p>
        )}
      </div>
    </section>
  )
}

export default PreviewPanel
