# Temporary Sliced Assets

These PNG files are temporary preview assets sliced from the uploaded reference sheet.

Runtime-loaded copies should live under `assets/resources/textures`:

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

They are not final transparent production PNGs. Because the source is a labelled collage image, the sliced files may include rectangular background, shadows, soft edge residue, or small visual artifacts.

Their current purpose is to let `HomeSceneController` load PNG SpriteFrames first and quickly preview a style closer to the reference image. If a PNG cannot be loaded, the Home scene still uses Graphics fallback placeholders.

For the formal version, regenerate or export independent transparent PNG assets and replace these files while keeping the same filenames. Cocos Creator will reimport them automatically after refresh/restart.

If Preview still shows fallback:

1. Confirm the files are under `assets/resources/textures`, not only `assets/textures`.
2. Refresh `assets` in Cocos Creator or restart the editor.
3. Check the Console for `HomeSceneController` success/warn logs.
4. Confirm Cocos generated `.meta` files automatically.

To regenerate the temporary files:

```bash
python tools/slice_reference_assets.py
```

If your environment uses `python3`:

```bash
python3 tools/slice_reference_assets.py
```

The script reads:

```text
docs/reference-assets.png
```

Do not commit or hand-write `.meta` files for these PNGs. Let Cocos Creator generate metadata.
