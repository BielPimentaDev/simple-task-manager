# Estratégia de Testes — Simple Task Manager

## Abordagem

TDD como prática principal. O teste é escrito antes da implementação, sem exceções.

Ciclo obrigatório:
1. **Red** — escreve o teste, vê falhar
2. **Green** — escreve o mínimo para passar
3. **Refactor** — melhora sem quebrar o teste

Testes são documentação viva do sistema. O nome do teste deve comunicar o comportamento, não a implementação.

---

## Framework

- **Jest** com `ts-jest` para TypeScript
- **Watch mode** durante desenvolvimento (suporte ao ciclo TDD)
- **Pre-commit hook** e **CI** como gate de qualidade — nenhum commit ou merge com testes falhando

---

## Cobertura

- Mínimo de **85%** — enforçado no CI
- Foco em qualidade e comportamento, não em atingir a métrica por si só
- Cobertura de linhas não substituí cobertura de cenários — um teste mal escrito que cobre uma linha não conta

---

## Pirâmide de Testes

```
        [ E2E Interno ]          ← poucos, fluxos críticos completos
      [ Integração Nível 1 ]     ← use case + repository real
    [    Testes Unitários    ]    ← maioria, rápidos, isolados
```

---

## Tipos de Teste

### Unitários (`tests/unit/`)
- Cobrem: entidades de domínio, use cases, erros
- Isolamento via `InMemoryTaskRepository` — nunca a implementação real
- Rápidos, sem I/O, sem rede

### Integração Nível 1 (`tests/integration/`)
- Sufixo: `.integration.spec.ts`
- Escopo: Use Case → `JsonTaskRepository` → arquivo JSON temporário
- Testa a integração entre application e infrastructure
- Usa arquivo `.tmp.json` criado e destruído por teste

### Integração Nível 2 / E2E Interno (`tests/e2e/`)
- Sufixo: `.e2e.spec.ts`
- Escopo: HTTP Request → Controller → Use Case → Repository → arquivo JSON temporário
- Testa o fluxo completo de ponta a ponta via `supertest`
- Cobre apenas fluxos críticos — não replica cenários já cobertos nos unitários

---

## Cenários Obrigatórios

Todo use case deve ter testes cobrindo:

| Cenário | Descrição |
|---|---|
| Happy path | Fluxo principal com dados válidos |
| Casos negativos | Validações inválidas, erros de entrada |
| Edge cases | Boundary conditions (título com 1 char, lista vazia, etc.) |
| Exceções | Erros esperados lançados corretamente (`TaskNotFoundError`, etc.) |
| Transições de estado | Ex: task `done: false` → `done: true` |
| Idempotência | Ex: completar uma task já concluída |

Concorrência testada apenas quando a implementação envolver operações assíncronas com risco real de race condition.

---

## Estrutura de Pastas

```
tests/
  unit/
    domain/
      entities/
        Task.spec.ts
      errors/
        AppError.spec.ts
    application/
      usecases/
        task/
          CreateTaskUseCase.spec.ts
          ListTasksUseCase.spec.ts
          CompleteTaskUseCase.spec.ts
          DeleteTaskUseCase.spec.ts

  integration/
    task/
      JsonTaskRepository.integration.spec.ts
      CreateTask.integration.spec.ts

  e2e/
    task/
      TaskRoutes.e2e.spec.ts

  fakes/
    task/
      InMemoryTaskRepository.ts       ← implementa ITaskRepository em memória

  builders/
    task/
      TaskBuilder.ts                  ← fluent builder para cenários complexos
      makeTask.ts                     ← factory function para casos simples
```

---

## Test Doubles

Apenas `InMemoryTaskRepository` como fake — implementa `ITaskRepository` usando um array em memória. Colocado em `tests/fakes/task/`, reutilizável em qualquer teste unitário.

Nunca usar `jest.mock()` para mockar domínio ou use cases — testar diretamente.

```typescript
// tests/fakes/task/InMemoryTaskRepository.ts
export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Task[] = []

  async save(task: Task): Promise<void> {
    this.tasks.push(task)
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.find(t => t.id === id) ?? null
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks]
  }

  async update(task: Task): Promise<void> {
    const index = this.tasks.findIndex(t => t.id === task.id)
    if (index >= 0) this.tasks[index] = task
  }

  async delete(id: string): Promise<void> {
    this.tasks = this.tasks.filter(t => t.id !== id)
  }
}
```

---

## Builders de Dados de Teste

**Factory function** para casos simples — defaults sensatos, override parcial:

```typescript
// tests/builders/task/makeTask.ts
export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-default',
  title: 'Default task title',
  done: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})
```

**Builder class** para cenários complexos com múltiplos campos e legibilidade:

```typescript
// tests/builders/task/TaskBuilder.ts
export class TaskBuilder {
  private task: Task = makeTask()

  withTitle(title: string): this {
    this.task = { ...this.task, title }
    return this
  }

  withDone(done: boolean): this {
    this.task = { ...this.task, done }
    return this
  }

  withId(id: string): this {
    this.task = { ...this.task, id }
    return this
  }

  build(): Task {
    return { ...this.task }
  }
}
```

---

## Estrutura de Teste (AAA)

```typescript
describe('CreateTaskUseCase', () => {
  describe('execute', () => {
    it('creates a task with correct fields when title is valid', async () => {
      // Arrange
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      // Act
      const result = await useCase.execute({ title: 'Treinar às 7h' })

      // Assert
      expect(result.title).toBe('Treinar às 7h')
      expect(result.done).toBe(false)
      expect(result.id).toBeDefined()
    })

    it('throws InvalidTaskTitleError when title is empty', async () => {
      // Arrange
      const repository = new InMemoryTaskRepository()
      const useCase = new CreateTaskUseCase(repository)

      // Act & Assert
      await expect(useCase.execute({ title: '' }))
        .rejects.toThrow(InvalidTaskTitleError)
    })
  })
})
```

---

## O que Nunca Fazer

- Nunca escrever implementação antes do teste (viola TDD)
- Nunca usar `jest.mock()` para mockar entidades ou use cases
- Nunca compartilhar estado entre testes — cada `it` é independente
- Nunca usar `data/tasks.json` nos testes — sempre arquivo temporário
- Nunca testar detalhes de implementação — testar comportamento e contratos
- Nunca escrever testes redundantes que não acrescentam documentação ou cobertura de cenário
