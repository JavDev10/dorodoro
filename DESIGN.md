# Design System Document

## 1. Overview & Creative North Star: "The Analog Sanctuary"

This design system is a departure from the cold, sterile efficiency of modern productivity tools. Its **Creative North Star is "The Analog Sanctuary."** We are not building a dashboard; we are curating a digital desk space that feels as warm and tactile as a physical journal or a sun-drenched study nook.

To move beyond the "template" look, this system embraces **Organic Intentionality**. We break the rigid digital grid through soft, exaggerated corner radii (up to `3rem` on large containers), asymmetrical whitespace, and a "No-Line" philosophy. Elements should feel like they were placed by hand, creating a sense of calm, focused relaxation rather than mechanical precision.

---

## 2. Colors: Tonal Warmth

The palette is rooted in the earth: deep coffee browns, creamy parchments, and soft, dusty rose accents.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections or cards. In "The Analog Sanctuary," boundaries are fluid. Differentiation must be achieved through background shifts (e.g., a `surface-container-low` section resting on a `surface` background).

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of heavy-weight cotton paper.
- **Base Layer:** `surface` (`#fff9ec`)
- **Primary Work Surface:** `surface-container-low` (`#fbf3db`)
- **Elevated Insights:** `surface-container-high` (`#f0e8cb`)
- **Nesting Logic:** Use `surface-container-lowest` (`#ffffff`) for cards that need to "pop" with a clean, crisp feel against a warmer background.

### The "Glass & Gradient" Rule
To add visual "soul," use a subtle **Signature Gradient** for primary actions: transitioning from `primary` (`#805449`) to `primary-container` (`#fec4b5`) at a 135-degree angle. For floating overlays or navigation, use **Glassmorphism** (semi-transparent versions of `surface-container` with a `20px` backdrop-blur) to soften edges and let the background colors bleed through, creating a "frosted vellum" effect.

---

## 3. Typography: The Friendly Scholar

The typography pairing combines the modern clarity of **Plus Jakarta Sans** for high-impact display moments with the soft, humanist touch of **Be Vietnam Pro** for reading and utility.

*   **Display & Headlines (Plus Jakarta Sans):** These should be treated as editorial elements. Use `display-lg` (`3.5rem`) sparingly to anchor the page, creating a bold but rounded focal point.
*   **Body & Titles (Be Vietnam Pro):** The "friendly scholar" voice. The generous x-height and rounded terminals of this font ensure that even long-form notes feel approachable and clean, mimicking a well-kept handwritten notebook.
*   **Hierarchy Note:** Use `on-surface-variant` (`#655f46`) for labels and secondary text to reduce visual vibration and maintain the "calm" ethos.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are too aggressive for this system. We convey depth through light and texture.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a natural "lift" based on color value rather than artificial shadows.
*   **Ambient Shadows:** When a floating element (like a modal or floating action button) is required, use an extra-diffused shadow.
    *   *Spec:* `offset: 0 12px`, `blur: 40px`, `color: rgba(55, 51, 28, 0.06)` (a tinted version of `on-surface`).
*   **The "Ghost Border" Fallback:** If a container requires further definition for accessibility, use the `outline-variant` (`#bab294`) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components: Soft & Purposeful

### Buttons
*   **Primary:** Uses the **Signature Gradient** (Primary to Primary-Container). Radius is `full` (pill-shaped) or `xl` (`3rem`).
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Interaction:** On hover, buttons should scale slightly (1.02x) rather than just changing color, mimicking the tactile press of a soft button.

### Input Fields
*   **Style:** `surface-container-lowest` background. 
*   **Shape:** `md` (`1.5rem`) corner radius.
*   **Focus State:** Instead of a heavy border, use a soft outer glow of `primary` at 20% opacity.

### Cards & Lists
*   **Strict Rule:** No divider lines. Separate list items using `12px` of vertical whitespace or alternating `surface-container` shifts.
*   **Cards:** Use `lg` (`2rem`) radius. Content should have generous padding (`2rem`) to promote a sense of "breathing room."

### Signature Component: The "Focus Hearth"
A specialized container for timer or study-tracking elements. It utilizes a `tertiary-container` (`#fde9e8`) background with `xl` rounded corners and hand-drawn style icons inspired by the "cat" and "person" illustrations in the reference images.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** Offset your text blocks and images. Not everything needs to be centered; let the layout "lean" like a sketchbook.
*   **Use Generous Padding:** If you think there is enough space, add 20% more. Calmness comes from empty space.
*   **Organic Shapes:** Use the `xl` and `lg` radius tokens to make UI elements feel soft and touchable.

### Don't:
*   **Don't use pure black:** Use `on-surface` (`#37331c`) for all "black" text to keep the palette warm and integrated.
*   **Don't use hard edges:** Avoid `0px` or `sm` corners unless strictly necessary for technical constraints.
*   **Don't use high-contrast dividers:** Never use a dark line to separate content. Use a shift from `surface-container-low` to `surface-container-high`.