const stats = [
  {
    value: "30%",
    label: "de economia média",
    description: "na conta de luz",
  },
  {
    value: "24/7",
    label: "monitoramento",
    description: "em tempo real",
  },
  {
    value: "100%",
    label: "controle remoto",
    description: "de qualquer lugar",
  },
  {
    value: "0",
    label: "instalação complexa",
    description: "plug and play",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 px-6 border-y border-border bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-foreground font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
