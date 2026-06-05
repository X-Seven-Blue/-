# UI Layering Notes

The current web preview is only a visual/hotspot prototype. The WeChat mini program should be built as layered UI, not as a single pasted design image.

## Required production layers

1. Room background without cat, labels, HUD, or bottom navigation.
2. Furniture/object art layers where interaction needs animation feedback.
3. Cat sprite frames or Spine/Lottie-style animation assets:
   - idle
   - walk
   - nap
   - write
   - garden
   - happy
   - hungry
4. HUD and resource bar as WXML/WXSS components.
5. Transparent hotspot layer using percentage coordinates.
6. Panel pages for learn, trade, cat, social, garden, closet, and vault.

## Temporary assets

`miniprogram/assets/cat-house-main.png` is copied from the reference board and should only be used while developing layout.

`miniprogram/assets/cat-placeholder.png` is a rough crop from the same board. It is not a final cat asset and will leave visual artifacts if used for real walking animation.

## Implementation direction

Use the web prototype to validate interaction placement only. Build the real product in `miniprogram/`:

- `pages/house` owns the 2D scene.
- `components/cat-agent` owns cat movement, mood, bubble, and sprite switching.
- `config/hotspots.js` owns scene tap areas.
- `config/catBehaviors.js` owns first-pass autonomous behavior.

When final art arrives, replace only assets and sprite mappings. The page/component structure should stay stable.
