# TitikTemu Design System

This document is the design brief for Claude Code and anyone extending the TitikTemu frontend. Treat the existing implementation as the source of truth. New interfaces should feel like part of the same civic-data product: calm, legible, operational, and trustworthy.

## Product Character

TitikTemu helps government, property, ESG, and UMKM users understand location risk, discover businesses, simulate policy, and plan allocation. The interface should support scanning, comparison, and decisions rather than marketing-style browsing.

Use these qualities as a filter:

- **Clear:** Make the next action, current state, and data provenance obvious.
- **Grounded:** Use maps, charts, tables, badges, and concise narratives to explain spatial or model data.
- **Quietly confident:** Prefer a clean white surface, cool neutrals, and restrained teal/green accents over visual noise.
- **Compact but breathable:** Use dense dashboard layouts while preserving clear grouping and readable labels.
- **Human:** Use plain Indonesian or product-appropriate language. Explain model outputs without overstating certainty.

Do not introduce a separate visual language for a new route. Reuse the existing primitives and tokens first.

## Visual Direction

The visual system is a light, cool civic-tech interface with a fresh teal primary and green secondary. It is not a dark dashboard, a glossy startup landing page, or a purple SaaS template.

- Backgrounds are white or `neutral-50`.
- Content surfaces are white with a subtle `neutral-200` border.
- Teal communicates primary actions, active navigation, links, and focus.
- Green communicates positive, safe, selected, or sustainable states.
- Red is reserved for destructive actions and danger/error states.
- Use color with text, icons, or labels; never make color the only carrier of meaning.
- Avoid decorative gradients, floating blobs, excessive shadows, and nested cards.

## Tokens

The canonical tokens live in `app/globals.css`. Use Tailwind token classes or CSS variables instead of inventing one-off values.

### Typography

The font is **Outfit**, loaded in `app/globals.css` and used for both sans and heading styles. Use the project text utilities where possible:

| Role         | Size | Line height | Weight | Utility   |
| ------------ | ---: | ----------: | -----: | --------- |
| H1           | 48px |         1.1 |    700 | `text-h1` |
| H2           | 40px |        1.15 |    700 | `text-h2` |
| H3           | 32px |         1.2 |    700 | `text-h3` |
| H5           | 24px |        1.25 |    600 | `text-h5` |
| H6           | 20px |         1.3 |    600 | `text-h6` |
| Section / S5 | 18px |         1.4 |    600 | `text-s5` |
| Section / S6 | 16px |        1.45 |    600 | `text-s6` |
| Section / S7 | 14px |        1.45 |    600 | `text-s7` |
| Section / S8 | 13px |         1.4 |    600 | `text-s8` |
| Section / S9 | 12px |        1.35 |    600 | `text-s9` |
| Body / B7    | 16px |         1.5 |    400 | `text-b7` |
| Body / B8    | 14px |         1.5 |    400 | `text-b8` |
| Body / B9    | 12px |        1.45 |    400 | `text-b9` |

Use `font-semibold` for labels, controls, and short headings. Use `font-bold` for true page headings only. Do not use all caps for long content; small uppercase eyebrow labels may use tracking for navigation or metadata.

### Color

Use the named families below. The values are the current canonical palette.

| Family          | Key values                                                                                                                                                                                                                                                                       | Use                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Primary teal    | `primary-50 #f1f8f8`, `primary-100 #dbf4f5`, `primary-300 #68f0f3`, `primary-500 #00a6a8`, `primary-600 #00878a`, `primary-700 #00696b`, `primary-800 #02494b`, `primary-900 #042e2f`                                                                                            | Primary actions, active states, focus, links          |
| Secondary green | `secondary-50 #edf8ed`, `secondary-100 #daf2d9`, `secondary-300 #9ae396`, `secondary-500 #50cf4a`, `secondary-600 #39b332`, `secondary-700 #2e8e29`, `secondary-800 #266722`, `secondary-900 #1b4319`                                                                            | Positive state, safe zone, sustainability, brand mark |
| Neutral         | `neutral-0 #ffffff`, `neutral-50 #f6f8f8`, `neutral-100 #eef1f2`, `neutral-200 #dde2e3`, `neutral-300 #bdc5c7`, `neutral-400 #939d9f`, `neutral-500 #6f797b`, `neutral-600 #515a5c`, `neutral-700 #394041`, `neutral-800 #262b2c`, `neutral-900 #171b1c`, `neutral-1000 #0d1111` | Surfaces, borders, text, disabled states              |
| Destructive     | `#D90E10`                                                                                                                                                                                                                                                                        | Delete, irreversible action, error, danger            |

For normal UI, prefer `text-neutral-900` or `text-neutral-700` for content and `text-neutral-500`/`text-neutral-600` for supporting text. Keep body text on `neutral-0` or `neutral-50` at a readable contrast.

### Shape, Spacing, and Elevation

- The base radius is `0.625rem` (10px). The standard mappings are `rounded-lg` for controls and `rounded-xl` for framed panels.
- Use `rounded-lg` for buttons, inputs, logos, and navigation items. Use `rounded-xl` for detail panels and map-side panels.
- Use `border border-border` or `border-neutral-200` for separation. Avoid heavy outlines.
- The common page gutter is `p-6`; common workspace rhythm is `gap-4`.
- Use `gap-2` for related metadata, `gap-3` for control groups, and `gap-4` for sections. Increase to `gap-6` or `gap-8` for major page regions.
- Prefer borders and surface contrast over drop shadows. If elevation is needed for a popover or modal, keep it subtle and functional.
- Keep controls at stable heights. The shared button defaults to `h-14`; compact actions use `h-7`, `h-6`, or icon sizes from the shared component.

## Layout

The root shell is in `app/layout.tsx` and provides the collapsible `AppSidebar`, `SidebarProvider`, and main content area. Route pages should compose inside that shell rather than recreating navigation.

### Application Shell

- Use the existing `AppSidebar` for product navigation and preserve its active-route behavior.
- Sidebar navigation uses lucide icons, `h-14` items, `rounded-xl`, and teal active state (`bg-primary-700 text-neutral-0`).
- The sidebar collapses to icon-only mode. Every icon-only item needs an `aria-label` and the existing tooltip behavior.
- Keep the main workspace usable when the sidebar is collapsed. Do not hardcode content widths that assume the expanded sidebar.

### Page Workspaces

A typical route should use:

```tsx
<div className="flex flex-col gap-4 p-6">
  <header>
    <h1 className="text-h6 font-semibold">Page title</h1>
    <p className="text-b8 text-neutral-600">Short context for the page.</p>
  </header>
  {/* controls, data, and supporting panels */}
</div>
```

- Put the page title and one-sentence context at the top.
- Keep filters and selectors in a wrapping flex row so they remain usable on narrow screens.
- Use `flex-col lg:flex-row` for map/detail or chart/detail compositions.
- Give side panels a stable width on large screens, commonly `lg:w-80`, and `w-full` on small screens.
- Avoid placing a card inside another card. Use a full-width section for grouping, then individual framed panels only where a boundary helps scanning.
- Leave enough of the following content visible on small viewports to communicate that the page continues.

## Components

Use the shared components in `app/components/ui/` before adding custom controls. The live component reference is available at `/design-system/`.

### Buttons

Import `Button` from `@/app/components/ui/button`.

- `primary`: the default high-priority action, teal filled.
- `primary-ghost`: secondary teal action with an outline.
- `secondary`: positive/green action.
- `secondary-ghost`: outlined green action.
- `red` and `red-ghost`: destructive actions only.
- `neutral`, `outline`, and `ghost`: low-emphasis or utility actions.
- Use `size="icon"`, `icon-sm`, or `icon-lg` for icon-only controls. Use a lucide icon and provide an accessible label or tooltip.
- Keep button labels short and action-oriented: `View Reallocation`, `Save`, `Apply Filter`.
- Do not use a text button where a familiar icon-only action is clearer, but do not hide an unfamiliar action behind an unlabeled icon.

### Inputs and Selection

Use `FieldLabel` and `Input` for text entry. Use the shared `Select`, `Dropdown`, `Checkbox`, `RadioGroup`, and `FileInput` for their respective interactions.

- Always associate a visible label with a form control. Mark required fields consistently.
- Use `startIcon` or `endIcon` only when it improves recognition or provides a meaningful affordance.
- Preserve clear focus, disabled, filled, error, and loading states.
- Keep labels at `text-s7` or `text-s8`; supporting help and error text should be `text-b9` or `text-b8`.
- Do not use placeholder text as the only label.

### Badges and Status

Use `Badge` for compact categorical states such as zone labels, confidence, selected filters, and model status.

- Teal: active or primary state.
- Green: safe, positive, sustainable, or confirmed state.
- Red: danger, error, or destructive state.
- Pair status color with a readable label such as `AMAN`, `WASPADA`, or `BAHAYA`.
- Keep badges compact and do not use them as buttons unless the interaction is explicit.

### Panels, Alerts, and Feedback

- Use a bordered `rounded-xl` panel for a focused detail area, as in the map `Zone Detail` panel.
- Use `Alert` for important contextual feedback that should remain visible, not for ordinary helper text.
- Use `Skeleton` for loading regions when the final shape is known. Avoid layout shifts.
- Use empty states that explain what is missing and what action can resolve it.
- Error copy should say what failed and, when useful, how to recover. Never expose raw stack traces or internal implementation details.

### Icons

Use Lucide icons, already used throughout the shared components and sidebar. Keep the default stroke style light and consistent with neighboring icons. Use icons to reinforce meaning, not as decoration. Icon-only controls require an accessible name and a tooltip when their meaning is not immediately familiar.

## Maps, Charts, and Model Output

Maps and visualizations are core product surfaces, not decorative backgrounds.

- Keep the map or chart visually dominant in its workspace and place interpretation beside it.
- Always provide a textual legend, label, or detail panel for color-coded map regions and chart series.
- Show model confidence and uncertainty near the result. Do not imply that a prediction is a fact.
- Preserve readable hover, selected, loading, no-data, and error states.
- Keep interactive map controls discoverable and keyboard-accessible where the underlying library permits.
- Use green/teal/red zone colors consistently with their semantic meaning, and ensure labels remain readable over the visualization.
- For a map plus detail layout, use the map in a flexible region and a `w-full lg:w-80` detail panel on large screens.
- Avoid putting essential explanatory text only in a tooltip or map hover state.

## Motion and Interaction

Motion should clarify change, not entertain.

- Use the transition behavior already built into shared controls.
- Animate state changes such as opening a panel, selecting a filter, or revealing a result with short, low-amplitude transitions.
- Do not add continuous decorative animation to dashboard surfaces or data visualizations.
- Active controls should have visible hover, focus-visible, pressed, disabled, and selected states.
- Preserve keyboard navigation and do not rely on hover as the only way to discover information.

## Accessibility

Every new screen and component must meet these baseline expectations:

- Use semantic landmarks and heading order.
- Every input has a label; every icon-only button has an accessible name.
- Keyboard focus is visible. Preserve the shared `focus-visible` ring behavior.
- Do not convey status by color alone.
- Maintain sufficient contrast for text, borders, controls, and map/chart labels.
- Respect reduced-motion preferences when adding custom animation.
- Keep text inside its container at mobile and desktop widths. Test long Indonesian labels and empty/error copy.
- Announce dynamic loading and error states where appropriate.

## Responsive Behavior

Design mobile-first, then add large-screen composition.

- Start with one-column stacks and `w-full` controls.
- Use `flex-wrap` for filter rows and `lg:flex-row` for side-by-side analytical views.
- Do not let tables, charts, maps, or long labels force horizontal overflow without an intentional scroll region.
- Keep touch targets comfortably usable; use the shared icon sizes rather than shrinking controls below their established compact sizes.
- Check at least a narrow mobile viewport and a desktop viewport before considering a screen complete.

## Implementation Rules for Claude Code

1. Inspect and reuse the closest existing component before creating a new primitive.
2. Use the tokens and utilities in `app/globals.css`; do not create a parallel palette or typography system.
3. Keep route composition in `app/` and reusable UI in `app/components/`. Keep map browser-only behavior dynamically imported as the existing map module does.
4. Use TypeScript types for data-driven UI, especially zone, UMKM, chart, and map data.
5. Keep fetching in the existing hooks and infrastructure layers. Components should render typed states rather than embedding unrelated data access.
6. Include loading, error, empty, disabled, and success states for user-facing workflows.
7. Prefer small, focused edits and preserve existing public component APIs.
8. After UI changes, run the narrowest relevant lint, typecheck, or build command and inspect the result at both mobile and desktop widths when a browser check is available.


## Context
There are two primary user, one is UMKM user and one is Operator. Read /design directory, thats where the Figma design is. For the current design, adjust to the Figma design. Skip auth, forms, for now. Do de necessary design works with the backend and analytics. AI Chatbot cannot process an unrelevant prompt or injection, and this is for both the UMKM User and Operator. Make sure the prompt is in scope within this entire website only. The AI Chatbot is qualify give an answer to a map question, zone, gentrification, reallocation, and other things. The output can be a text (side panel) or directly in the map.

## Reference Files

- `app/globals.css`: canonical tokens, font, colors, radii, and base layers.
- `app/design-system/page.tsx`: live component gallery and usage examples.
- `app/components/ui/button.tsx`: button variants, sizes, and interaction states.
- `app/components/ui/app-sidebar.tsx`: application navigation and active-state pattern.
- `app/modules/discovery-map/discovery-map.tsx`: representative map, selector, badge, loading, error, and detail-panel composition.
