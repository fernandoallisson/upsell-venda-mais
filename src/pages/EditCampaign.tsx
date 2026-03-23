import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  Maximize2,
  Save,
  X,
} from "lucide-react";
import { ApiError } from "../lib/api";
import {
  getCampaignById,
  updateCampaign,
} from "../lib/services/campaigns/campaigns.service";
import type { Campaign } from "../lib/services/campaigns/campaigns.types";
import { useEditCampaignForm } from "../features/campaigns/edit/hooks/useEditCampaignForm";
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

const EditCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "error" | "idle">(
    "loading",
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/upsell/campanhas");
      return;
    }

    const campaignId = Number(id);
    if (Number.isNaN(campaignId)) {
      navigate("/upsell/campanhas");
      return;
    }

    const fetchCampaign = async () => {
      setLoadStatus("loading");
      setLoadError(null);
      try {
        const details = await getCampaignById(campaignId);
        setCampaign(details.campaign);
        setLoadStatus("idle");
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Erro ao carregar campanha.";
        setLoadError(message);
        setLoadStatus("error");
      }
    };

    fetchCampaign();
  }, [id, navigate]);

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
  } = useEditCampaignForm(campaign);

  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const openTourRef = useRef<(() => void) | null>(null);
  const handleTourOpen = useCallback((fn: () => void) => {
    openTourRef.current = fn;
  }, []);

  const selectedWidgetPreset =
    widgetPresets.find((widget) => widget.id === form.widget_preset_id) ?? null;

  const isValid = form.name.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || !campaign) return;
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
      console.debug("[campaign:update] form state", form);
      console.debug("[campaign:update] payload", payload);
      const response = await updateCampaign(campaign.id, payload);
      console.debug("[campaign:update] response", response);
      setSaveStatus("idle");
      navigate("/upsell/campanhas");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Erro ao salvar campanha.";
      setSaveError(message);
      setSaveStatus("error");
    }
  };

  if (loadStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando campanha...
        </div>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-rose-700">
            Erro ao carregar campanha
          </p>
          <p className="mt-1 text-sm text-rose-600">{loadError}</p>
          <button
            type="button"
            onClick={() => navigate("/upsell/campanhas")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CampaignTour onOpen={handleTourOpen} />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/upsell/campanhas")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                Editar Campanha
              </h1>
              <p className="text-xs text-slate-500">
                {campaign?.name ?? "Carregando..."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => openTourRef.current?.()}
          >
            <HelpCircle className="h-4 w-4" />
            Como criar uma campanha?
          </button>
        </div>
      </div>

      {resourcesLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando recursos...
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <div id="tour-info-basicas">
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
            </div>
            <div id="tour-conteudo">
              <ContentSection
                form={form}
                selectedWidgetPreset={
                  widgetPresets.find(
                    (widget) => widget.id === form.widget_preset_id,
                  ) ?? null
                }
                onSet={set}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div id="tour-periodo">
              <ScheduleSection
                form={form}
                onSet={set}
                onToggleDay={toggleDay}
                onToggleHour={toggleHour}
                onSelectAllHours={setAllHours}
                onClearHours={clearHours}
              />
            </div>
            <div id="tour-frequencia">
              <FrequencySection form={form} onSet={set} />
            </div>
            <PreviewPanel
              form={form}
              selectedWidgetPreset={selectedWidgetPreset}
            />
          </div>
        </div>

        <div
          id="tour-acoes"
          className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6"
        >
          <div>
            {saveStatus === "error" && saveError && (
              <p className="text-sm font-medium text-rose-600">{saveError}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFullPreview(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Maximize2 className="h-4 w-4" />
              Preview Full
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || saveStatus === "loading"}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveStatus === "loading" ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>

      {showFullPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
          <div className="relative w-full max-w-lg">
            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-slate-50"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
            <PreviewPanel
              form={form}
              selectedWidgetPreset={selectedWidgetPreset}
              fullscreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCampaign;
