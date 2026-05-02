# Regras de Desenvolvimento — Simple Task Manager

## TypeScript

- `strict: true` sempre habilitado no `tsconfig.json`
- Sem `any` — use `unknown` quando o tipo for incerto e faça narrowing explícito
- Prefira `interface` para contratos (ports, shapes de objetos externos) e `type` para unions e aliases
- Todos os campos de entidades de domínio são `readonly`
- Sem enums — use `as const` objects ou union types literais

## Nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Classes | PascalCase | `CreateTaskUseCase` |
| Interfaces | PascalCase com prefixo `I` | `ITaskRepository` |
| Arquivos de classe | PascalCase | `TaskController.ts` |
| Arquivos de tipo/util | camelCase | `taskMapper.ts` |
| Variáveis e funções | camelCase | `createTask`, `taskId` |
| Constantes globais | UPPER_SNAKE_CASE | `MAX_TITLE_LENGTH` |
| Métodos de use case | verbo + substantivo | `execute(input): output` |

## Estrutura de Use Case

Todo use case expõe apenas um método público: `execute`. Recebe um input tipado, retorna um output tipado. Nunca recebe objetos HTTP (Request, Response).

```typescript
class CreateTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> { ... }
}
```

## Controllers

- Responsabilidade única: traduzir HTTP → use case → HTTP
- Nenhuma lógica de negócio no controller
- Sempre capturar `AppError` e mapear para status HTTP
- Erros desconhecidos retornam 500 com mensagem genérica

```typescript
try {
  const result = await this.createTask.execute(input)
  res.status(201).json(result)
} catch (error) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message })
  } else {
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

## TDD

- Escreva o teste antes da implementação — sem exceções
- Ciclo obrigatório: Red → Green → Refactor
- Estratégia completa de testes em @docs/TESTING.md

## O que Nunca Fazer

- Nunca importe Express dentro de `domain/` ou `application/`
- Nunca importe `fs` ou qualquer módulo Node dentro de `domain/` ou `application/`
- Nunca instancie `JsonTaskRepository` dentro de um use case
- Nunca coloque lógica de negócio em controllers ou routes
- Nunca use `console.log` no código de produção
- Nunca commite com testes falhando
- Nunca pule a etapa de Red no TDD — a implementação só começa após o teste falhar

## Commits

- Mensagens em inglês, imperativo, sem ponto final
- Prefixos obrigatórios: `feat:`, `fix:`, `test:`, `refactor:`, `chore:`, `docs:`
- Um commit por use case implementado (test + implementation juntos)

Exemplos:
```
feat: add CreateTaskUseCase
test: add unit tests for ListTasksUseCase
fix: handle empty title in task creation
```
