# Remaining Tasks

## UI Visual Polish

- Match the reference design more closely: softer outlines, richer hand-painted UI panels, less code-like text.
- Build HUD/resource bar, task/settings, bottom navigation as real mini program components.
- Replace remaining text-pill icons with illustrated icons.
- Polish learning, trade, cat, social, garden, closet, and vault pages to match the same hand-painted style.

## Cat Agent

- Use a real walk animation sequence instead of a single walking image. Current fallback: idle sprite moves between behavior spots.
- Keep movement constrained to valid floor paths and behavior spots. Current route points stay on the second-floor activity plane.
- Switch to action poses only after the cat arrives at the target spot. Implemented in web preview and mini program house page.
- Add idle variants: blink, tail, sit, look-around.
- Add action variants: nap, write note, happy, hungry, garden patrol.
- Add personality-driven bubble text and daily behavior log.

## Mini Program

- Continue implementing the WeChat mini program version under `miniprogram/`.
- Convert preview-only UI pieces into WXML/WXSS components.
- Add route/state management for scene panels and page navigation.
- Add mock service layer for balances, learning progress, cat states, and community posts.

## Assets

- Replace temporary generated assets with final consistent art.
- Prepare separate room background, object layers, cat sprite frames, and UI icons.
- Keep all cat action sprites visually consistent in scale, angle, and character identity.

## Compliance

- Keep trade as simulation only.
- Avoid real-balance, real-yield, recommendation, buy/sell advice, or auto-invest wording.
- Keep growth fund pages as official-entry guidance and cat-can reward explanation only.
