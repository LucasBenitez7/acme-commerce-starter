---

## 3) `ARCHITECTURE.actions.god-functions.as-is-vs-to-be.md`

```md
# Server Actions “God Functions” — AS-IS vs TO-BE

## AS-IS (actual)

Problema: algunas actions hacen demasiadas cosas (parseo, validación, cálculos, stock, transacción, side-effects).
Ejemplo típico: `createOrderAction` en checkout.
```

Objetivo: sacar lógica pesada de `actions.ts` y centralizar reglas en servicios.
Beneficio: menos “God functions”, menos duplicación, más testeable.

```mermaid
flowchart TD
  subgraph Next["Next.js Layer"]
    Actions["Server Actions (actions.ts)"]
    API["API Routes / Cron"]
  end

  subgraph Services["Services Layer (lib/services)"]
    Inventory["InventoryService"]
    Orders["OrderService"]
    Catalog["CatalogService"]
  end

  Prisma["Prisma Client"]
  DB["PostgreSQL"]

  Actions --> Inventory
  Actions --> Orders
  Actions --> Catalog

  API --> Inventory
  API --> Orders

  Inventory --> Prisma
  Orders --> Prisma
  Catalog --> Prisma

  Prisma --> DB
```

```mermaid
flowchart TD
  Action["checkout/actions.ts:createOrderAction"] --> Parse["Parse input/cookies"]
  Action --> Validate["Validar campos"]
  Action --> Totals["Calcular totales"]
  Action --> Stock["Verificar y ajustar stock"]
  Action --> Tx["Transacción Prisma: create Order/Items"]
  Action --> Cleanup["Limpiar cookies/carrito"]

  style Action stroke:#b91c1c,stroke-width:2px
  style Parse stroke:#b91c1c,stroke-width:2px
  style Validate stroke:#b91c1c,stroke-width:2px
  style Totals stroke:#b91c1c,stroke-width:2px
  style Stock stroke:#b91c1c,stroke-width:2px
  style Tx stroke:#b91c1c,stroke-width:2px
  style Cleanup stroke:#b91c1c,stroke-width:2px
```

```mermaid
flowchart TD
  Action["checkout/actions.ts:createOrderAction"] --> OrderSvc["lib/services/orders.ts"]
  Action --> PricingSvc["lib/services/pricing.ts"]
  Action --> InventorySvc["lib/services/inventory.ts"]

  OrderSvc --> Prisma["Prisma"]
  PricingSvc --> Prisma
  InventorySvc --> Prisma
  Prisma --> DB["PostgreSQL"]

  style Action stroke:#374151
  style OrderSvc stroke:#15803d,stroke-width:2px
  style PricingSvc stroke:#15803d,stroke-width:2px
  style InventorySvc stroke:#15803d,stroke-width:2px
```
