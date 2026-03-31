import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-foreground">
              VoltMetric
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Termos de uso
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Contato
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} VoltMetric. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
