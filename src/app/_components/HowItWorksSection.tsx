const steps = [
  {
    step: "01",
    title: "Conecte o dispositivo",
    description:
      "Plugue o VoltMetric em qualquer tomada e conecte seu aparelho eletrônico nele.",
  },
  {
    step: "02",
    title: "Configure pelo app",
    description:
      "Baixe o aplicativo, crie sua conta e conecte o dispositivo via Wi-Fi em poucos minutos.",
  },
  {
    step: "03",
    title: "Monitore e controle",
    description:
      "Acompanhe o consumo em tempo real, crie automações e controle tudo remotamente.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Simples de usar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Em apenas 3 passos você começa a economizar energia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-primary/20 mb-4">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 right-0 w-1/3 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
