import { useCallback } from "react";
import { Badge, Image, Link, Type, Video } from "lucide-react";
import type { Widget } from "../../../../types/widget";
import type { CampaignFormState } from "../types";
import CollapsibleSection from "../../../../components/layout/CollapsibleSection";
import FileUploadField from "../components/FileUploadField";
import {
  uploadImage,
  uploadVideo,
} from "../../../../lib/services/uploads/uploads.service";
import { getVisibleFieldsFromWidget } from "../widgetPresetUtils";

type Props = {
  form: CampaignFormState;
  selectedWidgetPreset: Widget | null;
  onSet: <K extends keyof CampaignFormState>(
    key: K,
    value: CampaignFormState[K],
  ) => void;
};

const ContentSection = ({ form, selectedWidgetPreset, onSet }: Props) => {
  const handleUploadImage = useCallback(
    async (file: File) => ({ url: (await uploadImage(file)).url }),
    [],
  );
  const handleUploadVideo = useCallback(
    async (file: File) => ({ url: (await uploadVideo(file)).url }),
    [],
  );
  const fields = getVisibleFieldsFromWidget(selectedWidgetPreset);

  if (!selectedWidgetPreset) {
    return (
      <CollapsibleSection number={2} title="Conteúdo" defaultOpen={true}>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Escolha primeiro um preset de widget para liberar apenas os campos que
          esse layout utiliza.
        </div>
      </CollapsibleSection>
    );
  }

  return (
    <CollapsibleSection number={2} title="Conteúdo" defaultOpen={true}>
      <div className="space-y-4">
        {fields.showTitle ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">Título</span>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.headline}
                onChange={(e) => onSet("headline", e.target.value)}
                placeholder="Oferta Especial!"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
              />
            </div>
          </label>
        ) : null}
        {fields.showSubtitle ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Subtítulo
            </span>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => onSet("subtitle", e.target.value)}
              placeholder="Oferta por tempo limitado"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
            />
          </label>
        ) : null}
        {fields.showDescription ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Descrição
            </span>
            <textarea
              value={form.description}
              onChange={(e) => onSet("description", e.target.value)}
              placeholder="Aproveite 20% de desconto em produtos selecionados..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
            />
          </label>
        ) : null}
        {fields.showBadge ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Selo / badge
            </span>
            <div className="relative">
              <Badge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.badge_text}
                onChange={(e) => onSet("badge_text", e.target.value)}
                placeholder="20% OFF"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
              />
            </div>
          </label>
        ) : null}
        {fields.showComplementaryText ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-600">
              Texto complementar
            </span>
            <input
              type="text"
              value={form.complementary_text}
              onChange={(e) => onSet("complementary_text", e.target.value)}
              placeholder="Frete grátis para todo Brasil"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
            />
          </label>
        ) : null}
        {fields.showMedia && fields.mediaType === "image" ? (
          <FileUploadField
            label="URL da imagem"
            value={form.image_url}
            onChange={(url) => onSet("image_url", url)}
            onUpload={handleUploadImage}
            accept="image/*"
            icon={
              <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            }
            placeholder="https://exemplo.com/imagem.jpg"
            preview="image"
          />
        ) : null}
        {fields.showMedia && fields.mediaType === "video" ? (
          <FileUploadField
            label="URL do vídeo"
            value={form.video_url}
            onChange={(url) => onSet("video_url", url)}
            onUpload={handleUploadVideo}
            accept="video/*"
            icon={
              <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            }
            placeholder="https://youtube.com/watch?v=..."
            preview="video"
          />
        ) : null}
        {fields.showButton ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold text-slate-600">
              Botão CTA
            </p>
            <div className="space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs text-slate-500">Texto do botão</span>
                <input
                  type="text"
                  value={form.cta_text}
                  onChange={(e) => onSet("cta_text", e.target.value)}
                  placeholder="Comprar agora"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-slate-500">Link do botão</span>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.cta_link}
                    onChange={(e) => onSet("cta_link", e.target.value)}
                    placeholder="https://loja.com/oferta"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-300"
                  />
                </div>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-slate-500">
                  Comportamento do link
                </span>
                <select
                  value={form.cta_new_tab ? "new_tab" : "same_tab"}
                  onChange={(e) =>
                    onSet("cta_new_tab", e.target.value === "new_tab")
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-300"
                >
                  <option value="new_tab">Abrir em nova aba</option>
                  <option value="same_tab">Abrir na mesma aba</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </div>
    </CollapsibleSection>
  );
};

export default ContentSection;
