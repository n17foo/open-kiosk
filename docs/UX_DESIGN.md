# OpenKiosk — UX Design Document

> Version 1.0 · Self-Service Retail Kiosk · Best-Practice UX with Upsells & Add-ons

---

## 1. Design Principles

| Principle                | Rationale                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **Zero friction**        | Every extra tap loses a sale. Guest-only checkout, no sign-in walls.                    |
| **3-second rule**        | Any action the customer needs to take must be obvious within 3 seconds.                 |
| **Large touch targets**  | Minimum 64 px hit area. Kiosks are used with fingers, often at odd angles.              |
| **Clear wayfinding**     | Progress indicator always visible during purchase funnel.                               |
| **Revenue optimisation** | Upsells and cross-sells are surfaced at the highest-intent moments, never intrusively.  |
| **Graceful idle**        | Automatic return to Attract screen after 90 s of inactivity to reset for next customer. |
| **Accessibility**        | High contrast, large fonts (base 18 px+), voice-over labels.                            |

---

## 2. Screen Inventory

### Screens to KEEP (with redesign)

| Screen               | Route          | Purpose                                                      |
| -------------------- | -------------- | ------------------------------------------------------------ |
| `SplashScreen`       | `Attract`      | Attract loop — idle state, auto-navigate to Products on tap  |
| `ProductsScreen`     | `Products`     | Browse & search catalogue with category sidebar              |
| `BasketScreen`       | `Basket`       | Review order, inline qty controls, cross-sell strip          |
| `CheckoutScreen`     | `Checkout`     | Guest-only form (name + optional email), payment method pick |
| `PaymentScreen`      | `Payment`      | PED terminal interaction                                     |
| `ConfirmationScreen` | `Confirmation` | Success state + auto-return countdown                        |

### Screens to ADD

| Screen         | Route    | Purpose                                                               |
| -------------- | -------- | --------------------------------------------------------------------- |
| `UpsellScreen` | `Upsell` | Shown immediately after **Add to Basket** — "Would you like to add…?" |

### Screens to REMOVE from kiosk flow

| Screen               | Reason                                                           |
| -------------------- | ---------------------------------------------------------------- |
| `SignInScreen`       | Sign-in creates friction on a kiosk. Removed from customer flow. |
| `SignInPromptScreen` | Replaced by optional email field on Checkout.                    |

---

## 3. Customer Journey (Happy Path)

```
[Attract / Splash]
       ↓  tap anywhere
[Products] ─────────────────────────────────────────────────────────────────┐
  • Category sidebar (left)                                                   │
  • Product grid (right, large cards)                                         │
  • Floating basket button (bottom-right) shows item count + total            │
  • Search bar (top)                                                          │
       ↓  tap "Add"  →  variant/customisation modal (if variants exist)        │
[Upsell Screen]  ←── NEW                                                      │
  • "Customers also bought…" with 2–4 upsell items                           │
  • "No thanks, continue" prominently available                               │
  • "Add to basket" on any upsell item → back to Products                    │
       ↓  "View Basket" / FAB tap
[Basket]
  • Line items with − qty + controls inline
  • Cross-sell horizontal strip: "You might also need…"
  • Order summary (subtotal, tax, total)
  • "Checkout" CTA (primary, full-width)
       ↓
[Checkout]
  • Progress bar (step 1 of 3)
  • Guest form: Name (required), Email (optional, for receipt)
  • Payment method tiles (Card, Cash, Apple Pay, Google Pay)
  • Order summary panel (right side on tablet / below on phone)
  • "Proceed to Payment" CTA
       ↓
[Payment]
  • Progress bar (step 2 of 3)
  • Large amount display
  • PED terminal card with animated status
  • Clear instructions per payment method
       ↓  payment authorised
[Confirmation]
  • Progress bar (step 3 of 3 — complete)
  • Animated success checkmark
  • Order number
  • Auto-return countdown: "Returning to start in 15 s"
  • "Print Receipt" / "Email Receipt" secondary actions
       ↓  countdown expires or "Done" tapped
[Attract / Splash]  ← cycle resets
```

---

## 4. Upsell & Add-on Strategy

### 4.1 When to surface upsells

| Trigger                    | Location                        | Type                                                      |
| -------------------------- | ------------------------------- | --------------------------------------------------------- |
| After "Add to Basket"      | `UpsellScreen`                  | **Upsell** — higher-value alternative or bundle           |
| Basket review              | `BasketScreen` cross-sell strip | **Cross-sell** — complementary products                   |
| Checkout payment selection | `CheckoutScreen`                | **Add-on** — protection plan, gift wrap, express delivery |

### 4.2 UpsellScreen layout

```
┌─────────────────────────────────────────────────────┐
│  ✓ Added to basket!                                  │
│  Men's Premium Cotton T-Shirt · Medium · White       │
│  ────────────────────────────────────────────────── │
│  Customers also bought:                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  [img]   │  │  [img]   │  │  [img]   │           │
│  │ Product  │  │ Product  │  │ Product  │           │
│  │  £XX.XX  │  │  £XX.XX  │  │  £XX.XX  │           │
│  │ [+ Add]  │  │ [+ Add]  │  │ [+ Add]  │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                      │
│  [View Basket (3 items · £XX.XX)]  [Keep Shopping]  │
└─────────────────────────────────────────────────────┘
```

### 4.3 BasketScreen cross-sell strip

```
┌─────────────────────────────────────────────────────┐
│ 💡 You might also like:                              │
│ ◀  [Product] [Product] [Product] [Product]  ▶       │
└─────────────────────────────────────────────────────┘
```

### 4.4 Checkout add-ons (inline with order summary)

```
│  + Gift wrapping                   +£2.99  [Add]    │
│  + Extended warranty               +£4.99  [Add]    │
```

---

## 5. Navigation Changes

### Updated `KioskFlowParamList`

```typescript
type KioskFlowParamList = {
  Attract: undefined;
  Products: { categoryId?: string; searchQuery?: string };
  Upsell: {                           // NEW
    addedProductId: string;
    addedProductName: string;
    basketTotal: number;
    basketItemCount: number;
  };
  Basket: undefined;
  Checkout: { draftOrderId?: string };
  Payment: {
    draftOrderId: string;
    customerName?: string;
    customerEmail?: string;
    selectedPaymentMethod?: PaymentMethod;
  };
  Confirmation: {
    orderId: string;
    paymentResult?: { ... };
    customerName?: string;
    customerEmail?: string;
  };
};
```

### Removed from `KioskFlowParamList`

- `SignIn` (moved to admin-only `RootStackParamList`)
- `SignInPrompt` (removed entirely)

---

## 6. Idle Timeout Behaviour

- **90 seconds** of no touch → auto-navigate to `Attract`
- Timer resets on every touch event
- Implemented via a global `IdleTimer` wrapper in `App.tsx`
- Shown as a subtle "Session ending in Xs" banner in the last 15 s

---

## 7. Progress Indicator

Shown on `Checkout`, `Payment`, and `Confirmation`:

```
●──────●──────○    (step 2 of 3)
Basket  Payment  Done
```

Component: `<CheckoutProgress step={2} />` in `components/ui/`

---

## 8. Basket FAB (Floating Action Button)

Persistent on `ProductsScreen` and `UpsellScreen`:

```
                    ┌──────────────────┐
                    │  🛒  3  ·  £74   │
                    └──────────────────┘  ← bottom-right corner
```

- Shows item count + formatted total
- Bounces when item added
- Navigates to `Basket`

---

## 9. Files Changed Summary

| File                                          | Change                                                       |
| --------------------------------------------- | ------------------------------------------------------------ |
| `docs/UX_DESIGN.md`                           | **NEW** — this document                                      |
| `navigation/types.ts`                         | Add `Upsell` route, remove `SignIn`/`SignInPrompt`           |
| `navigation/MainNavigator.tsx`                | Register `UpsellScreen`, remove sign-in screens              |
| `screens/Splash/SplashScreen.tsx`             | Add idle-return behaviour, rename route ref to `Attract`     |
| `screens/Products/ProductsScreen.tsx`         | Larger cards, FAB basket button, post-add → Upsell           |
| `screens/Upsell/UpsellScreen.tsx`             | **NEW** — upsell/cross-sell screen                           |
| `screens/Basket/BasketScreen.tsx`             | Inline qty controls, cross-sell strip, cleaner layout        |
| `screens/Checkout/CheckoutScreen.tsx`         | Remove sign-in modal, add checkout add-ons, progress bar     |
| `screens/Payment/PaymentScreen.tsx`           | Progress bar, cleaner status UI                              |
| `screens/Confirmation/ConfirmationScreen.tsx` | Auto-return countdown, receipt actions, progress bar         |
| `components/ui/CheckoutProgress.tsx`          | **NEW** — step progress indicator                            |
| `components/ui/BasketFAB.tsx`                 | **NEW** — floating basket button                             |
| `components/ui/CrossSellStrip.tsx`            | **NEW** — horizontal cross-sell scroll                       |
| `services/mockData.ts`                        | Add `upsellProductIds` and `crossSellProductIds` to products |
| `App.tsx`                                     | Add `IdleTimer` wrapper (90 s reset → Attract)               |
