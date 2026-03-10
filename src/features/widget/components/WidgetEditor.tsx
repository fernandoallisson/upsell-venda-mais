import { useState } from 'react'
import { Code, Loader2, Save } from 'lucide-react'
import type { Campaign } from '../../../lib/services/campaigns/campaigns.types'
import { updateCampaign } from '../../../lib/services/campaigns/campaigns.service'
import { ApiError } from '../../../lib/api'
import { useWidgetEditor } from '../hooks/useWidgetEditor'
import WidgetEditorTemplates from './WidgetEditorTemplates'
import WidgetEditorColors from './WidgetEditorColors'
import WidgetEditorSpacing from './WidgetEditorSpacing'
import WidgetEditorContent from './WidgetEditorContent'
import WidgetPreview from './WidgetPreview'

type Tab = 'template' | 'content' | 'colors' | 'layout' | 'code'

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'template', label: 'Modelo' },
  { key: 'content', label: 'Conteudo' },
  { key: 'colors', label: 'Cores' },
  { key: 'layout', label: 'Layout' },
  { key: 'code', label: 'Codigo' },
]

type Props = {
  campaign: Campaign
  onSaved?: () => void
  onBack: () => void
}

const WidgetEditor = ({ campaign, onSaved, onBack }: Props) => {
  const editor = useWidgetEditor(campaign)
  const [activeTab, setActiveTab] = useState<Tab>('template')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus('idle')
    setSaveError(null)

    try {
      await updateCampaign(campaign.id, {
        name: campaign.name,
        headline: editor.form.headline || undefined,
        description: editor.form.description || undefined,
        image_url: editor.form.image_url || undefined,
        cta_text: editor.form.cta_text || undefined,
        widget_css: editor.form.widget_css || undefined,
        widget_html: editor.form.widget_html || undefined,
      })
      editor.markClean()
      setSaveStatus('success')
      onSaved?.()
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Erro ao salvar widget')
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
          >
            &larr; Voltar para campanhas
          </button>
          <h2 className="text-lg font-semibold text-slate-900">
            Widget: {campaign.name}
          </h2>
          <p className="text-xs text-slate-500">
            Personalize o widget visual desta campanha
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="text-xs font-semibold text-emerald-600">Salvo com sucesso</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs font-semibold text-rose-600">{saveError}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Widget
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {activeTab === 'template' && (
            <WidgetEditorTemplates
              selected={editor.form.template}
              onSelect={editor.setTemplate}
            />
          )}

          {activeTab === 'content' && (
            <WidgetEditorContent
              form={editor.form}
              onUpdate={editor.update}
            />
          )}

          {activeTab === 'colors' && (
            <WidgetEditorColors
              colors={editor.form.colors}
              onSetColor={editor.setColor}
              onSetAllColors={editor.setAllColors}
            />
          )}

          {activeTab === 'layout' && (
            <WidgetEditorSpacing
              spacing={editor.form.spacing}
              typography={editor.form.typography}
              layout={editor.form.layout}
              onSetSpacing={editor.setSpacing}
              onSetTypography={editor.setTypography}
              onSetLayout={editor.setLayout}
            />
          )}

          {activeTab === 'code' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">CSS e HTML Customizado</p>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">CSS Customizado</span>
                <textarea
                  value={editor.form.widget_css}
                  onChange={(e) => editor.update('widget_css', e.target.value)}
                  placeholder=".widget-container { ... }"
                  rows={8}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-xs text-emerald-400 outline-none transition placeholder:text-slate-600 focus:border-blue-300"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-semibold text-slate-500">HTML Customizado</span>
                <textarea
                  value={editor.form.widget_html}
                  onChange={(e) => editor.update('widget_html', e.target.value)}
                  placeholder="<div class='widget-container'>...</div>"
                  rows={8}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 font-mono text-xs text-emerald-400 outline-none transition placeholder:text-slate-600 focus:border-blue-300"
                />
              </label>
            </div>
          )}
        </div>

        <div className="sticky top-6 self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <WidgetPreview form={editor.form} />
        </div>
      </div>
    </div>
  )
}

export default WidgetEditor
