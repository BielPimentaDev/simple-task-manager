# Arquitetura — Simple Task Manager

## Stack

- **Runtime**: Node.js
- **Linguagem**: TypeScript (strict mode)
- **Framework HTTP**: Express
- **Persistência**: Arquivo JSON (`data/tasks.json`)
- **Testes**: a definir

## Estilo Arquitetural

Clean Architecture com Arquitetura Hexagonal (Ports & Adapters).

O domínio é completamente isolado de frameworks, bibliotecas e infraestrutura. Dependências sempre apontam para dentro — da infraestrutura para a aplicação, da aplicação para o domínio. Nunca o contrário.

```
[ infrastructure ] → [ application ] → [ domain ]
```

## Estrutura de Pastas

```
src/
  domain/
    entities/
      Task.ts                        ← entidade pura, sem dependências externas
    errors/
      AppError.ts                    ← classe base para todos os erros de domínio
      TaskNotFoundError.ts
      InvalidTaskTitleError.ts

  application/
    ports/
      task/
        ITaskRepository.ts           ← contrato que a persistência deve implementar
    usecases/
      task/
        CreateTaskUseCase.ts
        ListTasksUseCase.ts
        CompleteTaskUseCase.ts
        DeleteTaskUseCase.ts

  infrastructure/
    controllers/
      task/
        TaskController.ts            ← recebe HTTP, chama use case, retorna resposta
        TaskRoutes.ts                ← define rotas Express
    persistence/
      task/
        JsonTaskRepository.ts        ← implementa ITaskRepository com arquivo JSON
    server.ts                        ← configura Express, middlewares globais

  main.ts                            ← composition root: instancia e conecta tudo

data/
  tasks.json                         ← arquivo de persistência

docs/
  PRD.md
  ARCHITECTURE.md
  RULES.md
```

## Regras de Dependência

| Camada | Pode depender de | Nunca pode depender de |
|---|---|---|
| `domain` | nada externo | `application`, `infrastructure`, Express, Node fs |
| `application` | `domain` | `infrastructure`, Express, Node fs |
| `infrastructure` | `application`, `domain` | nada proibido, mas evitar lógica de negócio aqui |

## Camadas em Detalhe

### domain/
Contém apenas entidades e erros. Nenhum import de biblioteca externa. Nenhuma dependência de framework. A entidade `Task` é uma classe ou tipo puro que representa o conceito de negócio.

### application/
Contém os casos de uso e os ports (interfaces TypeScript). Os casos de uso orquestram a lógica de negócio usando as entidades do domínio e os ports para acessar recursos externos. Um caso de uso nunca importa diretamente uma implementação de infraestrutura.

### infrastructure/
Contém tudo que é externo: Express, sistema de arquivos, futuras integrações (Jira, Notion, GitHub). Os controllers traduzem HTTP → use case → HTTP. O repository implementa o port definido em `application/ports/`.

## Injeção de Dependência

Manual, via composition root em `src/main.ts`. Nenhuma biblioteca de DI. A ordem de instanciação é sempre:

```
repository → use cases → controllers → routes → server
```

Exemplo:
```typescript
const repository = new JsonTaskRepository()
const createTask = new CreateTaskUseCase(repository)
const controller = new TaskController(createTask, ...)
const routes = TaskRoutes(controller)
```

## Tratamento de Erros

Erros de domínio são lançados como exceptions customizadas que estendem `AppError`.

```typescript
// domain/errors/AppError.ts
export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
  }
}

// domain/errors/TaskNotFoundError.ts
export class TaskNotFoundError extends AppError {
  constructor(id: string) {
    super(`Task ${id} not found`, 404)
  }
}
```

O controller captura `AppError` e retorna o `statusCode` correspondente. Erros desconhecidos retornam 500.

## Modelo de Dados

Conforme definido no PRD:

```typescript
interface Task {
  id: string        // UUID
  title: string
  done: boolean
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
```
