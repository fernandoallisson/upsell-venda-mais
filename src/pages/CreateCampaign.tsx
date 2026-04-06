import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Loader2,
  Save,
  Settings,
  FileText,
  Calendar,
  Repeat,
} from "lucide-react";
import { ApiError } from "../lib/api";
import { createCampaign } from "../lib/services/campaigns/campaigns.service";
import { useCreateCampaignForm } from "../features/campaigns/create/hooks/useCreateCampaignForm";
import {
  buildCampaignPayload,
  validateCampaignForm,
} from "../features/campaigns/create/utils";
import BasicInfoSection from "../features/campaigns/create/sections/BasicInfoSection";
import ContentSection from "../features/campaigns/create/sections/ContentSection";
import ScheduleSection from "../features/campaigns/create/sections/ScheduleSection";
import FrequencySection from "../features/campaigns/create/sections/FrequencySection";
import PreviewPanel from "../features/campaigns/create/sections/PreviewPanel";
import CampaignTour from "../features/campaigns/tour/CampaignTour";

type PanelSection = "info" | "content" | "schedule" | "frequency";

const sectionConfig: Array<{
  key: PanelSection;
  label: string;
  icon: typeof Settings;
  tourId?: string;
}> = [
  { key: "info", label: "Configuração", icon: Settings, tourId: "tour-info-basicas" },
  { key: "content", label: "Conteúdo", icon: FileText, tourId: "tour-conteudo" },
  { key: "schedule", label: "Período", icon: Calendar, tourId: "tour-periodo" },
  { key: "frequency", label: "Frequência", icon: Repeat, tourId: "tour-frequencia" },
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const {
    form,
    set,
    segments,
    widgetPresets,
    resourcesLoading,
    toggleDisplayLocation,
    toggleSegment,
    toggleDay,
    toggleHour,
    setAllHours,
    clearHours,
    selectWidgetPreset,
    setWidgetRenderType,
  } = useCreateCampaignForm();

  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<PanelSection>>(
    new Set(["info", "content"]),
  );

  const openTourRef = useRef<(() => void) | null>(null);
  const handleTourOpen = useCallback((fn: () => void) => {
    openTourRef.current = fn;
  }, []);

  const selectedWidgetPreset =
    widgetPresets.find((widget) => widget.id === form.widget_preset_id) ?? null;

  const isValid = form.name.trim().length > 0;

  const toggleSection = (section: PanelSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleSave = async () => {
    if (!isValid) return;
    const formValidationError = validateCampaignForm(form);
    if (formValidationError) {
      setSaveError(formValidationError);
      setSaveStatus("error");
      return;
    }
    setSaveStatus("loading");
    setSaveError(null);

    try {
      const payload = buildCampaignPayload(form);
      await createCampaign(payload);
      setSaveStatus("idle");
      navigate("/upsell/campanhas");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Erro ao criar campanha.";
      setSaveError(message);
      setSaveStatus("error");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <CampaignTour onOpen={handleTourOpen} />

      {/* ── Top Bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/upsell/campanhas")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Nova Campanha</h1>
            <p className="text-xs text-slate-400">
              Configure e visualize em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openTourRef.current?.()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Tour
          </button>

          {saveStatus === "error" && saveError && (
            <span className="max-w-xs truncate rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {saveError}
            </span>
          )}

          <button
            id="tour-acoes"
            type="button"
            onClick={handleSave}
            disabled={!isValid || saveStatus === "loading"}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saveStatus === "loading" ? "Salvando..." : "Salvar Campanha"}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {resourcesLoading && (
        <div className="flex shrink-0 items-center justify-center border-b border-slate-200 bg-blue-50 py-2">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Carregando recursos...
          </div>
        </div>
      )}

      {/* ── Main Editor: Sidebar + Preview ── */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[420px_1fr]">
        {/* ── Left: Controls Panel ── */}
        <div className="overflow-y-auto border-r border-slate-200 bg-white">
          {sectionConfig.map((section) => {
            const Icon = section.icon;
            const expanded = expandedSections.has(section.key);

            return (
              <div
                key={section.key}
                id={section.tourId}
                className="border-b border-slate-100"
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"
                >
                  <span className="text-slate-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-slate-800">
                    {section.label}
                  </span>
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {/* Section body */}
                {expanded && (
                  <div className="px-5 pb-5">
                    {section.key === "info" && (
                      <BasicInfoSection
                        form={form}
                        segments={segments}
                        widgetPresets={widgetPresets}
                        widgetPresetsLoading={resourcesLoading}
                        onSet={set}
                        onToggleLocation={toggleDisplayLocation}
                        onToggleSegment={toggleSegment}
                        onSelectWidgetPreset={selectWidgetPreset}
                        onSetWidgetRenderType={setWidgetRenderType}
                      />
                    )}
                    {section.key === "content" && (
                      <ContentSection
                        form={form}
                        selectedWidgetPreset={selectedWidgetPreset}
                        onSet={set}
                      />
                    )}
                    {section.key === "schedule" && (
                      <ScheduleSection
                        form={form}
                        onSet={set}
                        onToggleDay={toggleDay}
                        onToggleHour={toggleHour}
                        onSelectAllHours={setAllHours}
                        onClearHours={clearHours}
                      />
                    )}
                    {section.key === "frequency" && (
                      <FrequencySection form={form} onSet={set} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Right: Live Preview ── */}
        <PreviewPanel form={form} selectedWidgetPreset={selectedWidgetPreset} />
      </div>
    </div>
  );
};

export default CreateCampaign;
