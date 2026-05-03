# ADR-002 — Category identifier as name

## Contexto
Ao modelar o recurso Category, surgiu a decisão sobre qual campo usar como identificador único: um UUID gerado (como em Task) ou o próprio `name`, que já é único por regra de negócio.

## Decisão
Usar `name` como identificador único de Category, sem campo `id`.

## Por que
O nome da categoria é intrinsecamente único (case-insensitive) e legível. Usar UUID criaria um segundo identificador redundante, tornando as URLs de endpoint menos expressivas (`/categories/3f2a...` vs `/categories/Work`) e adicionando complexidade sem benefício real para este sistema de uso individual. Como não há requisito de renomear categorias preservando referências externas estáveis, o `name` é suficiente como referencial.
