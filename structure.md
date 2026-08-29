# VoltMetric Pro - Estrutura do Projeto

## Visao Geral

Este projeto e uma aplicacao Next.js para o **VoltMetric Pro** (Smart Plug), um sistema de inteligencia energetica (Energy Intelligence Command Center). A aplicacao utiliza Tailwind CSS v4 com design tokens personalizados, Prisma + PostgreSQL para persistencia e Better Auth para autenticacao.

Para detalhes de arquitetura, modelos de dados e endpoints, ver `README.md` e `api-doc.md`. Este documento foca na organizacao do codigo front-end e no design system.

---

## Paleta de Cores

A paleta de cores esta definida em `src/app/globals.css` e segue o design system VoltMetric Pro (tema unico, escuro):

| Token                 | Cor       | Uso                                                              |
| ---------------------- | --------- | ----------------------------------------------------------------- |
| `--primary`            | `#00D1FF` | Ciano vibrante - botoes, links, destaques principais, potencia    |
| `--secondary`          | `#2E3A4D` | Azul escuro - elementos secundarios                               |
| `--tertiary`           | `#FFB800` | Amarelo dourado - warnings, acentos especiais                     |
| `--background`         | `#0F172A` | Fundo principal da aplicacao                                      |
| `--card`               | `#1E293B` | Fundo de cards e paineis                                          |
| `--muted`               | `#334155` | Bordas e elementos desabilitados                                  |
| `--border`             | `#334155` | Bordas de cards, inputs e divisores                                |
| `--foreground`         | `#E2E8F0` | Texto principal                                                    |
| `--muted-foreground`   | `#94A3B8` | Texto secundario/placeholder, eixos e grid de graficos             |
| `--success`            | `#22C55E` | Estados positivos - energia, custo, dispositivo ativo/ligado       |
| `--warning`            | `#FFB800` | Estados de atencao - corrente, pico de potencia                    |
| `--destructive`        | `#EF4444` | Erros, exclusao, dispositivo offline/desligado                     |

### Uso no Tailwind

```tsx
// Exemplos de uso das cores
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<div className="bg-card border-border" />
<span className="text-muted-foreground" />
<span className="text-success bg-success/10" />
<span className="text-destructive bg-destructive/10" />
```

Graficos (`recharts`, em `dashboard/reports`) usam os valores hexadecimais diretamente (SVG nao le variaveis CSS do Tailwind): `#00d1ff` para series de potencia, `#22c55e` para series de energia, `#334155`/`#94a3b8` para grid e eixos, `#1e293b`/`#334155` para o fundo/borda do tooltip.

---

## Estrutura de Diretorios

```
src/
├── app/
│   ├── globals.css              # Estilos globais e design tokens
│   ├── layout.tsx               # Layout raiz com fontes
│   ├── page.tsx                 # Landing page
│   ├── icon.svg
│   │
│   ├── _components/             # Secoes da landing page
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   │
│   ├── login/                   # Login
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── LoginBrandPanel.tsx
│   │       └── LoginForm.tsx
│   │
│   ├── register/                # Cadastro
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── BrandPanel.tsx
│   │       └── RegisterForm.tsx
│   │
│   ├── forgot-password/         # Solicitacao de redefinicao de senha
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── ForgotPasswordForm.tsx
│   │
│   ├── reset-password/          # Redefinicao de senha com token
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── ResetPasswordForm.tsx
│   │
│   ├── privacy/                 # Politica de privacidade
│   │   └── page.tsx
│   │
│   ├── dashboard/                # Area autenticada (protegida em layout.tsx)
│   │   ├── layout.tsx           # Sidebar/MobileNav + valida sessao no servidor
│   │   ├── page.tsx             # Dashboard em tempo real (SSR + polling)
│   │   ├── _components/
│   │   │   ├── DashboardLive.tsx      # Client component com polling 1s
│   │   │   ├── DeviceReadingCard.tsx  # Card de dispositivo com leitura + rele
│   │   │   └── StatsCard.tsx          # Card generico de metrica (reusado em reports)
│   │   │
│   │   ├── devices/              # Gerenciamento de dispositivos
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── add-device-form.tsx
│   │   │       └── device-list.tsx
│   │   │
│   │   ├── reports/              # Historico e relatorios de consumo
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── ReportsView.tsx    # Client component: estado de filtro + fetch
│   │   │       ├── ReportFilters.tsx  # Filtro de dispositivo + periodo (24h/7d/30d)
│   │   │       ├── PowerChart.tsx     # Grafico de area (recharts) - potencia
│   │   │       └── EnergyChart.tsx    # Grafico de barras (recharts) - energia
│   │   │
│   │   └── profile/              # Perfil do usuario
│   │       ├── page.tsx
│   │       └── _components/
│   │           ├── profile-header.tsx
│   │           └── profile-form.tsx
│   │
│   └── api/                      # Rotas de API (ver api-doc.md para detalhes)
│       ├── auth/[...all]/        # Better Auth (login, cadastro, OAuth, senha)
│       ├── dashboard/            # Dados agregados do dashboard em tempo real
│       ├── devices/               # CRUD de dispositivos + leituras + controle do rele
│       ├── reports/               # Serie historica agregada (potencia/energia/custo)
│       ├── user/                  # Tarifa de energia do usuario
│       └── upload/                # Upload de avatar (Vercel Blob)
│
├── components/
│   ├── ui/                       # Componentes genericos reutilizaveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Checkbox.tsx
│   ├── navigation/                # Navegacao da area autenticada
│   │   ├── nav-items.tsx         # Fonte unica dos itens de menu (Dashboard, Dispositivos, Relatorios, Perfil)
│   │   ├── Sidebar.tsx           # Navegacao desktop (>= lg)
│   │   └── MobileNav.tsx         # Header + menu dropdown mobile (< lg)
│   └── button-signout.tsx
│
├── emails/
│   └── reset-password.tsx        # Template de e-mail (React Email) usado pelo Resend
│
└── lib/
    ├── auth.ts                   # Configuracao do Better Auth (server)
    ├── auth-client.ts            # Client do Better Auth (hooks React)
    ├── prisma.ts                 # Instancia singleton do Prisma Client
    ├── resend.ts                 # Cliente do Resend
    └── session.ts                # Helper getServerSession()
```

---

## Padroes de Organizacao

### 1. Componentes Reutilizaveis (`/components/ui/`)

Componentes genericos que podem ser usados em qualquer parte da aplicacao:

- **Button**: Suporta variantes `primary`, `secondary`, `outline`, `ghost`
- **Input**: Suporta icone a esquerda, label, tipo password com toggle de visibilidade
- **Checkbox**: Checkbox estilizado com suporte a label React Node

### 2. Componentes de Pagina (`/app/[pagina]/_components/`)

Componentes especificos de cada pagina ficam dentro de um diretorio `_components` na pasta da pagina. O prefixo `_` indica que sao componentes privados da rota. Esse padrao se repete tanto nas rotas publicas (`login`, `register`, `forgot-password`, `reset-password`) quanto nas rotas autenticadas (`dashboard`, `dashboard/devices`, `dashboard/reports`, `dashboard/profile`).

Uma excecao intencional e `StatsCard` (`dashboard/_components/StatsCard.tsx`): mesmo estando na pasta de uma rota especifica, e reaproveitado por outras telas do dashboard (ex: `dashboard/reports`) por representar um padrao visual comum (card de metrica com titulo, valor, unidade e icone).

### 3. Layouts de Autenticacao

As paginas de login, cadastro e recuperacao de senha seguem um layout dividido em duas colunas:

- **Coluna esquerda**: Branding (logo, ilustracao, estatisticas ou citacao)
- **Coluna direita**: Formulario

### 4. Layout da Area Autenticada (`/dashboard`)

`dashboard/layout.tsx` valida a sessao no servidor (`getServerSession()`) e redireciona para `/login` se nao houver sessao. A navegacao (`components/navigation/`) e orientada por uma unica fonte de verdade, `nav-items.tsx`, consumida tanto por `Sidebar` (desktop, >= `lg`) quanto por `MobileNav` (header + menu dropdown, < `lg`). Adicionar uma nova secao ao dashboard normalmente significa: criar a rota em `dashboard/<secao>/page.tsx` e adicionar uma entrada em `nav-items.tsx`.

### 5. Paginas com dado em tempo real / historico

`dashboard/page.tsx` e `dashboard/reports/page.tsx` seguem o mesmo padrao hibrido: o Server Component busca os dados iniciais (Prisma) e um Client Component (`DashboardLive` / `ReportsView`) assume a partir dai — `DashboardLive` faz polling a cada 1s em `GET /api/dashboard`, enquanto `ReportsView` refaz o fetch em `GET /api/reports` sempre que o usuario troca o filtro de dispositivo ou periodo (sem polling, por ser dado historico).

---

## Componentes UI - Documentacao

### Button

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary">Texto</Button>
<Button variant="outline" icon={<Icon />}>Com Icone</Button>
```

**Props:**

- `variant`: `"primary"` | `"secondary"` | `"outline"` | `"ghost"`
- `icon`: ReactNode opcional para icone a esquerda
- Herda todas as props de `ButtonHTMLAttributes`

### Input

```tsx
import { Input } from "@/components/ui/Input";
import { Mail } from "lucide-react";

<Input label="E-mail" icon={<Mail />} placeholder="nome@empresa.com" />;
```

**Props:**

- `label`: string opcional
- `icon`: ReactNode para icone a esquerda
- `rightElement`: ReactNode para elemento a direita (ex: link "Esqueceu a senha?")
- Herda todas as props de `InputHTMLAttributes`

### Checkbox

```tsx
import { Checkbox } from "@/components/ui/Checkbox";

<Checkbox
  label={
    <span>
      Aceito os <a href="#">termos</a>
    </span>
  }
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>;
```

**Props:**

- `label`: ReactNode opcional
- `checked`: boolean controlado
- Herda todas as props de `InputHTMLAttributes`

---

## Rotas da Aplicacao

### Publicas

| Rota                | Descricao                                  |
| -------------------- | ------------------------------------------- |
| `/`                   | Landing page                                |
| `/login`              | Login de usuario                            |
| `/register`           | Cadastro de usuario                         |
| `/forgot-password`    | Solicitacao de redefinicao de senha         |
| `/reset-password`     | Redefinicao de senha com token              |
| `/privacy`            | Politica de privacidade                     |

### Autenticadas (`/dashboard`, protegidas por `dashboard/layout.tsx`)

| Rota                    | Descricao                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `/dashboard`              | Painel em tempo real: metricas agregadas e cards por dispositivo  |
| `/dashboard/devices`      | Lista, cadastro, edicao e remocao de dispositivos                 |
| `/dashboard/reports`      | Historico de consumo por periodo (24h/7d/30d) e dispositivo       |
| `/dashboard/profile`      | Visualizacao e edicao do perfil (nome, avatar)                     |

Rotas de API (`/api/...`) estao documentadas em `api-doc.md`.

---

## Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (com `@theme inline` para design tokens)
- **Prisma ORM** + **PostgreSQL**
- **Better Auth** (autenticacao)
- **Recharts** (graficos em `dashboard/reports`)
- **React Hook Form + Zod** (formularios)
- **Lucide React** (icones)
