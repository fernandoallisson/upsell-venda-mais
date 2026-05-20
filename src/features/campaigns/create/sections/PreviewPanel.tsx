import { useState } from "react";
import { Eye, MapPin, Monitor, Smartphone, Maximize2, X } from "lucide-react";
import type { Widget } from "../../../../types/widget";
import WidgetHtmlPreview from "../../../widgets/components/WidgetHtmlPreview";
import WidgetPreviewFrame from "../../../widgets/components/WidgetPreviewFrame";
import { isHtmlWidgetTemplateConfig } from "../../../widgets/utils/htmlWidgetTemplateGenerator";
import { DISPLAY_LOCATIONS } from "../constants";
import type { CampaignFormState } from "../types";
import { buildCampaignWidgetMarkup } from "../widgetPresetUtils";

type Props = {
  form: CampaignFormState;
  selectedWidgetPreset: Widget | null;
};

const PreviewPanel = ({ form, selectedWidgetPreset }: Props) => {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [fullscreen, setFullscreen] = useState(false);

  const selectedLocations = DISPLAY_LOCATIONS.filter((loc) =>
    form.display_locations.includes(loc.key),
  );
  const firstLocation = selectedLocations[0];

  const emptyState = (
    <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <div>
        <Eye className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-400">
          Selecione um template de widget
        </p>
        <p className="mt-1 text-xs text-slate-400">
          O preview aparecerá aqui em tempo real
        </p>
      </div>
    </div>
  );

  const generated = selectedWidgetPreset
    ? buildCampaignWidgetMarkup(selectedWidgetPreset, form)
    : null;
  const allowScripts = isHtmlWidgetTemplateConfig(selectedWidgetPreset?.config?.attributes)
    ? selectedWidgetPreset.config.attributes.supportsScript
    : false;

  const previewContent = generated ? (
    <WidgetPreviewFrame viewport={viewport} compactChrome>
      <WidgetHtmlPreview
        html={generated.html}
        css={generated.css}
        compact={viewport === "mobile"}
        allowScripts={allowScripts}
        fill
      />
    </WidgetPreviewFrame>
  ) : (
    emptyState
  );

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Preview</span>
            {firstLocation && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                <MapPin className="h-2.5 w-2.5" />
                {firstLocation.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {(["desktop", "mobile"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewport(mode)}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
                  viewport === mode
                    ? "bg-slate-900 text-white"
                    : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                {mode === "desktop" ? (
                  <Monitor className="h-3 w-3" />
                ) : (
                  <Smartphone className="h-3 w-3" />
                )}
              </button>
            ))}
            {generated && (
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="ml-1 flex items-center rounded-md border border-slate-200 px-1.5 py-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Preview area */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-4">
          {previewContent}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && generated && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-white">Preview da Campanha</h3>
              <p className="text-xs text-slate-400">Visualize como o widget aparecerá</p>
            </div>
            <div className="flex items-center gap-3">
              {(["desktop", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewport(mode)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    viewport === mode
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {mode === "desktop" ? <Monitor className="h-3.5 w-3.5" /> : <Smartphone className="h-3.5 w-3.5" />}
                  {mode === "desktop" ? "Desktop" : "Mobile"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Fechar
              </button>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center overflow-auto p-8">
            <WidgetPreviewFrame viewport={viewport} fullscreen compactChrome>
              <WidgetHtmlPreview
                html={generated.html}
                css={generated.css}
                compact={viewport === "mobile"}
                allowScripts={allowScripts}
                fill
              />
            </WidgetPreviewFrame>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewPanel;
