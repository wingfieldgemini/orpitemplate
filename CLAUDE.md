# Orpi Website Brand Guidelines — Instructions for Claude Code

This file contains the official Orpi graphic charter rules for building Orpi-affiliated websites
(**excluding** Agence Orpi sites hosted on orpi.com). Follow every rule here strictly.
The web design of this site must NOT be identical to the SAO hosted on orpi.com.

---

## 01 — Header

- **Logo position**: Always place the Orpi logo on the **left**.
- **Logo minimum size**: `width: 85px`, `height: 45px`.
- **Logo color**: Red `#E30513`. Never alter the logotype in any way.
- **Agency name**: Displayed inline next to the logo on the same continuous line.
  - Font: `Orpi Medium`, sentence case (first letter uppercase, rest lowercase).
  - Size: `20px`.
  - Color: Dark Grey `#595959`.
- **Navigation menu**: Must list the agency's core services (e.g. Acheter, Louer, Vendre) and
  include a link back to `orpi.com`.

```html
<!-- Example header structure -->
<header>
  <div class="header-left">
    <img src="/logo-orpi.svg" alt="Orpi" style="min-width:85px; min-height:45px;" />
    <span class="agency-name">Nom de votre agence</span>
  </div>
  <nav>
    <a href="/acheter">Acheter</a>
    <a href="/louer">Louer</a>
    <a href="/vendre">Vendre</a>
    <a href="https://orpi.com">Orpi.com</a>
  </nav>
</header>
```

---

## 02 — Typography

- **Font family**: Use the `Orpi` typeface exclusively throughout the site.
- **Capitalisation rule**: No ALL CAPS text, except for proper nouns and the start of sentences.

### Font sizes by heading level

| Element              | Font weight        | Desktop               | Tablet                | Mobile               |
|----------------------|--------------------|-----------------------|-----------------------|----------------------|
| H1                   | Orpi Medium        | 40px / line 52px      | 40px / line 52px      | 26px / line 34px     |
| H2                   | Orpi Medium        | 30px / line 38px      | 24px / line 32px      | 20px / line 24px     |
| H3                   | Orpi Medium        | 24px / line 30px      | 22px                  | 18px / line 22px     |
| H4                   | Orpi Medium/Regular| 20px / line 26px      | 20px                  | 16px / line 20px     |
| Body text            | Orpi Medium/Regular| 16px / line 24px      | 16px / line 24px      | 14px / line 18px     |
| Legal mentions       | Orpi Medium/Regular| 12px / line 16px      | 12px / line 16px      | 10px / line 13px     |

```css
/* Example CSS variables for typography */
:root {
  --font-family: 'Orpi', sans-serif;
}

h1 { font-size: 40px; line-height: 52px; font-weight: 500; }
h2 { font-size: 30px; line-height: 38px; font-weight: 500; }
h3 { font-size: 24px; line-height: 30px; font-weight: 500; }
h4 { font-size: 20px; line-height: 26px; font-weight: 400; }
p  { font-size: 16px; line-height: 24px; }
.legal { font-size: 12px; line-height: 16px; }

@media (max-width: 1024px) { /* tablet */
  h1 { font-size: 40px; line-height: 52px; }
  h2 { font-size: 24px; line-height: 32px; }
  h3 { font-size: 22px; }
  h4 { font-size: 20px; }
}

@media (max-width: 768px) { /* mobile */
  h1 { font-size: 26px; line-height: 34px; }
  h2 { font-size: 20px; line-height: 24px; }
  h3 { font-size: 18px; line-height: 22px; }
  h4 { font-size: 16px; line-height: 20px; }
  p  { font-size: 14px; line-height: 18px; }
  .legal { font-size: 10px; line-height: 13px; }
}
```

---

## 03 — Color Palette

Only use the colors defined below. Do not introduce any other colors.

### Primary colors

| Name       | Hex       | Usage                        |
|------------|-----------|------------------------------|
| White      | `#FFFFFF` | Backgrounds, text on dark    |
| Red        | `#E30513` | Logo, CTAs, accents          |
| Dark Grey  | `#595959` | Body text, agency name       |
| Light Grey | `#FAFAFA` | Subtle backgrounds           |

### Secondary colors

| Name        | Hex       |
|-------------|-----------|
| Grey Medium | `#F6F6F6` |
| Brown       | `#9E958F` |
| Light Brown | `#ECEAE6` |
| Sand        | `#E4DCC4` |
| Purple      | `#7A76B1` |
| Dark Purple | `#5F5D6F` |
| Pink        | `#F4A29D` |

```css
/* CSS custom properties — use these tokens everywhere */
:root {
  /* Primary */
  --color-white:       #FFFFFF;
  --color-red:         #E30513;
  --color-dark-grey:   #595959;
  --color-light-grey:  #FAFAFA;

  /* Secondary */
  --color-grey-medium: #F6F6F6;
  --color-brown:       #9E958F;
  --color-light-brown: #ECEAE6;
  --color-sand:        #E4DCC4;
  --color-purple:      #7A76B1;
  --color-dark-purple: #5F5D6F;
  --color-pink:        #F4A29D;
}
```

---

## 04 — Background Color

- **Default background**: White `#FFFFFF`. This is required for accessibility and readability compliance.
- Do **not** use coloured or patterned full-page backgrounds.

```css
body {
  background-color: var(--color-white);
  color: var(--color-dark-grey);
}
```

---

## 05 — Rounded Shapes

All UI elements **must** use rounded corners. Sharp/square corners are forbidden.

- **Images**: Apply `border-radius` to all image containers.
- **Buttons**: Always rounded (pill or large radius), never square.
- **Input fields**: Always rounded, never square.
- **Cards / content blocks**: Always use rounded corners.

```css
/* Rounded shapes — apply consistently */
img,
.card,
.block {
  border-radius: 12px; /* adjust to design, but never 0 */
}

button,
.btn {
  border-radius: 999px; /* fully rounded / pill shape */
}

input,
textarea,
select {
  border-radius: 999px; /* rounded inputs */
}
```

```html
<!-- ✅ Correct button -->
<button class="btn" style="border-radius: 999px; background: #E30513; color: #fff;">
  Envoyer un message
</button>

<!-- ❌ Wrong — square button, do not do this -->
<button style="border-radius: 0;">Envoyer un message</button>
```

---

## Summary Checklist

Before shipping any page, verify:

- [ ] Header has Orpi logo at left, min 85×45px, colour `#E30513`
- [ ] Agency name is next to logo, 20px, Dark Grey `#595959`, Orpi Medium, sentence case
- [ ] Navigation includes service links + link to orpi.com
- [ ] Font family is `Orpi` throughout; no unauthorised ALL CAPS
- [ ] All heading and body sizes match the responsive table above
- [ ] Only approved palette colours are used (`#E30513`, `#595959`, `#FAFAFA`, etc.)
- [ ] Page background is white `#FFFFFF`
- [ ] Every image, card, button, and input uses rounded corners
- [ ] Site design is visually distinct from orpi.com SAO
