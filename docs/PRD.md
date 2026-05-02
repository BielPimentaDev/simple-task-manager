# PRD — Simple Task Manager

## Visão Geral

Sistema pessoal de gerência de tarefas do dia a dia (treinos, compromissos, afazeres). Uso individual, sem autenticação, sem multiusuário. O objetivo é ter uma API simples que cresce incrementalmente conforme a necessidade.

---

## Usuário

- **Perfil**: Uso individual/pessoal
- **Contexto**: Tarefas cotidianas — saúde, compromissos, afazeres gerais
- **Expectativa**: Interface programática simples via API REST

---

## Modelo de Dados

### Task

| Campo       | Tipo    | Descrição                          |
|-------------|---------|-------------------------------------|
| `id`        | string  | Identificador único (UUID)         |
| `title`     | string  | Descrição da tarefa                |
| `done`      | boolean | Status de conclusão (default: false)|
| `createdAt` | string  | ISO 8601 — data de criação         |
| `updatedAt` | string  | ISO 8601 — última atualização      |

---

## API REST — MVP

Base URL: `http://localhost:3000`

| Método | Rota                    | Descrição              |
|--------|-------------------------|------------------------|
| GET    | `/tasks`                | Listar todas as tarefas|
| POST   | `/tasks`                | Criar nova tarefa      |
| PATCH  | `/tasks/:id/done`       | Marcar como concluída  |
| DELETE | `/tasks/:id`            | Remover tarefa         |

### Exemplos de request/response

**POST /tasks**
```json
// Request
{ "title": "Treinar às 7h" }

// Response 201
{ "id": "uuid", "title": "Treinar às 7h", "done": false, "createdAt": "...", "updatedAt": "..." }
```

**GET /tasks**
```json
// Response 200
[
  { "id": "uuid", "title": "Treinar às 7h", "done": false, "createdAt": "...", "updatedAt": "..." }
]
```

**PATCH /tasks/:id/done**
```json
// Response 200
{ "id": "uuid", "title": "Treinar às 7h", "done": true, "updatedAt": "..." }
```

**DELETE /tasks/:id**
```json
// Response 204 — No Content
```

---

## Persistência

- Arquivo `data/tasks.json` na raiz do projeto
- Leitura/escrita síncrona a cada operação
- Estrutura do arquivo: array de tasks `[]`

---

## Fora do Escopo (MVP)

- Autenticação e autorização
- Categorias, prioridades, recorrência
- Interface web ou CLI
- Banco de dados externo
- Multiusuário

---

## Roadmap (futuro, sem compromisso)

- Filtros por status (`?done=false`)
- Busca por texto no título
- Categorias/tags
- Recorrência de tarefas
- Interface web simples
