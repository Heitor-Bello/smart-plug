# Estrutura do Projeto VoltMetric

## Visão Geral

O VoltMetric é uma aplicação de automação residencial para controle de tomadas inteligentes. Este documento descreve a estrutura e as regras de organização do projeto.

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── _components/          # Componentes da landing page (público)
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── CTASection.tsx
│   │   └── Footer.tsx
│   │
│   ├── dashboard/            # Área autenticada (protegida)
│   │   ├── layout.tsx        # Layout com verificação de sessão e navegação
│   │   ├── devices/          # Página de dispositivos
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   └── profile/          # Página de perfil
│   │       ├── page.tsx
│   │       └── _components/
│   │
│   ├── login/                # Página de login (público)
│   ├── register/             # Página de cadastro (público)
│   │
│   ├── layout.tsx            # Layout raiz
│   ├── page.tsx              # Landing page (público)
│   └── globals.css
│
├── components/
│   ├── navigation/           # Componentes de navegação
│   │   ├── Sidebar.tsx       # Menu lateral (desktop)
│   │   └── MobileNav.tsx     # Menu responsivo (mobile)
│   └── ui/                   # Componentes de UI reutilizáveis
│
└── lib/                      # Utilitários e configurações
```

---

## Regras de Roteamento

### Páginas Públicas (Sem Autenticação)
- `/` - Landing page
- `/login` - Página de login
- `/register` - Página de cadastro

### Páginas Protegidas (Requerem Autenticação)
Todas as páginas que requerem autenticação **DEVEM** estar dentro do diretório `/dashboard`.

- `/dashboard/devices` - Gerenciamento de dispositivos
- `/dashboard/profile` - Perfil do usuário

O arquivo `dashboard/layout.tsx` é responsável por:
1. Verificar se o usuário está autenticado
2. Redirecionar para `/login` se não estiver
3. Exibir o menu de navegação (Sidebar/MobileNav)

---

## Adicionando Novas Páginas Protegidas

Para adicionar uma nova página que requer autenticação:

1. Crie a pasta dentro de `/src/app/dashboard/`
2. Adicione o `page.tsx` e `_components/` se necessário
3. Adicione o link no array `navItems` em:
   - `/src/components/navigation/Sidebar.tsx`
   - `/src/components/navigation/MobileNav.tsx`

Exemplo de item de navegação:
```tsx
const navItems = [
  { label: "Dispositivos", href: "/dashboard/devices", icon: Cpu },
  { label: "Perfil", href: "/dashboard/profile", icon: User },
  // Adicione novos itens aqui:
  { label: "Nova Página", href: "/dashboard/nova-pagina", icon: IconComponent },
];
```

---

## Componentes de Navegação

### Sidebar (Desktop)
- Menu lateral fixo à esquerda
- Sempre visível em telas maiores (lg:)
- Contém logo, links de navegação e botão de logout

### MobileNav (Mobile)
- Header fixo no topo com logo e botão de menu
- Menu dropdown com animação
- Visível apenas em telas menores (< lg:)

---

## Convenções

### Nomenclatura
- Componentes: PascalCase (ex: `DeviceList.tsx`)
- Páginas: `page.tsx` (convenção Next.js)
- Componentes locais: pasta `_components/` dentro da rota

### Estilização
- Tailwind CSS para estilos
- Design tokens definidos em `globals.css`
- Cores principais: `--primary` (ciano), `--background` (escuro)

### Autenticação
- Sessão gerenciada via cookies HTTP-only
- Verificação de sessão no `dashboard/layout.tsx`
- Redirecionamento automático para login se não autenticado
