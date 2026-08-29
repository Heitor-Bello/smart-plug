"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Range } from "./ReportFilters";

interface Insight {
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
}

interface AiInsightsProps {
  deviceId: string;
  range: Range;
}

const SEVERITY_STYLES: Record<
  Insight["severity"],
  { icon: ReactNode; classes: string }
> = {
  info: {
    icon: <Info size={16} />,
    classes: "text-primary bg-primary/10 border-primary/30",
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    classes: "text-warning bg-warning/10 border-warning/30",
  },
  success: {
    icon: <CheckCircle2 size={16} />,
    classes: "text-success bg-success/10 border-success/30",
  },
};

export function AiInsights({ deviceId, range }: AiInsightsProps) {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtro mudou: os avisos exibidos não correspondem mais ao período/dispositivo
  // selecionado, então limpamos e esperamos o usuário gerar de novo.
  useEffect(() => {
    setInsights(null);
    setGeneratedAt(null);
    setError(null);
  }, [deviceId, range]);

  async function generate(force: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, range, force }),
      });
      if (!res.ok) {
        setError("Não foi possível gerar a análise agora.");
        return;
      }
      const json = await res.json();
      setInsights(json.insights);
      setGeneratedAt(json.generatedAt);
    } catch {
      setError("Erro de conexão ao gerar a análise.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Análise com IA
          </h3>
        </div>
        <button
          onClick={() => generate(insights !== null)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : insights ? (
            <RefreshCw size={14} />
          ) : (
            <Sparkles size={14} />
          )}
          {loading
            ? "Gerando..."
            : insights
              ? "Atualizar análise"
              : "Gerar análise com IA"}
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!error && insights && insights.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Dados insuficientes nesse período para gerar avisos.
        </p>
      )}

      {!error && insights && insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 ${SEVERITY_STYLES[insight.severity].classes}`}
            >
              <span className="mt-0.5 shrink-0">
                {SEVERITY_STYLES[insight.severity].icon}
              </span>
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs mt-0.5 opacity-90">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!error && !insights && !loading && (
        <p className="text-sm text-muted-foreground">
          Gere uma análise para receber avisos e explicações sobre o consumo
          desse período.
        </p>
      )}

      {generatedAt && (
        <p className="text-xs text-muted-foreground">
          Gerado em {new Date(generatedAt).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}
