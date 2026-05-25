import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Globe,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type { Segment } from "../../../../lib/services/segments/segments.types";
import type { Widget } from "../../../../types/widget";
import WidgetHtmlPreview from "../../../widgets/components/WidgetHtmlPreview";
import WidgetRenderer from "../../../widgets/components/WidgetRenderer";
import { getWidgetPresetConfig } from "../widgetPresetUtils";
import { isHtmlWidgetTemplateConfig } from "../../../widgets/utils/htmlWidgetTemplateGenerator";
import { DISPLAY_LOCATIONS, RENDER_TYPE_OPTIONS } from "../constants";
import type { CampaignFormState, DisplayRenderType } from "../types";

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  ShoppingBag: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  ShoppingCart: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  ),
  CreditCard: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  ),
  PackageCheck: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  ),
};

type Props = {
  form: CampaignFormState;
  segments: Segment[];
  widgetPresets: Widget[];
  widgetPresetsLoading: boolean;
  onSet: <K extends keyof CampaignFormState>(
    key: K,
    value: CampaignFormState[K],
  ) => void;
  onToggleLocation: (key: string) => void;
  onToggleSegment: (id: number) => void;
  onSelectWidgetPreset: (widgetId: string) => void;
  onSetWidgetRenderType: (renderType: DisplayRenderType) => void;
  onOpenCreateWidget?: () => void;
};

const DomainInput = ({
  domains,
  onSet,
}: {
  domains: string[];
  onSet: (domains: string[]) => void;
}) => {
  const [input, setInput] = useState("");

  const addDomain = () => {
    const trimmed = input.trim();
    if (!trimmed || domains.includes(trimmed)) return;
    onSet([...domains, trimmed]);
    setInput("");
  };

  const removeDomain = (domain: string) => {
    onSet(domains.filter((d) => d !== domain));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDomain();
              }
            }}
            placeholder="loja.com.br ou https://loja.com"
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300"
          />
        </div>
        <button
          type="button"
          onClick={addDomain}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </button>
      </div>
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {domains.map((domain) => (
            <span
              key={domain}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
            >
              {domain}
              <button
                type="button"
                onClick={() => removeDomain(domain)}
                className="text-slate-400 transition hover:text-rose-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const BasicInfoSection = ({
  form,
  segments,
  widgetPresets,
  widgetPresetsLoading,
  onSet,
  onToggleLocation,
  onToggleSegment,
  onSelectWidgetPreset,
  onSetWidgetRenderType,
  onOpenCreateWidget,
}: Props) => {
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [panel, setPanel] = useState<"identity" | "template" | "targeting">("identity");
  const [widgetPage, setWidgetPage] = useState(0);
  const [segmentPage, setSegmentPage] = useState(0);
  const widgetPageSize = 3;
  const segmentPageSize = 4;

  const selectedSegmentNames = form.segment_ids
    .map((id) => segments.find((s) => s.id === id)?.name)
    .filter(Boolean);

  const selectedWidgetPreset = useMemo(
    () =>
      widgetPresets.find((widget) => widget.id === form.widget_preset_id) ??
      null,
    [form.widget_preset_id, widgetPresets],
  );
  const widgetLastPage = Math.max(1, Math.ceil(widgetPresets.length / widgetPageSize));
  const visibleWidgetPresets = widgetPresets.slice(
    widgetPage * widgetPageSize,
    widgetPage * widgetPageSize + widgetPageSize,
  );
  const segmentLastPage = Math.max(1, Math.ceil(segments.length / segmentPageSize));
  const visibleSegments = segments.slice(
    segmentPage * segmentPageSize,
    segmentPage * segmentPageSize + segmentPageSize,
  );

  return (
    <div className="space-y-3">
      <nav className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
        {([
          ["identity", "Geral"],
          ["template", "Template"],
          ["targeting", "Publico"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPanel(key)}
            className={`rounded-md px-2 py-1.5 text-xs font-semibold ${
              panel === key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      {panel === "identity" && (
        <div className="space-y-4">
      {/* ── Campaign Name ── */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">
          Nome da Campanha <span className="text-rose-500">*</span>
        </span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onSet("name", e.target.value)}
          placeholder="Ex: Black Friday 2026"
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
        />
      </label>

      {/* ── Status (toggle button) ── */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">Status</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSet("is_active", true)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
              form.is_active
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${form.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
            Ativo
          </button>
          <button
            type="button"
            onClick={() => onSet("is_active", false)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
              !form.is_active
                ? "border-slate-500 bg-slate-100 text-slate-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${!form.is_active ? "bg-slate-500" : "bg-slate-300"}`} />
            Inativo
          </button>
        </div>
      </div>

      {/* ── Priority ── */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">Prioridade</span>
        <input
          type="number"
          min={0}
          value={form.priority}
          onChange={(e) => onSet("priority", Number(e.target.value))}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-300"
        />
        <p className="text-[10px] text-slate-400">Maior valor = mais prioritário</p>
      </label>
        </div>
      )}

      {/* ── Widget Preset Selection ── */}
      {panel === "template" && (
      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold text-slate-600">
            Template do Widget <span className="text-rose-500">*</span>
          </span>
          <p className="mt-0.5 text-xs text-slate-400">
            Escolha o template visual. A campanha mostrará os campos compatíveis.
          </p>
        </div>

        {onOpenCreateWidget ? (
          <button
            type="button"
            onClick={onOpenCreateWidget}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Criar novo widget
          </button>
        ) : null}

        {widgetPresetsLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              Carregando presets...
            </div>
          </div>
        ) : widgetPresets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Nenhum preset ativo disponível. Crie um widget primeiro.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWidgetPresets.map((widget) => {
              const active = widget.id === form.widget_preset_id;
              const config = getWidgetPresetConfig(widget);
              const htmlTemplateConfig = isHtmlWidgetTemplateConfig(widget.config?.attributes)
                ? widget.config.attributes
                : null;
              return (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => onSelectWidgetPreset(widget.id)}
                  className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all ${
                    active
                      ? "border-blue-500 bg-blue-50/50 shadow-sm ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Mini preview */}
                  <div className="overflow-hidden bg-slate-50 px-2 pt-2">
                    {htmlTemplateConfig ? (
                      <div className="pointer-events-none h-[100px] overflow-hidden rounded-lg bg-white">
                        <WidgetHtmlPreview
                          html={widget.html}
                          css={widget.css}
                          compact
                          allowScripts={htmlTemplateConfig.supportsScript}
                        />
                      </div>
                    ) : (
                      <div className="pointer-events-none mx-auto" style={{ transform: "scale(0.45)", transformOrigin: "top center", maxHeight: 100, overflow: "hidden" }}>
                        <WidgetRenderer config={config} mode="thumbnail" viewport="mobile" />
                      </div>
                    )}
                  </div>

                  {/* Info bar */}
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-800">{widget.title}</p>
                      <p className="truncate text-[10px] text-slate-400">
                        {htmlTemplateConfig ? `${htmlTemplateConfig.templateCategory} • HTML` : `${config.layout} • ${config.variant}`}
                      </p>
                    </div>
                    {active && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {widgetPresets.length > widgetPageSize ? (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <button type="button" disabled={widgetPage === 0} onClick={() => setWidgetPage((value) => Math.max(0, value - 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">
              Anterior
            </button>
            <span>{widgetPage + 1} / {widgetLastPage}</span>
            <button type="button" disabled={widgetPage + 1 >= widgetLastPage} onClick={() => setWidgetPage((value) => Math.min(widgetLastPage - 1, value + 1))} className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40">
              Proximo
            </button>
          </div>
        ) : null}

        {selectedWidgetPreset && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Layout selecionado. Os campos de conteúdo foram ajustados automaticamente.
          </div>
        )}
      </div>
      )}

      {/* ── Segmentation ── */}
      {panel === "targeting" && (
      <div className="space-y-4">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-600">
          Segmentação
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSegmentOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-slate-300"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              {selectedSegmentNames.length === 0 ? (
                <span className="text-slate-400">Todos os visitantes</span>
              ) : (
                <span className="font-medium">
                  {selectedSegmentNames.slice(0, 2).join(", ")}
                  {selectedSegmentNames.length > 2
                    ? ` +${selectedSegmentNames.length - 2}`
                    : ""}
                </span>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                segmentOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {segmentOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="p-1">
                {segments.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-400">
                    Nenhum segmento disponível.
                  </p>
                ) : (
                  visibleSegments.map((segment) => {
                    const active = form.segment_ids.includes(segment.id);
                    return (
                      <button
                        key={segment.id}
                        type="button"
                        onClick={() => onToggleSegment(segment.id)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{segment.name}</span>
                        {active && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })
                )}
                {segments.length > segmentPageSize ? (
                  <div className="flex items-center justify-between border-t border-slate-100 px-2 pt-1 text-[10px] text-slate-500">
                    <button type="button" disabled={segmentPage === 0} onClick={() => setSegmentPage((value) => Math.max(0, value - 1))}>Anterior</button>
                    <span>{segmentPage + 1} / {segmentLastPage}</span>
                    <button type="button" disabled={segmentPage + 1 >= segmentLastPage} onClick={() => setSegmentPage((value) => Math.min(segmentLastPage - 1, value + 1))}>Proximo</button>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Display Locations ── */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-600">
          Locais de Exibição
        </span>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {DISPLAY_LOCATIONS.map((location) => {
            const active = form.display_locations.includes(location.key);
            return (
              <button
                key={location.key}
                type="button"
                onClick={() => onToggleLocation(location.key)}
                className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div
                  className={`mt-0.5 rounded-md p-1.5 ${active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}
                >
                  {LOCATION_ICONS[location.icon]}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">
                    {location.label}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                    {location.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Render Type + Domains (compact row) ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-slate-600">
            Tipo de Exibição
          </span>
          <select
            value={form.widget_render_type ?? ""}
            onChange={(e) =>
              onSetWidgetRenderType(e.target.value as DisplayRenderType)
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-300"
          >
            <option value="">Selecione</option>
            {RENDER_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-600">
            Domínios permitidos
          </span>
          <DomainInput
            domains={form.domains}
            onSet={(domains) => onSet("domains", domains)}
          />
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

export default BasicInfoSection;
