import type { WidgetConfig } from "../../../types/widget";
import {
  defaultWidgetVisualConfig,
  MOCK_WIDGET_CONTENT,
  WIDGET_LIMITS,
  type WidgetVisualConfig,
} from "../types/widgetTemplate";
import { layoutPresetDefinitions } from "./layoutPresetDefinitions";

const esc = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Convert a px value to a responsive clamp() using vw (calibrated at 1440px viewport) */
const rVw = (px: number): string => {
  const vw = +(px / 14.4).toFixed(2);
  const min = Math.round(px * 0.7);
  const max = Math.round(px * 1.2);
  return `clamp(${min}px, ${vw}vw, ${max}px)`;
};

/** Convert a px value to a responsive clamp() using vh (calibrated at 900px viewport) */
const rVh = (px: number): string => {
  const vh = +(px / 9).toFixed(2);
  const min = Math.round(px * 0.65);
  const max = Math.round(px * 1.25);
  return `clamp(${min}px, ${vh}vh, ${max}px)`;
};

/** Convert a font-size px value to a responsive clamp() */
const rFont = (px: number): string => {
  const vw = +(px / 14.4).toFixed(2);
  const min = Math.max(10, Math.round(px * 0.8));
  const max = Math.round(px * 1.15);
  return `clamp(${min}px, ${vw}vw, ${max}px)`;
};

const buildCtaAttrs = (content?: WidgetTemplateContent) => {
  const href = content?.ctaLink?.trim() || "#";
  const target = content?.ctaNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `href="${esc(href)}"${target}`;
};

const shadowMap: Record<WidgetVisualConfig["shadow"], string> = {
  none: "none",
  sm: "0 2px 10px rgba(15,23,42,.12)",
  md: "0 10px 28px rgba(15,23,42,.18)",
  lg: "0 18px 44px rgba(15,23,42,.28)",
};

const variantStyles: Record<
  WidgetVisualConfig["variant"],
  {
    cardBackground: string;
    bodyColor: string;
    titleWeight: string;
    titleTransform: string;
    titleSpacing: string;
    buttonRadius: string;
    buttonWeight: string;
    buttonTransform: string;
    buttonSpacing: string;
    badgeRadius: string;
    badgeWeight: string;
    badgeTransform: string;
    badgeSpacing: string;
  }
> = {
  modern: {
    cardBackground: "var(--widget-bg)",
    bodyColor: "var(--widget-text)",
    titleWeight: "700",
    titleTransform: "none",
    titleSpacing: "-0.015em",
    buttonRadius: "12px",
    buttonWeight: "600",
    buttonTransform: "none",
    buttonSpacing: "normal",
    badgeRadius: "999px",
    badgeWeight: "700",
    badgeTransform: "none",
    badgeSpacing: "normal",
  },
  minimal: {
    cardBackground: "var(--widget-bg)",
    bodyColor: "#64748b",
    titleWeight: "600",
    titleTransform: "none",
    titleSpacing: "-0.01em",
    buttonRadius: "8px",
    buttonWeight: "500",
    buttonTransform: "none",
    buttonSpacing: "normal",
    badgeRadius: "8px",
    badgeWeight: "600",
    badgeTransform: "none",
    badgeSpacing: "normal",
  },
  premium: {
    cardBackground: "linear-gradient(135deg,#020617,#0f172a,#18181b)",
    bodyColor: "#e2e8f0",
    titleWeight: "600",
    titleTransform: "none",
    titleSpacing: "0.02em",
    buttonRadius: "999px",
    buttonWeight: "600",
    buttonTransform: "uppercase",
    buttonSpacing: "0.04em",
    badgeRadius: "999px",
    badgeWeight: "700",
    badgeTransform: "uppercase",
    badgeSpacing: "0.04em",
  },
  promotional: {
    cardBackground: "linear-gradient(90deg,#fef3c7,#ffe4e6)",
    bodyColor: "#334155",
    titleWeight: "800",
    titleTransform: "uppercase",
    titleSpacing: "0.03em",
    buttonRadius: "10px",
    buttonWeight: "800",
    buttonTransform: "uppercase",
    buttonSpacing: "0.03em",
    badgeRadius: "10px",
    badgeWeight: "900",
    badgeTransform: "uppercase",
    badgeSpacing: "0.04em",
  },
  glass: {
    cardBackground:
      "linear-gradient(135deg, rgba(56,189,248,.25), rgba(99,102,241,.25))",
    bodyColor: "rgba(255,255,255,.92)",
    titleWeight: "600",
    titleTransform: "none",
    titleSpacing: "normal",
    buttonRadius: "12px",
    buttonWeight: "600",
    buttonTransform: "none",
    buttonSpacing: "normal",
    badgeRadius: "999px",
    badgeWeight: "600",
    badgeTransform: "none",
    badgeSpacing: "normal",
  },
  bold: {
    cardBackground: "#0f172a",
    bodyColor: "#f1f5f9",
    titleWeight: "900",
    titleTransform: "uppercase",
    titleSpacing: "0.03em",
    buttonRadius: "0",
    buttonWeight: "900",
    buttonTransform: "uppercase",
    buttonSpacing: "0.05em",
    badgeRadius: "0",
    badgeWeight: "900",
    badgeTransform: "uppercase",
    badgeSpacing: "0.05em",
  },
};

export const normalizeWidgetConfig = (
  config: WidgetConfig | null | undefined,
): WidgetVisualConfig => {
  const source =
    config?.attributes && typeof config.attributes === "object"
      ? (config.attributes as Record<string, unknown>)
      : config && typeof config === "object"
        ? (config as unknown as Record<string, unknown>)
        : {};
  const normalized: WidgetVisualConfig = {
    ...defaultWidgetVisualConfig,
    ...source,
  };

  if ("showMedia" in source === false && source.mediaType === "none")
    normalized.showMedia = false;
  if (
    typeof source.mediaWidth === "number" &&
    typeof source.mediaSize !== "number"
  )
    normalized.mediaSize = source.mediaWidth;

  const forcedMedia = layoutPresetDefinitions[normalized.layout].forceMediaType;
  if (forcedMedia) {
    normalized.mediaType = forcedMedia;
    normalized.showMedia = forcedMedia !== "none";
  }

  if (!normalized.showMedia) normalized.mediaType = "none";
  if (normalized.mediaType === "none") normalized.mediaClickableCta = false;

  // Clamp dimensions to safe responsive limits
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  normalized.width = clamp(normalized.width, WIDGET_LIMITS.width.min, WIDGET_LIMITS.width.max);
  normalized.minHeight = clamp(normalized.minHeight, WIDGET_LIMITS.minHeight.min, WIDGET_LIMITS.minHeight.max);
  normalized.mediaSize = clamp(normalized.mediaSize, WIDGET_LIMITS.mediaSize.min, WIDGET_LIMITS.mediaSize.max);
  normalized.borderRadius = clamp(normalized.borderRadius, WIDGET_LIMITS.borderRadius.min, WIDGET_LIMITS.borderRadius.max);
  normalized.padding = clamp(normalized.padding, WIDGET_LIMITS.padding.min, WIDGET_LIMITS.padding.max);

  return normalized;
};

const mediaBeforeLayouts = new Set<WidgetVisualConfig["layout"]>([
  "media-left",
  "media-top",
  "card-horizontal",
  "card-vertical",
  "banner",
  "modal",
  "toast",
  "promo-block",
  "video-text",
  "image-only",
  "image-button",
  "video-button",
]);

const renderMediaHtml = (
  config: WidgetVisualConfig,
  content?: WidgetTemplateContent,
) => {
  if (!config.showMedia || config.mediaType === "none") return "";

  const mediaUrl = content?.mediaUrl?.trim();
  const mediaContent = mediaUrl
    ? config.mediaType === "video"
      ? `<video class="widget-template__media-asset" src="${esc(mediaUrl)}" muted playsinline controls></video>`
      : `<img class="widget-template__media-asset" src="${esc(mediaUrl)}" alt="Mídia do widget" />`
    : config.mediaType === "video"
      ? '<div class="widget-template__media-placeholder widget-template__media-placeholder--video">▶ Vídeo demonstrativo</div>'
      : '<div class="widget-template__media-placeholder widget-template__media-placeholder--image">Imagem do template</div>';

  const media = `<div class="widget-template__media">${mediaContent}</div>`;
  if (!config.mediaClickableCta) return media;

  return `<a class="widget-template__media-link" ${buildCtaAttrs(content)} aria-label="Mídia clicável como CTA">${media}</a>`;
};

export type WidgetTemplateContent = {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  rejectText: string;
  badgeText: string;
  extraText: string;
  mediaUrl?: string;
  ctaLink?: string;
  ctaNewTab?: boolean;
};

const renderContentHtml = (
  config: WidgetVisualConfig,
  content: WidgetTemplateContent,
) => {
  if (config.layout === "image-only") return "";
  const c = content;

  const acceptBtn = config.showButton
    ? `<a id="upse-accept" class="widget-template__button ${config.buttonFullWidth ? "widget-template__button--full" : ""}" ${buildCtaAttrs(c)}>${esc(c.buttonText)}</a>`
    : "";
  const rejectBtn = config.showButton
    ? `<button id="upse-reject" class="widget-template__reject">${esc(c.rejectText)}</button>`
    : "";

  return `<div class="widget-template__content">
    ${config.showBadge ? `<span class="widget-template__badge">${esc(c.badgeText)}</span>` : ""}
    ${config.showTitle ? `<h3 class="widget-template__title">${esc(c.title)}</h3>` : ""}
    ${config.showSubtitle ? `<p class="widget-template__subtitle">${esc(c.subtitle)}</p>` : ""}
    ${config.showDescription ? `<p class="widget-template__description">${esc(c.description)}</p>` : ""}
    ${config.showComplementaryText ? `<p class="widget-template__extra">${esc(c.extraText)}</p>` : ""}
    ${acceptBtn || rejectBtn ? `<div class="widget-template__actions">${acceptBtn}${rejectBtn}</div>` : ""}
  </div>`;
};

export const generateWidgetHtml = (
  config: WidgetVisualConfig,
  content: Partial<WidgetTemplateContent> = {},
) => {
  const resolvedContent: WidgetTemplateContent = {
    ...MOCK_WIDGET_CONTENT,
    ...content,
  };
  const media = renderMediaHtml(config, resolvedContent);
  const contentHtml = renderContentHtml(config, resolvedContent);
  const mediaBefore = mediaBeforeLayouts.has(config.layout);
  const closeBtn = `<button id="upse-close" class="widget-template__close" aria-label="Fechar">&times;</button>`;

  return `<div class="widget-template widget-template--${config.layout} widget-template--${config.variant}">${closeBtn}${mediaBefore ? media : ""}${contentHtml}${mediaBefore ? "" : media}</div>`;
};

const getFlexDirection = (layout: WidgetVisualConfig["layout"]) => {
  switch (layout) {
    case "media-right":
      return "row-reverse";
    case "media-top":
    case "card-vertical":
    case "video-text":
    case "modal":
    case "image-only":
    case "image-button":
    case "video-button":
      return "column";
    case "media-bottom":
      return "column-reverse";
    default:
      return "row";
  }
};

export const generateWidgetCss = (config: WidgetVisualConfig) => {
  const preset = layoutPresetDefinitions[config.layout];
  const variant = variantStyles[config.variant];
  const toastPadding = Math.max(14, Math.round(config.padding * 0.65));
  const mobileMediaWidth = preset.supportsMediaSize
    ? `${Math.min(58, Math.max(32, config.mediaSize))}%`
    : "100%";
  const desktopMediaWidth = preset.supportsMediaSize
    ? `${config.mediaSize}%`
    : "100%";

  const mobilePadding = config.layout === "toast" ? Math.round(toastPadding * 0.8) : Math.round(config.padding * 0.75);
  const mobileMinHeight = config.layout === "toast" ? 90 : Math.round(config.minHeight * 0.75);
  const desktopPadding = config.layout === "toast" ? toastPadding : config.padding;
  const desktopMinHeight = config.layout === "toast" ? 110 : config.minHeight;

  // Mobile-first: base styles are for mobile, then scale up with min-width media query
  return `/* Mobile-first responsive styles (vh/vw units with clamp) */
.widget-template {
  --widget-bg: ${config.backgroundColor};
  --widget-text: ${config.textColor};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${rVw(12)};
  width: 100%;
  max-width: 100%;
  min-height: ${rVh(mobileMinHeight)};
  margin: 0 auto;
  padding: ${rVw(mobilePadding)};
  border-radius: ${config.layout === "banner" ? "999px" : rVw(config.borderRadius)};
  border: 1px solid ${config.borderColor};
  background: ${variant.cardBackground};
  color: ${variant.bodyColor};
  box-shadow: ${shadowMap[config.shadow]};
  overflow: hidden;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-sizing: border-box;
}
.widget-template__close {
  position: absolute;
  top: ${rVw(8)};
  right: ${rVw(8)};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${rVw(28)};
  height: ${rVw(28)};
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  color: ${config.textColor};
  font-size: ${rFont(18)};
  line-height: 1;
  cursor: pointer;
  z-index: 2;
  transition: background 0.15s;
}
.widget-template__close:hover {
  background: rgba(0, 0, 0, 0.15);
}
.widget-template__media {
  width: ${mobileMediaWidth};
  min-height: ${rVh(config.layout === "toast" ? 60 : 120)};
  border-radius: ${rVw(Math.max(config.borderRadius - 4, 8))};
  overflow: hidden;
  background: #e2e8f0;
}
.widget-template__media-asset {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.widget-template__media-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: ${rVh(120)};
  padding: ${rVw(10)};
  font-size: ${rFont(13)};
  font-weight: 700;
  text-align: center;
}
.widget-template__media-placeholder--image {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  color: #334155;
}
.widget-template__media-placeholder--video {
  background: #0f172a;
  color: #fff;
}
.widget-template__media-link {
  display: block;
  text-decoration: none;
  color: inherit;
}
.widget-template__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: ${rVw(6)};
}
.widget-template__badge {
  width: max-content;
  padding: ${rVw(3)} ${rVw(8)};
  border-radius: ${variant.badgeRadius};
  background: ${config.buttonColor};
  color: #fff;
  font-size: ${rFont(10)};
  font-weight: ${variant.badgeWeight};
  text-transform: ${variant.badgeTransform};
  letter-spacing: ${variant.badgeSpacing};
}
.widget-template__title {
  margin: 0;
  font-size: ${rFont(18)};
  font-weight: ${variant.titleWeight};
  text-transform: ${variant.titleTransform};
  letter-spacing: ${variant.titleSpacing};
  line-height: 1.25;
}
.widget-template__subtitle {
  margin: 0;
  font-size: ${rFont(11)};
  opacity: 0.8;
}
.widget-template__description {
  margin: 0;
  font-size: ${rFont(13)};
  line-height: 1.45;
}
.widget-template__extra {
  margin: 0;
  font-size: ${rFont(11)};
  opacity: 0.75;
}
.widget-template__actions {
  display: flex;
  flex-direction: column;
  gap: ${rVw(8)};
  margin-top: ${rVw(6)};
}
.widget-template__button {
  width: 100%;
  max-width: 100%;
  padding: ${rVw(10)} ${rVw(16)};
  border: none;
  border-radius: ${variant.buttonRadius};
  background: ${config.buttonColor};
  color: #fff;
  font-size: ${rFont(12)};
  font-weight: ${variant.buttonWeight};
  text-transform: ${variant.buttonTransform};
  letter-spacing: ${variant.buttonSpacing};
  cursor: pointer;
  text-align: center;
}
.widget-template__button--full {
  width: 100%;
}
.widget-template__reject {
  width: 100%;
  padding: ${rVw(8)} ${rVw(12)};
  border: none;
  border-radius: ${variant.buttonRadius};
  background: transparent;
  color: ${variant.bodyColor};
  font-size: ${rFont(11)};
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.widget-template__reject:hover {
  opacity: 1;
}
.widget-template--modal {
  max-width: 88vw;
}
.widget-template--toast {
  max-width: 100%;
}
.widget-template--glass {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Desktop styles (min-width: 768px) */
@media (min-width: 768px) {
  .widget-template {
    flex-direction: ${getFlexDirection(config.layout)};
    gap: ${rVw(16)};
    max-width: ${rVw(config.width)};
    min-height: ${rVh(desktopMinHeight)};
    padding: ${rVw(desktopPadding)};
  }
  .widget-template__media {
    width: ${desktopMediaWidth};
    min-height: ${rVh(config.layout === "toast" ? 72 : 140)};
    border-radius: ${rVw(Math.max(config.borderRadius - 4, 10))};
  }
  .widget-template__media-asset {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .widget-template__media-placeholder {
    min-height: ${rVh(140)};
    padding: ${rVw(12)};
    font-size: ${rFont(14)};
  }
  .widget-template__content {
    gap: ${rVw(8)};
  }
  .widget-template__badge {
    padding: ${rVw(4)} ${rVw(10)};
    font-size: ${rFont(11)};
  }
  .widget-template__title {
    font-size: ${rFont(24)};
    line-height: 1.2;
  }
  .widget-template__subtitle {
    font-size: ${rFont(12)};
  }
  .widget-template__description {
    font-size: ${rFont(14)};
  }
  .widget-template__extra {
    font-size: ${rFont(12)};
  }
  .widget-template__actions {
    flex-direction: row;
    align-items: center;
    gap: ${rVw(10)};
  }
  .widget-template__button {
    width: max-content;
  }
  .widget-template__button--full {
    width: 100%;
  }
  .widget-template__reject {
    width: auto;
  }
  .widget-template--modal {
    max-width: min(${rVw(config.width)}, 88vw);
  }
  .widget-template--toast {
    max-width: ${rVw(360)};
  }
}
`;
};
