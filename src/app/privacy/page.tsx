import Link from "next/link";
import { ArrowLeft, ShieldCheck, BarChart3, Database, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | VoltMetric",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-6 py-12 flex-1">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck size={32} className="text-primary" />
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        </div>

        <p className="text-muted-foreground mb-10">
          Última atualização: 31 de março de 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
            <p className="text-muted-foreground leading-relaxed">
              A VoltMetric tem o compromisso de proteger a sua privacidade. Esta
              política explica quais dados coletamos, como os utilizamos e quais
              são os seus direitos em relação a essas informações.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Database size={20} className="text-primary" />
              <h2 className="text-xl font-semibold">
                2. Dados que coletamos
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para oferecer nosso serviço, coletamos os seguintes dados:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>
                <strong className="text-foreground">Dados de cadastro:</strong>{" "}
                nome, endereço de e-mail e senha (armazenada de forma
                criptografada).
              </li>
              <li>
                <strong className="text-foreground">
                  Dados de consumo energético:
                </strong>{" "}
                leituras de tensão, corrente e potência dos aparelhos eletrônicos
                conectados aos seus dispositivos Smart Plug.
              </li>
              <li>
                <strong className="text-foreground">
                  Dados dos dispositivos:
                </strong>{" "}
                nome e identificação dos aparelhos cadastrados na plataforma.
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={20} className="text-primary" />
              <h2 className="text-xl font-semibold">
                3. Para que usamos seus dados
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Os dados de consumo energético são coletados{" "}
              <strong className="text-foreground">
                exclusivamente para análise da energia gasta pelos seus
                aparelhos eletrônicos
              </strong>
              . O objetivo é fornecer a você:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>
                Relatórios detalhados sobre o consumo de energia de cada
                dispositivo.
              </li>
              <li>
                Histórico de leituras para acompanhamento ao longo do tempo.
              </li>
              <li>
                Informações que ajudem você a entender e gerenciar o gasto
                energético dos seus aparelhos.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong className="text-foreground">
                Não vendemos, compartilhamos ou utilizamos os seus dados para
                fins publicitários ou qualquer outra finalidade
              </strong>{" "}
              que não seja a apresentação de relatórios para o próprio usuário.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock size={20} className="text-primary" />
              <h2 className="text-xl font-semibold">
                4. Segurança dos dados
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas para garantir a segurança dos seus
              dados, incluindo criptografia de senhas e comunicação segura entre
              os dispositivos e nossos servidores. O acesso aos dados é restrito
              apenas ao próprio usuário autenticado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              5. Seus direitos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Você pode, a qualquer momento, solicitar a exclusão da sua conta
              e de todos os dados associados a ela. Para isso, entre em contato
              conosco ou utilize as opções disponíveis na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              6. Alterações nesta política
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser atualizada periodicamente. Notificaremos
              os usuários sobre alterações significativas por meio da
              plataforma.
            </p>
          </section>
        </div>

        <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground">
          © 2026 VoltMetric. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
