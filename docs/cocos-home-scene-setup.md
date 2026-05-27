# Cocos Home Scene Setup

## Fastest Preview

Use this flow when the scene only has `Canvas`.

1. In Cocos Creator, select `Canvas`.
2. Click `Add Component` in the Inspector.
3. Add `HomeSceneController`.
4. Do not manually create child nodes.
5. Do not bind Inspector properties.
6. Click `Preview`.

`HomeSceneController` creates the minimum visible Home page at runtime. You should immediately see:

- Cream background.
- Title: `我的猫舍`.
- Subtitle: `今天也要和阿橘一起慢慢变富呀`.
- User status card.
- Cat room card.
- A visible fallback cat.
- Cat info card.
- Four buttons: `撸猫`、`喂罐头`、`种小猫`、`收获`.
- Toast feedback after button clicks.

If formal PNG files do not exist yet, the page uses Cocos `Graphics` fallback drawings and still previews normally.

If Preview still shows fallback after PNG files are added, open the Console and check the `HomeSceneController` asset loading logs.

## Formal Asset Paths

The uploaded reference image is only a style reference. Do not use the whole image as the Home background, and do not show the labels from the reference sheet in the game.

Runtime-loaded PNG files must be placed under `assets/resources/textures` so `resources.load()` can find their SpriteFrames.

For the final look, slice/export independent PNG files and put them at these paths:

```text
assets/resources/textures/bg/home_room.png
assets/resources/textures/cats/cat_orange_idle.png
assets/resources/textures/cats/cat_orange_happy.png
assets/resources/textures/cats/cat_orange_eat.png
assets/resources/textures/icons/can.png
assets/resources/textures/icons/paw.png
assets/resources/textures/icons/book.png
assets/resources/textures/icons/seed.png
```

Current runtime behavior:

- `home_room.png` is used for the room card when loadable.
- `cat_orange_idle.png` is used as the default cat when loadable.
- `cat_orange_happy.png` is used briefly after petting the cat when loadable.
- `cat_orange_eat.png` is used briefly after feeding the cat when loadable.
- `can.png` is used next to the can counter when loadable.
- Missing assets fall back to generated `Graphics` placeholders.

Note: Cocos dynamic runtime loading usually requires assets to be in a loadable bundle such as `resources`. The code uses the project-facing formal paths above in comments/warnings and attempts runtime loading with Cocos resource paths. If assets are imported but not dynamically loadable yet, fallback UI will remain visible.

The runtime SpriteFrame keys are:

```text
textures/bg/home_room/spriteFrame
textures/cats/cat_orange_idle/spriteFrame
textures/cats/cat_orange_happy/spriteFrame
textures/cats/cat_orange_eat/spriteFrame
textures/icons/can/spriteFrame
```

Cocos Creator will generate `.meta` files automatically. Do not create them by hand. After adding or replacing images, right-click `assets` and choose refresh, or restart the editor.

## Runtime UI Style

The generated Home page follows the uploaded reference style:

- 3D clay direction.
- Cream background.
- Light pink, light green, light yellow, and wood colors.
- Large rounded cards.
- Soft shadow blocks.
- Healing cat-room mood.
- Cute but not childish.

Baseline:

- Portrait phone layout.
- Recommended project design resolution: `750 x 1624`.
- Content centered with generous spacing.
- Layout is calculated from `view.getVisibleSize()` at runtime.
- Main content width is `visible width * 0.88`.

Colors:

- Background: `#FFF7E8`
- Main card: `#FFF8EA`
- Pink: `#FFE1DE`
- Green: `#DDEED1`
- Yellow: `#FFF0B8`
- Wood: `#D89C5B`
- Text: `#3E342E`

## Interactions

Buttons are bound in code:

- `撸猫`: intimacy +1, cat bounce, happy sprite if available, Toast.
- `喂罐头`: cans -1, intimacy +2, eat sprite if available, Toast.
- `种小猫`: costs 20 cans when available.
- `收获`: shows a growth Toast.

Toast fades in and out automatically.

## Canvas And Preview Settings

In Cocos Creator, check these settings if the layout looks wrong:

1. Project Settings design resolution:
   - Width: `750`
   - Height: `1624`
   - Orientation: Portrait / vertical
2. Canvas node:
   - `UITransform` should cover the design resolution.
   - Do not leave Canvas as a small fixed area in the middle of the scene.
3. Fit mode:
   - Portrait mini games usually prioritize `Fit Width`.
   - Enable `Fit Height` only if the preview result needs it.
   - Avoid settings that compress the whole page into a small card-like area.
4. Preview device:
   - iPhone 12 / 13 / 13 Pro is a good quick check.

## If Preview Looks Too Small

1. Confirm `HomeSceneController` is attached to `Canvas`.
2. Confirm the Preview device is a portrait phone such as iPhone 12 / 13.
3. Confirm the project design resolution is portrait, preferably `750 x 1624`.
4. The Home page now lays out from `view.getVisibleSize()` automatically.
5. If it still looks small, copy the Console log line:

```text
[HomeScene] visibleSize: width x height
```

and compare it with the preview device size. If `visibleSize` is unexpectedly small, the issue is Canvas/project adaptation rather than the generated UI nodes.

## Advanced Setup

Later, when visual design is stable, you can replace runtime-generated nodes with editor-built nodes:

1. Manually build polished nodes in the Cocos editor.
2. Keep `HomeSceneController` on the scene root.
3. Bind Labels, Buttons, CatNode, and progress node to the exposed properties.
4. Replace fallback `Graphics` with PNG or Spine assets.

If all required Inspector properties are bound, the controller uses your editor-built UI. If not, it automatically builds the runtime fallback UI.
