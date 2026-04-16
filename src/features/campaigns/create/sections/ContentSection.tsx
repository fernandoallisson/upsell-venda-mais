import { useCallback } from "react";
import { Badge, Image, Link, Type, Video } from "lucide-react";
import type { Widget } from "../../../../types/widget";
import type { CampaignFormState } from "../types";
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
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200">
          <Type className="h-4 w-4 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">
          Escolha um template de widget na seção Configuração para liberar os campos de conteúdo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fields.showTitle && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">Título</span>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={form.headline}
              onChange={(e) => onSet("headline", e.target.value)}
              placeholder="Oferta Especial!"
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
            />
          </div>
        </label>
      )}
      {fields.showSubtitle && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">Subtítulo</span>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => onSet("subtitle", e.target.value)}
            placeholder="Oferta por tempo limitado"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
          />
        </label>
      )}
      {fields.showDescription && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">Descrição</span>
          <textarea
            value={form.description}
            onChange={(e) => onSet("description", e.target.value)}
            placeholder="Aproveite 20% de desconto em produtos selecionados..."
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
          />
        </label>
      )}
      {fields.showBadge && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">Selo / badge</span>
          <div className="relative">
            <Badge className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={form.badge_text}
              onChange={(e) => onSet("badge_text", e.target.value)}
              placeholder="20% OFF"
              className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
            />
          </div>
        </label>
      )}
      {fields.showComplementaryText && (
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">Texto complementar</span>
          <input
            type="text"
            value={form.complementary_text}
            onChange={(e) => onSet("complementary_text", e.target.value)}
            placeholder="Frete grátis para todo Brasil"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
          />
        </label>
      )}
      {fields.showMedia && fields.mediaType === "image" && (
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
      )}
      {fields.showMedia && fields.mediaType === "video" && (
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
      )}
      {fields.showButton && (
        <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-600">Botão CTA</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-500">Texto</span>
              <input
                type="text"
                value={form.cta_text}
                onChange={(e) => onSet("cta_text", e.target.value)}
                placeholder="Comprar agora"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] text-slate-500">Comportamento</span>
              <select
                value={form.cta_new_tab ? "new_tab" : "same_tab"}
                onChange={(e) => onSet("cta_new_tab", e.target.value === "new_tab")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
              >
                <option value="new_tab">Nova aba</option>
                <option value="same_tab">Mesma aba</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-[11px] text-slate-500">Link do botão</span>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={form.cta_link}
                onChange={(e) => onSet("cta_link", e.target.value)}
                placeholder="https://loja.com/oferta"
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-300"
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
};

export default ContentSection;
