import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  Repeat,
  Rocket,
  Save,
  Settings,
  X,
} from "lucide-react";

const TOUR_STORAGE_KEY = "campaignTourCompleted";

type StepPosition = "right" | "left" | "top" | "bottom";

type TourStep = {
  target: string;
  title: string;
  icon: React.ReactNode;
  position: StepPosition;
  description: string;
  tips: string[];
};

const STEPS: TourStep[] = [
  {
    target: "#tour-info-basicas",
    title: "Informações Básicas",
    icon: <Settings className="h-5 w-5" />,
    position: "right",
    description:
      "Comece dando um nome único para sua campanha. Escolha o status, selecione os segmentos de clientes que deseja alcançar e defina onde a campanha será exibida.",
    tips: [
      'Use nomes descritivos como "Black Friday 2026 - Eletrônicos"',
      "A prioridade define qual campanha aparece primeiro quando há várias ativas",
      "Deixe a segmentação vazia para alcançar todos os visitantes",
    ],
  },
  {
    target: "#tour-conteudo",
    title: "Conteúdo da Campanha",
    icon: <BookOpen className="h-5 w-5" />,
    position: "right",
    description:
      "Aqui você define o que seu cliente verá. Adicione um título chamativo, uma descrição persuasiva, imagem ou vídeo do produto, e configure o botão de ação (CTA).",
    tips: [
      "Títulos curtos e impactantes funcionam melhor",
      "Use imagens de alta qualidade para maior conversão",
      'O texto do botão deve ser uma ação clara: "Comprar Agora", "Adicionar ao Carrinho"',
    ],
  },
  {
    target: "#tour-periodo",
    title: "Período de Exibição",
    icon: <Calendar className="h-5 w-5" />,
    position: "left",
    description:
      "Defina quando sua campanha estará ativa. Configure datas de início e fim, escolha os dias da semana e as horas específicas em que ela deve aparecer.",
    tips: [
      "Campanhas com prazo limitado criam senso de urgência",
      "Considere o horário de pico do seu público-alvo",
      "Use as horas ativas para evitar exibição em horários de baixa conversão",
    ],
  },
  {
    target: "#tour-frequencia",
    title: "Controle de Frequência",
    icon: <Repeat className="h-5 w-5" />,
    position: "left",
    description:
      "Evite irritar seus clientes! Configure o intervalo mínimo entre exibições (cooldown), limite por sessão, por dia e o total. Você também pode bloquear a campanha após uma conversão.",
    tips: [
      "Cooldown de 5 minutos evita que o popup apareça repetidamente",
      "Máximo de 3 por sessão é um bom equilíbrio",
      "Bloquear após conversão evita mostrar ofertas já aceitas",
    ],
  },
  {
    target: "#tour-acoes",
    title: "Salvar e Visualizar",
    icon: <Save className="h-5 w-5" />,
    position: "top",
    description:
      'Tudo pronto? Use "Preview Full" para ver como ficará no contexto real, e quando estiver satisfeito, clique em "Salvar Campanha" para ativar!',
    tips: [
      "Sempre faça um preview antes de salvar",
      "Campanhas inativas não aparecem para clientes",
      "Você pode editar a campanha a qualquer momento",
    ],
  },
];

type HighlightBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  onOpen: (open: () => void) => void;
};

const CampaignTour = ({ onOpen }: Props) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlight, setHighlight] = useState<HighlightBox>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [showToast, setShowToast] = useState(false);
  const highlightRef = useRef<Element | null>(null);

  const openWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);

  useEffect(() => {
    onOpen(openWelcome);
  }, [onOpen, openWelcome]);

  useEffect(() => {
    if (!localStorage.getItem(TOUR_STORAGE_KEY)) {
      const t = setTimeout(() => setShowWelcome(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const recalcPosition = useCallback(() => {
    if (highlightRef.current) {
      const rect = highlightRef.current.getBoundingClientRect();
      setHighlight({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    }
  }, []);

  useEffect(() => {
    if (tourActive) {
      window.addEventListener("resize", recalcPosition);
      window.addEventListener("scroll", recalcPosition, true);
      return () => {
        window.removeEventListener("resize", recalcPosition);
        window.removeEventListener("scroll", recalcPosition, true);
      };
    }
  }, [tourActive, recalcPosition]);

  const goToStep = useCallback((index: number) => {
    const step = STEPS[index];
    const el = document.querySelector(step.target);
    if (!el) return;

    highlightRef.current = el;
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setHighlight({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    }, 400);
  }, []);

  const startTour = () => {
    setShowWelcome(false);
    setCurrentStep(0);
    setTourActive(true);
    setTimeout(() => goToStep(0), 100);
  };

  const closeTour = () => {
    setTourActive(false);
    highlightRef.current = null;
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      goToStep(next);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      goToStep(prev);
    }
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setTourActive(false);
    highlightRef.current = null;
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const getTooltipStyle = (): React.CSSProperties => {
    const step = STEPS[currentStep];
    const t = highlight;
    const vh = window.innerHeight;
    const tooltipW = Math.min(window.innerWidth - 32, 384);
    const tooltipH = 340;
    const gap = 16;

    let top = 0;
    let left = 0;

    if (window.innerWidth < 768) {
      left = gap;
      top =
        t.top > vh / 2
          ? Math.max(gap, t.top - tooltipH - gap)
          : Math.min(vh - tooltipH - gap, t.top + t.height + gap);
    } else {
      switch (step.position) {
        case "right":
          left = Math.min(
            t.left + t.width + gap,
            window.innerWidth - tooltipW - gap,
          );
          top = Math.max(gap, Math.min(t.top, vh - tooltipH - gap));
          break;
        case "left":
          left = Math.max(gap, t.left - tooltipW - gap);
          top = Math.max(gap, Math.min(t.top, vh - tooltipH - gap));
          break;
        case "top":
          left = Math.max(
            gap,
            Math.min(t.left, window.innerWidth - tooltipW - gap),
          );
          top = Math.max(gap, t.top - tooltipH - gap);
          break;
        default:
          left = Math.max(
            gap,
            Math.min(t.left, window.innerWidth - tooltipW - gap),
          );
          top = Math.min(vh - tooltipH - gap, t.top + t.height + gap);
          break;
      }
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <>
      {showWelcome && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowWelcome(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-center">
              <div className="mb-3 flex justify-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                  <Rocket className="h-8 w-8 text-white" />
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Bem-vindo ao Designer de Campanhas!
              </h2>
              <p className="mt-1 text-sm text-emerald-100">
                Vamos criar sua primeira campanha de upsell juntos?
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Tour Interativo
                    </p>
                    <p className="text-xs text-slate-500">
                      Aprenda passo a passo como configurar cada seção da sua
                      campanha.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Eye className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Preview em Tempo Real
                    </p>
                    <p className="text-xs text-slate-500">
                      Veja como sua campanha ficará enquanto configura.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <span className="text-xs font-bold">~3min</span>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Rápido e Fácil
                    </p>
                    <p className="text-xs text-slate-500">
                      Duração estimada de 3 minutos para completar o tour.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWelcome(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Explorar sozinho
                </button>
                <button
                  type="button"
                  onClick={startTour}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Rocket className="h-4 w-4" />
                  Iniciar Tour Guiado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tourActive && highlight.width > 0 && (
        <>
          <div
            className="pointer-events-none fixed inset-0 z-[100] bg-slate-900/60 transition-all duration-500"
            style={{
              clipPath: `polygon(
                0% 0%,
                0% 100%,
                ${highlight.left}px 100%,
                ${highlight.left}px ${highlight.top}px,
                ${highlight.left + highlight.width}px ${highlight.top}px,
                ${highlight.left + highlight.width}px ${highlight.top + highlight.height}px,
                ${highlight.left}px ${highlight.top + highlight.height}px,
                ${highlight.left}px 100%,
                100% 100%,
                100% 0%
              )`,
            }}
          />

          <div
            className="pointer-events-none fixed z-[101] rounded-xl ring-4 ring-emerald-400 transition-all duration-500"
            style={{
              top: `${highlight.top}px`,
              left: `${highlight.left}px`,
              width: `${highlight.width}px`,
              height: `${highlight.height}px`,
            }}
          />

          <div
            className="fixed z-[102] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-500 sm:max-w-md"
            style={getTooltipStyle()}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  {step.icon}
                  <div>
                    <p className="text-xs font-medium text-emerald-100">
                      Passo {currentStep + 1} de {STEPS.length}
                    </p>
                    <p className="text-sm font-bold">{step.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeTour}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm leading-relaxed text-slate-700">
                {step.description}
              </p>

              <div className="mt-3 space-y-2">
                {step.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                    <p className="text-xs text-slate-600">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>

              <button
                type="button"
                onClick={closeTour}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100"
              >
                Pular
              </button>

              {isLast ? (
                <button
                  type="button"
                  onClick={completeTour}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Check className="h-3.5 w-3.5" />
                  Concluir
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  Próximo
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 shadow-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-4 w-4 text-emerald-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Tour concluído!
            </p>
            <p className="text-xs text-slate-500">
              Agora você está pronto para criar campanhas incríveis.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CampaignTour;
