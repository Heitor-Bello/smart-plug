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
│   ├── register/            # Pagina de cadastro
│   │   ├── page.tsx         # Componente da pagina
│   │   └── _components/     # Componentes especificos do cadastro
│   │       ├── BrandPanel.tsx
│   │       └── RegisterForm.tsx
│   │
│   └── profile/             # Pagina de perfil do usuario
│       ├── page.tsx         # Componente da pagina (protegida)
│       └── _components/     # Componentes especificos do perfil
│           ├── ProfileHeader.tsx   # Header com avatar, nome e badges
│           ├── ProfileForm.tsx     # Formulario de edicao de perfil
│           └── button-signout.tsx  # Botao de logout
│
└── components/
    └── ui/                  # Componentes reutilizaveis
        ├── Badge.tsx        # Badge com variantes (primary, tertiary, muted)
        ├── Button.tsx       # Botao com variantes (primary, secondary, outline)
        ├── Checkbox.tsx     # Checkbox com label
        ├── Input.tsx        # Input com icone, label e suporte a senha
        └── Select.tsx       # Select dropdown estilizado
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

| Rota | Descricao | Protegida |
|------|-----------|-----------|
| `/` | Pagina inicial | Nao |
| `/login` | Pagina de login | Nao |
| `/register` | Pagina de cadastro | Nao |
| `/profile` | Pagina de perfil do usuario | Sim (requer sessao) |

---

## Tecnologias

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4** (com `@theme inline` para design tokens)
- **TypeScript**
- **Lucide React** (icones)

---

## Dependencias de Backend e Validacao

### Prisma ORM

Utilizado para modelagem de dados e migracoes do banco de dados PostgreSQL.

```bash
# Comandos uteis
npx prisma generate    # Gera o client do Prisma
npx prisma migrate dev # Executa migracoes em desenvolvimento
npx prisma studio      # Interface visual do banco
```

**Pacotes:**
- `@prisma/client` - Client para queries
- `@prisma/adapter-pg` - Adapter para PostgreSQL

### Better Auth

Biblioteca de autenticacao utilizada para gerenciar login, registro e sessoes.

```typescript
// Exemplo de configuracao (lib/auth.ts)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // ... configuracoes adicionais
});
```

### React Hook Form + Zod

Utilizados para controle e validacao de formularios.

```typescript
// Exemplo de schema de validacao
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

```typescript
// Exemplo de uso no componente
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

---

## Estrutura de Validacao (Recomendada)

```
src/
├── lib/
│   ├── auth.ts              # Configuracao do Better Auth
│   ├── prisma.ts            # Instancia do Prisma Client
│   └── validations/
│       ├── auth.ts          # Schemas de login/registro
│       └── index.ts         # Re-exportacoes
│
└── prisma/
    ├── schema.prisma        # Modelo do banco de dados
    └── migrations/          # Historico de migracoes
```

---

## Padroes de Formularios

Todos os formularios devem seguir o padrao:

1. **Schema Zod**: Definir validacao em `lib/validations/`
2. **React Hook Form**: Usar `useForm` com `zodResolver`
3. **Componentes UI**: Utilizar `Input`, `Button`, `Checkbox` de `/components/ui/`
4. **Tratamento de erros**: Exibir mensagens de erro abaixo dos campos

```tsx
// Padrao de exibicao de erro
{errors.email && (
  <span className="text-sm text-destructive">{errors.email.message}</span>
)}
```
