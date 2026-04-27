# Frontend UI Design Notes

## Main Menu Architecture

The main menu is a **vanilla JS DOM controller** — no framework dependency.

```
src/scripts/main-menu.js (MenuController class)
  │
  ├─► Menu items: <li class="menu-item"> (data-action attribute)
  ├─► Keyboard: keydown listener (ArrowUp/Down/Left/Right + Enter + Escape)
  ├─► Mouse: mouseenter → setActiveItem(), click → handleMenuClick()
  ├─► Settings panel: toggle with gear icon
  └─► Animations: CSS transitions on menu items, entrance animation
```

### Navigation State Machine

```
[Any Item] ←↑↓→ [Any Item]
     │
     └─ Enter → handleMenuClick(item, index)
                  │
                  ├─ action="start"    → TODO: launch game
                  ├─ action="continue" → TODO: load save
                  ├─ action="shop"     → alert('商店系统开发中')
                  ├─ action="achievements" → alert('成就系统开发中')
                  ├─ action="settings" → toggle settings panel
                  ├─ action="credits"  → alert('制作人员')
                  └─ action="exit"     → alert('退出游戏')
```

### Keyboard Mapping

| Key | Action |
|-----|--------|
| ↑ / W | Navigate up |
| ↓ / S | Navigate down |
| ← / A | Previous (horizontal nav) |
| → / D | Next (horizontal nav) |
| Enter / Space | Activate current item |
| Escape | Back / Exit game |
| Alt + key | Shortcut navigation (dead code) |

### Audio Placeholder

`playSound(type)` is a stub that does nothing. Parameter `type` is logged to console only in development. Real implementation would use Web Audio API:

```js
playSound(type) {
  const sounds = {
    navigate: 'sounds/navigate.mp3',
    select: 'sounds/select.mp3',
    back: 'sounds/back.mp3',
  };
  if (sounds[type]) {
    new Audio(sounds[type]).play();
  }
}
```

## Settings Persistence

Settings are stored in `localStorage` under key `gameSettings`. Read/write via:
- `getSettings()` — read with defaults fallback
- `saveSettings(settings)` — write to localStorage

Settings model:
```js
{
  bgmVolume: 80,    // 0-100
  sfxVolume: 100,   // 0-100
  quality: 'high',  // 'low' | 'medium' | 'high'
  fullscreen: false,
  language: 'zh-CN' // 'zh-CN' | 'en-US' | 'ja-JP'
}
```

## Integration with Game Core (Future)

When the game engine is implemented, `MenuController` needs:
1. Action dispatch instead of `alert()` calls
2. Handle game state (playing, paused, menu)
3. In-game pause menu overlay
4. Transition animation between menu and game view

## Browser Compatibility

- Targets modern browsers (>1% market share, last 2 versions, not IE11)
- Uses CSS Grid, Custom Properties, IntersectionObserver
- No polyfills required for target audience
