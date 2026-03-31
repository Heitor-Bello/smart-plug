import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-card border border-border">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Monitoramento em tempo real
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
          Controle inteligente do seu{" "}
          <span className="text-primary">consumo de energia</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          Transforme qualquer tomada em uma tomada inteligente. Monitore,
          controle e economize energia de qualquer lugar, a qualquer momento.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Comece agora
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Button>
          </Link>
          <Link href="#como-funciona">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Saiba mais
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
