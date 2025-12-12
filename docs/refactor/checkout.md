## 2) `ARCHITECTURE.checkout.validation.as-is-vs-to-be.md`

```md
# Checkout — Validación AS-IS vs TO-BE

## AS-IS (actual)

Problema: validación duplicada e inconsistente:

- Cliente: validación manual en `useCheckoutForm`
- Servidor: validación distinta en `checkout/actions.ts`
```

```mermaid
flowchart LR
  CheckoutUI["Checkout UI"]
  Hook["hooks/useCheckoutForm.ts (validación cliente)"]
  Action["checkout/actions.ts (validación server)"]
  Schema["lib/validation/checkout.ts (Zod único)"]

  CheckoutUI --> Hook
  CheckoutUI --> Action

  Hook -->|Debería usar| Schema
  Action -->|Debería usar| Schema
```

```mermaid
flowchart LR
  UI["Checkout UI"] --> Hook["hooks/use-checkout-form.ts"]
  UI --> Action["app/(site)/(shop)/checkout/actions.ts"]

  Hook --> ClientRules["Validación manual (cliente)"]
  Action --> ServerRules["Validación manual/Zod parcial (server)"]

  style Hook stroke:#b91c1c,stroke-width:2px
  style Action stroke:#b91c1c,stroke-width:2px
  style ClientRules stroke:#b91c1c,stroke-width:2px
  style ServerRules stroke:#b91c1c,stroke-width:2px
```

```mermaid
flowchart LR
  UI["Checkout UI"] --> RHF["react-hook-form"]
  RHF --> Schema["lib/validation/checkout.ts (Zod)"]

  UI --> Action["checkout/actions.ts"]
  Action --> Schema

  Schema --> Errors["Errores consistentes"]

  style Schema stroke:#15803d,stroke-width:2px
  style RHF stroke:#374151
  style Action stroke:#374151
  style Errors stroke:#374151
```
