import { Image, Type } from 'lucide-react'
import type { WidgetFormState } from '../types'

type Props = {
  form: WidgetFormState
  onUpdate: <K extends keyof WidgetFormState>(key: K, value: WidgetFormState[K]) => void
}

const WidgetEditorContent = ({ form, onUpdate }: Props) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2">
      <Type className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">Conteudo</p>
    </div>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Titulo</span>
      <input
        type="text"
        value={form.headline}
        onChange={(e) => onUpdate('headline', e.target.value)}
        placeholder="Oferta Especial!"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Descricao</span>
      <textarea
        value={form.description}
        onChange={(e) => onUpdate('description', e.target.value)}
        placeholder="Aproveite 20% de desconto em produtos selecionados..."
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">URL da Imagem</span>
      <div className="relative">
        <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => onUpdate('image_url', e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
        />
      </div>
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Texto do Botao CTA</span>
      <input
        type="text"
        value={form.cta_text}
        onChange={(e) => onUpdate('cta_text', e.target.value)}
        placeholder="Comprar Agora"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>
  </div>
)

export default WidgetEditorContent