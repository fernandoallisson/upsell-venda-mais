import { Eye, MapPin } from "lucide-react";
import type { Widget } from "../../../../types/widget";
import WidgetHtmlPreview from "../../../widgets/components/WidgetHtmlPreview";
import { DISPLAY_LOCATIONS } from "../constants";
import type { CampaignFormState } from "../types";
import { buildCampaignWidgetMarkup } from "../widgetPresetUtils";

type Props = {
  form: CampaignFormState;
  selectedWidgetPreset: Widget | null;
  fullscreen?: boolean;
};

const PreviewPanel = ({
  form,
  selectedWidgetPreset,
  fullscreen = false,
}: Props) => {
  const selectedLocations = DISPLAY_LOCATIONS.filter((loc) =>
    form.display_locations.includes(loc.key),
  );
  const firstLocation = selectedLocations[0];

  if (!selectedWidgetPreset) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 bg-white p-6 ${fullscreen ? "shadow-xl" : "shadow-sm"}`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">
              Preview em Tempo Real
            </p>
          </div>
        </div>
        <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
          Selecione um preset de widget para acompanhar um único preview em
          tempo real.
        </div>
      </section>
    );
  }

  const generated = buildCampaignWidgetMarkup(selectedWidgetPreset, form);

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 ${fullscreen ? "shadow-xl" : "shadow-sm"}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Preview em Tempo Real
            </p>
            <p className="text-xs text-slate-500">
              Este é o mesmo widget base que será duplicado para formar o
              payload final da campanha.
            </p>
          </div>
        </div>
        {firstLocation ? (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <MapPin className="h-3 w-3" />
            {firstLocation.label}
          </div>
        ) : null}
      </div>
      <WidgetHtmlPreview
        html={generated.html}
        css={generated.css}
        compact={!fullscreen}
      />
    </section>
  );
};

export default PreviewPanel;
