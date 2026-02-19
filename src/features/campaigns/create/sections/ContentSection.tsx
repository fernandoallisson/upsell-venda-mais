import { Image, Link, Video } from 'lucide-react'
import type { CampaignFormState } from '../types'

type Props = {
  form: CampaignFormState
  onSet: <K extends keyof CampaignFormState>(key: K, value: CampaignFormState[K]) => void
}

const ContentSection = ({ form, onSet }: Props) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
        2
      </span>
      <p className="text-sm font-semibold text-slate-800">Conteudo</p>
    </div>

    <div className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">Titulo</span>
        <input
          type="text"
          value={form.headline}
          onChange={(e) => onSet('headline', e.target.value)}
          placeholder="Oferta Especial!"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">Descricao</span>
        <textarea
          value={form.description}
          onChange={(e) => onSet('description', e.target.value)}
          placeholder="Aproveite 20% de desconto em produtos selecionados..."
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">URL da Imagem</span>
        <div className="relative">
          <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={form.image_url}
            onChange={(e) => onSet('image_url', e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
          />
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">URL do Video</span>
        <div className="relative">
          <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={form.video_url}
            onChange={(e) => onSet('video_url', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
          />
        </div>
      </label>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-600">Botao CTA</p>
        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs text-slate-500">Texto do botao</span>
            <input
              type="text"
              value={form.cta_text}
              onChange={(e) => onSet('cta_text', e.target.value)}
              placeholder="Texto do botao (ex: Comprar Agora)"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-slate-500">Link do botao</span>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.cta_link}
                onChange={(e) => onSet('cta_link', e.target.value)}
                placeholder="https://loja.com/oferta"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-300"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs text-slate-500">Comportamento do link</span>
            <select
              value={form.cta_new_tab ? 'new_tab' : 'same_tab'}
              onChange={(e) => onSet('cta_new_tab', e.target.value === 'new_tab')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
            >
              <option value="new_tab">Abrir em nova aba</option>
              <option value="same_tab">Abrir na mesma aba</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </section>
)

export default ContentSection
