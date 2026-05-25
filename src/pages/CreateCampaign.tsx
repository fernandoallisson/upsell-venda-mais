import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
import CampaignWidgetCreateModal from "../features/campaigns/create/components/CampaignWidgetCreateModal";

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
    addAndSelectWidgetPreset,
    setWidgetRenderType,
  } = useCreateCampaignForm();

  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [createWidgetOpen, setCreateWidgetOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<PanelSection>("info");

  const openTourRef = useRef<(() => void) | null>(null);
  const handleTourOpen = useCallback((fn: () => void) => {
    openTourRef.current = fn;
  }, []);

  const selectedWidgetPreset =
    widgetPresets.find((widget) => widget.id === form.widget_preset_id) ?? null;

  const isValid = form.name.trim().length > 0;

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
    <div className="campaign-editor flex min-h-screen flex-col bg-slate-50 md:h-screen md:min-h-0 md:overflow-hidden">
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
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(300px,40%)_1fr] lg:grid-cols-[420px_1fr]">
        {/* ── Left: Controls Panel ── */}
        <div className="campaign-editor-controls border-r border-slate-200 bg-white md:min-h-0 md:overflow-hidden">
          <nav className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 p-2">
            {sectionConfig.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition ${
                  activeSection === section.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
          {sectionConfig.map((section) => {
            const Icon = section.icon;
            const expanded = activeSection === section.key;

            return (
              <div
                key={section.key}
                id={section.tourId}
                className={expanded ? "block" : "hidden"}
              >
                <div className="flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3 text-left">
                  <span className="text-slate-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-bold text-slate-800">
                    {section.label}
                  </span>
                </div>

                {expanded && (
                  <div className="campaign-editor-step px-5 py-4">
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
                        onOpenCreateWidget={() => setCreateWidgetOpen(true)}
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

      <CampaignWidgetCreateModal
        open={createWidgetOpen}
        onClose={() => setCreateWidgetOpen(false)}
        onCreated={addAndSelectWidgetPreset}
      />
    </div>
  );
};

export default CreateCampaign;
