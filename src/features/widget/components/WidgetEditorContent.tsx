import { ExternalLink, Image, Type } from 'lucide-react'
import type { WidgetFormState } from '../types'

type Props = {
  form: WidgetFormState
  onUpdate: <K extends keyof WidgetFormState>(key: K, value: WidgetFormState[K]) => void
}

const WidgetEditorContent = ({ form, onUpdate }: Props) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2">
      <Type className="h-4 w-4 text-slate-400" />
      <p className="text-sm font-semibold text-slate-700">Conteúdo</p>
    </div>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Nome da Campanha</span>
      <input
        type="text"
        value={form.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        placeholder="Nome da campanha"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Título</span>
      <input
        type="text"
        value={form.headline}
        onChange={(e) => onUpdate('headline', e.target.value)}
        placeholder="Oferta Especial!"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Subtítulo</span>
      <input
        type="text"
        value={form.subtitle}
        onChange={(e) => onUpdate('subtitle', e.target.value)}
        placeholder="Condição especial por tempo limitado"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Descrição</span>
      <textarea
        value={form.description}
        onChange={(e) => onUpdate('description', e.target.value)}
        placeholder="Aproveite 20% de desconto em produtos selecionados..."
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Selo badge</span>
      <input
        type="text"
        value={form.badge}
        onChange={(e) => onUpdate('badge', e.target.value)}
        placeholder="Oferta exclusiva"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">URL da Imagem ou vídeo</span>
      <div className="relative">
        <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={form.media_url}
          onChange={(e) => onUpdate('media_url', e.target.value)}
          placeholder="https://exemplo.com/midia.jpg"
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
        />
      </div>
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Botão CTA</span>
      <input
        type="text"
        value={form.cta_text}
        onChange={(e) => onUpdate('cta_text', e.target.value)}
        placeholder="Comprar Agora"
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      />
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Link do botão CTA</span>
      <div className="relative">
        <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={form.cta_link}
          onChange={(e) => onUpdate('cta_link', e.target.value)}
          placeholder="https://exemplo.com/oferta"
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
        />
      </div>
    </label>

    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500">Comportamento do botão</span>
      <select
        value={form.cta_new_tab ? 'new_tab' : 'same_tab'}
        onChange={(e) => onUpdate('cta_new_tab', e.target.value === 'new_tab')}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
      >
        <option value="same_tab">Abrir na mesma aba</option>
        <option value="new_tab">Abrir em nova aba</option>
      </select>
    </label>

    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
      O botão de fechar será exibido com o id fixo <code className="font-mono text-slate-700">upse-close</code>.
      Toda mídia ficará clicável e usará o mesmo link do CTA.
    </div>
  </div>
)

export default WidgetEditorContent
