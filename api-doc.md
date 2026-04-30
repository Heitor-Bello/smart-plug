# API Documentation — Smart Plug

Base URL: `/api`

Todos os endpoints retornam JSON. Endpoints protegidos exigem uma sessão autenticada (cookie de sessão gerenciado pelo Better Auth). Respostas de erro seguem o formato `{ "error": "mensagem" }`.

---

## Autenticação

### `GET /api/auth/[...all]`
### `POST /api/auth/[...all]`

Manipulador genérico do [Better Auth](https://better-auth.com). Responsável por todos os fluxos de autenticação:

- Login com e-mail e senha
- Cadastro
- Logout
- Login com Google (OAuth)
- Solicitação e redefinição de senha

Os sub-caminhos são resolvidos internamente pela biblioteca (ex: `/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/reset-password`, etc).

---

## Dashboard

### `GET /api/dashboard`

Retorna os dados consolidados do dashboard para o usuário autenticado: lista de dispositivos com a leitura mais recente e métricas agregadas.

**Autenticação:** obrigatória

**Resposta `200`**
```json
{
  "devices": [
    {
      "id": "cuid",
      "name": "Tomada Sala",
      "userId": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "readings": [
        {
          "id": "cuid",
          "current": 1.23,
          "power": 280.5,
          "energy": 0.045,
          "timestamp": "2026-04-15T22:00:00.000Z",
          "deviceId": "..."
        }
      ]
    }
  ],
  "totalPower": 280.5,
  "totalCurrent": 1.23,
  "totalEnergy": 0.045,
  "activeDevices": 1,
  "tariff": 0.72
}
```

> **Nota:** `totalPower`, `totalCurrent` e `activeDevices` consideram apenas leituras recentes (< 10 s). `totalEnergy` considera todas as leituras independente da idade.

---

## Dispositivos

### `GET /api/devices`

Lista todos os dispositivos cadastrados pelo usuário autenticado, ordenados do mais recente ao mais antigo.

**Autenticação:** obrigatória

**Resposta `200`**
```json
[
  {
    "id": "cuid",
    "name": "Tomada Sala",
    "userId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `POST /api/devices`

Cria um novo dispositivo vinculado ao usuário autenticado.

**Autenticação:** obrigatória

**Body**
```json
{
  "name": "Tomada Sala"
}
```

| Campo | Tipo   | Obrigatório | Descrição              |
|-------|--------|-------------|------------------------|
| name  | string | sim         | Nome do dispositivo    |

**Resposta `201`**
```json
{
  "id": "cuid",
  "name": "Tomada Sala",
  "userId": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Erros**
| Status | Motivo                          |
|--------|---------------------------------|
| 400    | `name` ausente ou vazio         |
| 401    | Não autenticado                 |

---

### `PATCH /api/devices/[deviceId]`

Renomeia um dispositivo existente. Apenas o dono do dispositivo pode renomeá-lo.

**Autenticação:** obrigatória

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Body**
```json
{
  "name": "Novo Nome"
}
```

**Resposta `200`** — dispositivo atualizado (mesmo formato do `POST /api/devices`)

**Erros**
| Status | Motivo                                    |
|--------|-------------------------------------------|
| 400    | `name` ausente ou vazio                   |
| 401    | Não autenticado                           |
| 404    | Dispositivo não encontrado ou sem permissão |

---

### `DELETE /api/devices/[deviceId]`

Remove um dispositivo e todas as suas leituras (cascade). Apenas o dono pode deletar.

**Autenticação:** obrigatória

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Resposta `204`** — sem corpo

**Erros**
| Status | Motivo                                    |
|--------|-------------------------------------------|
| 401    | Não autenticado                           |
| 404    | Dispositivo não encontrado ou sem permissão |

---

## Leituras

### `POST /api/devices/[deviceId]/readings`

Recebe e armazena uma leitura de sensor enviada pelo dispositivo (ESP32). Este endpoint **não exige autenticação de sessão** — é chamado diretamente pelo hardware.

**Parâmetro de rota**
| Parâmetro | Tipo   | Descrição      |
|-----------|--------|----------------|
| deviceId  | string | ID do device   |

**Body**
```json
{
  "corrente": 1.23,
  "potencia": 280.5,
  "energia": 0.045
}
```

| Campo    | Tipo   | Obrigatório | Range              | Descrição                  |
|----------|--------|-------------|-------------------|----------------------------|
| corrente | number | sim         | 0 – 100 A         | Corrente elétrica (A)      |
| potencia | number | sim         | 0 – 25 000 W      | Potência instantânea (W)   |
| energia  | number | sim         | ≥ 0 kWh           | Energia acumulada (kWh)    |

**Resposta `201`**
```json
{
  "id": "cuid"
}
```

**Erros**
| Status | Motivo                                          |
|--------|-------------------------------------------------|
| 400    | Campos ausentes ou com tipo inválido            |
| 404    | `deviceId` não encontrado                       |
| 422    | Valores fora do range permitido                 |

---

## Usuário

### `PATCH /api/user/tariff`

Atualiza a tarifa de energia (R$/kWh) do usuário autenticado, usada para calcular o custo estimado no dashboard.

**Autenticação:** obrigatória

**Body**
```json
{
  "tariff": 0.72
}
```

| Campo  | Tipo   | Obrigatório | Validação         |
|--------|--------|-------------|-------------------|
| tariff | number | sim         | ≥ 0               |

**Resposta `200`**
```json
{
  "tariff": 0.72
}
```

**Erros**
| Status | Motivo                          |
|--------|---------------------------------|
| 400    | `tariff` ausente ou negativo    |
| 401    | Não autenticado                 |

---

## Upload

### `POST /api/upload/avatar`

Faz o upload da foto de perfil do usuário para o Vercel Blob Storage. Substitui automaticamente o avatar anterior se ele também estiver no Blob.

**Autenticação:** obrigatória

**Content-Type:** `multipart/form-data`

| Campo  | Tipo | Obrigatório | Descrição           |
|--------|------|-------------|---------------------|
| avatar | File | sim         | Imagem de perfil    |

**Restrições**
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Tamanho máximo: **5 MB**
- Validação por magic bytes (além do MIME type)

**Resposta `200`**
```json
{
  "url": "https://....public.blob.vercel-storage.com/avatars/..."
}
```

**Erros**
| Status | Motivo                                     |
|--------|--------------------------------------------|
| 400    | Nenhum arquivo enviado                     |
| 400    | Tipo de arquivo não suportado              |
| 400    | Arquivo muito grande (> 5 MB)              |
| 400    | Magic bytes inválidos (arquivo corrompido) |
| 401    | Não autenticado                            |
