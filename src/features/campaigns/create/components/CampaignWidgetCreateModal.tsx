import { useState } from "react";
import { X } from "lucide-react";
import WidgetBuilderForm from "../../../widgets/components/WidgetBuilderForm";
import { ApiError } from "../../../../lib/api";
import {
  createWidget,
  WidgetValidationError,
} from "../../../../lib/services/widgets/widgets.service";
import type {
  Widget,
  WidgetApiValidationErrors,
  WidgetFormPayload,
} from "../../../../types/widget";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (widget: Widget) => void;
};

const CampaignWidgetCreateModal = ({ open, onClose, onCreated }: Props) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<WidgetApiValidationErrors>({});

  if (!open) return null;

  const handleSubmit = async (payload: WidgetFormPayload) => {
    setSubmitting(true);
    setError(null);
    setValidationErrors({});

    try {
      const widget = await createWidget(payload);
      onCreated(widget);
      onClose();
    } catch (err) {
      if (err instanceof WidgetValidationError) {
        setValidationErrors(err.errors);
        setError(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : "Erro ao criar widget");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/70 backdrop-blur-sm">
      <div className="m-auto flex h-[92vh] w-[min(1180px,94vw)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Criar novo widget</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Salve o widget e ele será selecionado nesta campanha.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error ? (
          <div className="shrink-0 border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-5">
          <WidgetBuilderForm
            submitting={submitting}
            submitLabel="Salvar e usar"
            apiErrors={validationErrors}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignWidgetCreateModal;
