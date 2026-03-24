import type { Widget } from "../../../types/widget";
import {
  defaultWidgetVisualConfig,
  type WidgetVisualConfig,
} from "../../widgets/types/widgetTemplate";
import {
  generateWidgetCss,
  generateWidgetHtml,
  normalizeWidgetConfig,
} from "../../widgets/utils/widgetTemplateGenerator";
import type { CampaignFormState } from "./types";

const widgetMarkupDependentFields: Array<keyof CampaignFormState> = [
  "headline",
  "subtitle",
  "description",
  "complementary_text",
  "badge_text",
  "image_url",
  "video_url",
  "cta_text",
  "cta_link",
  "cta_new_tab",
];

export const getWidgetPresetConfig = (
  widget: Widget | null | undefined,
): WidgetVisualConfig => {
  if (!widget) return defaultWidgetVisualConfig;
  return normalizeWidgetConfig(widget.config);
};

export const buildCampaignWidgetMarkup = (
  widget: Widget | null | undefined,
  form: CampaignFormState,
) => {
  const config = getWidgetPresetConfig(widget);
  const mediaUrl =
    config.mediaType === "video"
      ? form.video_url.trim()
      : form.image_url.trim();

  return {
    config,
    css: generateWidgetCss(config),
    html: generateWidgetHtml(config, {
      title: form.headline || "Título da campanha",
      subtitle: form.subtitle || "Subtítulo da campanha",
      description: form.description || "Descreva sua oferta para o cliente.",
      buttonText: form.cta_text || "Comprar agora",
      badgeText: form.badge_text || "Oferta",
      extraText: form.complementary_text || "Texto complementar da campanha",
      mediaUrl,
      ctaLink: form.cta_link,
      ctaNewTab: form.cta_new_tab,
    }),
  };
};

export const getVisibleFieldsFromWidget = (
  widget: Widget | null | undefined,
) => {
  const config = getWidgetPresetConfig(widget);
  return {
    showTitle: config.showTitle,
    showSubtitle: config.showSubtitle,
    showDescription: config.showDescription,
    showButton: config.showButton,
    showComplementaryText: config.showComplementaryText,
    showBadge: config.showBadge,
    showMedia: config.showMedia && config.mediaType !== "none",
    mediaType: config.mediaType,
  };
};

export const syncCampaignWidgetMarkup = (
  form: CampaignFormState,
  widget: Widget | null | undefined,
) => {
  if (!form.widget_preset_id || !widget) return form;

  const generated = buildCampaignWidgetMarkup(widget, form);

  return {
    ...form,
    widget_html: generated.html,
    widget_css: generated.css,
  };
};

export const shouldSyncCampaignWidgetMarkup = (
  key: keyof CampaignFormState,
) => widgetMarkupDependentFields.includes(key);
