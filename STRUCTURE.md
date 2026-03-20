# VoltMetric Pro - Estrutura do Projeto

## Visao Geral

Este projeto e uma aplicacao Next.js para o **VoltMetric Pro**, um sistema de inteligencia energetica (Energy Intelligence Command Center). A aplicacao utiliza Tailwind CSS v4 com design tokens personalizados.

---

## Paleta de Cores

A paleta de cores esta definida em `src/app/globals.css` e segue o design system VoltMetric Pro:

| Token | Cor | Uso |
|-------|-----|-----|
| `--primary` | `#00D1FF` | Ciano vibrante - botoes, links, destaques principais |
| `--secondary` | `#2E3A4D` | Azul escuro - elementos secundarios, cards |
| `--tertiary` | `#FFB800` | Amarelo dourado - warnings, acentos especiais |
| `--background` | `#0F172A` | Fundo principal da aplicacao |
| `--card` | `#1E293B` | Fundo de cards e paineis |
| `--muted` | `#334155` | Bordas e elementos desabilitados |
| `--foreground` | `#E2E8F0` | Texto principal |
| `--muted-foreground` | `#94A3B8` | Texto secundario/placeholder |

### Uso no Tailwind

```tsx
// Exemplos de uso das cores
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<div className="bg-card border-border" />
<span className="text-muted-foreground" />
```

---

## Estrutura de Diretorios

```
src/
├── app/
│   ├── globals.css          # Estilos globais e design tokens
│   ├── layout.tsx           # Layout raiz com fontes
│   ├── page.tsx             # Pagina inicial
│   │
│   ├── login/               # Pagina de login
│   │   ├── page.tsx         # Componente da pagina
│   │   └── _components/     # Componentes especificos do login
│   │       ├── LoginBrandPanel.tsx
│   │       └── LoginForm.tsx
│   │
│   └── register/            # Pagina de cadastro
│       ├── page.tsx         # Componente da pagina
│       └── _components/     # Componentes especificos do cadastro
│           ├── BrandPanel.tsx
│           └── RegisterForm.tsx
│
└── components/
    └── ui/                  # Componentes reutilizaveis
        ├── Button.tsx       # Botao com variantes (primary, secondary, outline, ghost)
        ├── Checkbox.tsx     # Checkbox com label
        └── Input.tsx        # Input com icone, label e suporte a senha
```

---

## Padroes de Organizacao

### 1. Componentes Reutilizaveis (`/components/ui/`)

Componentes genericos que podem ser usados em qualquer parte da aplicacao:

- **Button**: Suporta variantes `primary`, `secondary`, `outline`, `ghost`
- **Input**: Suporta icone a esquerda, label, tipo password com toggle de visibilidade
- **Checkbox**: Checkbox estilizado com suporte a label React Node

### 2. Componentes de Pagina (`/app/[pagina]/_components/`)

Componentes especificos de cada pagina ficam dentro de um diretorio `_components` na pasta da pagina. O prefixo `_` indica que sao componentes privados da rota.

### 3. Layouts de Autenticacao

As paginas de login e registro seguem um layout dividido em duas colunas:
- **Coluna esquerda**: Branding (logo, ilustracao, estatisticas ou citacao)
- **Coluna direita**: Formulario

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

<Input 
  label="E-mail" 
  icon={<Mail />} 
  placeholder="nome@empresa.com" 
/>
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
  label={<span>Aceito os <a href="#">termos</a></span>}
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

**Props:**
- `label`: ReactNode opcional
- `checked`: boolean controlado
- Herda todas as props de `InputHTMLAttributes`

---

## Rotas da Aplicacao

| Rota | Descricao |
|------|-----------|
| `/` | Pagina inicial |
| `/login` | Pagina de login |
| `/register` | Pagina de cadastro |

---

## Tecnologias

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4** (com `@theme inline` para design tokens)
- **TypeScript**
- **Lucide React** (icones)
