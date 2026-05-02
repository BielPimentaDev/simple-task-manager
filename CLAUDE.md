# Simple Task Manager — Claude Guidelines

## Sobre o Projeto

Sistema pessoal de gerência de tarefas do dia a dia. API REST em TypeScript com Node.js e Express. Uso individual, sem autenticação, crescimento incremental.

## Documentação de Referência

- @docs/PRD.md — requisitos do produto, modelo de dados, endpoints
- @docs/ARCHITECTURE.md — arquitetura hexagonal, estrutura de pastas, regras de dependência
- @docs/RULES.md — convenções de código, padrões, o que evitar
- @docs/TESTING.md — estratégia de testes, TDD, estrutura, builders, fakes

## Instruções Gerais

- Sempre leia o PRD antes de implementar qualquer funcionalidade
- Sempre siga a arquitetura definida em ARCHITECTURE.md — nunca quebre as regras de dependência entre camadas
- Sempre siga as convenções em RULES.md
- Desenvolvimento guiado por TDD: testes antes da implementação
- Injeção de dependência manual via composition root em `src/main.ts`
- Erros de domínio sempre via exceptions customizadas que estendem `AppError`
