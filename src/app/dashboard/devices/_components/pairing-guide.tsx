import { Power, Wifi, Globe, KeyRound, ClipboardCheck, PlusCircle } from "lucide-react";
import type { ReactNode } from "react";

interface Step {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}

const steps: Step[] = [
  {
    icon: <Power size={18} />,
    title: "Ligue a tomada inteligente na energia",
    description: "Plugue o dispositivo em uma tomada da parede e aguarde alguns segundos.",
  },
  {
    icon: <Wifi size={18} />,
    title: "Conecte o celular na rede do dispositivo",
    description: (
      <>
        Nas configurações de Wi-Fi do celular, procure uma rede chamada algo como{" "}
        <strong className="text-foreground font-mono">SmartPlug-XXXXXX</strong> e
        conecte usando a senha{" "}
        <strong className="text-foreground font-mono">smartplug123</strong>.
      </>
    ),
  },
  {
    icon: <Globe size={18} />,
    title: "Abra a página de configuração",
    description: (
      <>
        Geralmente ela abre sozinha. Se não abrir, abra o navegador (Chrome ou
        Safari) e digite{" "}
        <strong className="text-foreground font-mono">192.168.4.1</strong> na
        barra de endereço.
      </>
    ),
  },
  {
    icon: <KeyRound size={18} />,
    title: "Configure o Wi-Fi da sua casa",
    description:
      "Toque em \"Configure WiFi\", escolha a rede da sua casa na lista, digite a senha dela e confirme.",
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: "Anote o código que aparece na tela",
    description:
      "Essa mesma página mostra um código único do dispositivo. Anote-o ou tire uma foto — você vai usar no próximo passo.",
  },
  {
    icon: <PlusCircle size={18} />,
    title: "Cadastre o dispositivo aqui embaixo",
    description:
      "Volte para esta página, digite esse código no formulário abaixo, escolha um nome (ex: \"Tomada da Sala\") e clique em Parear.",
  },
];

export function PairingGuide() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-foreground">
          Como conectar sua tomada inteligente
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Leva poucos minutos e não precisa de nenhum conhecimento técnico.
        </p>
      </div>

      <ol className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <span className="text-muted-foreground">{step.icon}</span>
                {step.title}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
