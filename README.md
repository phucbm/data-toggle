# @phucbm/data-toggle

A lightweight, flexible TypeScript utility for toggling CSS classes via data attributes. Perfect for building interactive UI components without framework dependencies.

[![npm version](https://badgen.net/npm/v/@phucbm/data-toggle?icon=npm)](https://www.npmjs.com/package/@phucbm/data-toggle)
[![npm downloads](https://badgen.net/npm/dm/@phucbm/data-toggle?icon=npm)](https://www.npmjs.com/package/@phucbm/data-toggle)
[![npm dependents](https://badgen.net/npm/dependents/@phucbm/data-toggle?icon=npm)](https://www.npmjs.com/package/@phucbm/data-toggle)
[![github stars](https://badgen.net/github/stars/phucbm/data-toggle?icon=github)](https://github.com/phucbm/data-toggle/)
[![github license](https://badgen.net/github/license/phucbm/data-toggle?icon=github)](https://github.com/phucbm/data-toggle/blob/main/LICENSE)

## Features

✨ **Zero dependencies** - fully self-contained  
🎯 **Framework agnostic** - works with any JavaScript framework or vanilla JS  
🔧 **Flexible targeting** - toggle classes on any element via selectors  
📱 **Smart defaults** - auto-prevents default for links and buttons  
🎪 **Event-driven** - dispatches custom events for easy integration  
⚡ **Debounced clicks** - built-in debouncing support  
🔄 **Multiple instances** - create separate instances with different configurations  
🛡️ **TypeScript** - fully typed for better DX  

## Installation

```bash
npm i @phucbm/data-toggle
```

```bash
pnpm add @phucbm/data-toggle
```

## Quick Start

### HTML
```html
<!-- Toggle class on <html> element -->
<button data-toggle="dark-mode">Toggle Dark Mode</button>

<!-- Toggle multiple classes at once (comma-separated) -->
<button data-toggle="dark-mode,sidebar-open">Toggle Dark Mode + Sidebar</button>

<!-- Toggle class on specific element -->
<button data-toggle="sidebar-open" data-toggle-element=".sidebar">Toggle Sidebar</button>
<div class="sidebar">Sidebar content</div>

<!-- Multiple toggles work independently -->
<button data-toggle="menu-active">Menu</button>
<button data-toggle="modal-open" data-toggle-element="#modal">Modal</button>
```

### JavaScript
```typescript
import { createDataToggle } from '@phucbm/data-toggle';

// Initialize once - tracks all [data-toggle] elements
const toggle = createDataToggle();

// That's it! All buttons with data-toggle now work
```

## Advanced Usage

### Custom Configuration

```typescript
const toggle = createDataToggle({
  // Use custom data attributes
  toggleAttribute: 'data-my-toggle',
  elementAttribute: 'data-my-target',
  
  // Change default target (instead of <html>)
  defaultTarget: document.body,
  
  // Control click behavior
  preventDefault: true, // or false, or 'auto' (default)
  
  // Add debouncing
  debounceDelay: 100,
  
  // Enable debug logging
  debug: true
});
```

### Programmatic Control

```typescript
// Toggle classes programmatically
toggle.toggle('dark-mode'); // Toggle on default target
toggle.toggle('sidebar-open', '.sidebar'); // Toggle on specific element
toggle.toggle('dark-mode,nav-hidden'); // Toggle multiple classes at once

// Check if classes are active
if (toggle.isActive('dark-mode')) {
  console.log('Dark mode is ON');
}

// Check specific elements
if (toggle.isActive('sidebar-open', '.sidebar')) {
  console.log('Sidebar is open');
}

// isActive returns true only if ALL specified classes are active
if (toggle.isActive('dark-mode,nav-hidden')) {
  console.log('Both classes are active');
}

// Refresh after DOM changes
document.body.innerHTML += '<button data-toggle="new-feature">New</button>';
toggle.refresh(); // Now the new button works

// Clean up
toggle.destroy(); // Removes all event listeners
```

### Event Listening

```typescript
// Listen for toggle events
document.addEventListener('datatoggle', (event) => {
  const { classNames, target, trigger, active } = event.detail;
  
  console.log(`Classes "${classNames.join(', ')}" were ${active ? 'added' : 'removed'}`);
  console.log('Target element:', target);
  console.log('Trigger element:', trigger);
  
  // Example: Save theme preference
  if (classNames.includes('dark-mode')) {
    localStorage.setItem('theme', active ? 'dark' : 'light');
  }
});
```

## Examples

### Dark Mode Toggle
```html
<button data-toggle="dark-mode" class="theme-toggle">
  🌙 Toggle Dark Mode
</button>
```

```css
.dark-mode {
  background: #1a1a1a;
  color: #ffffff;
}
```

### Mobile Menu
```html
<button data-toggle="menu-open" data-toggle-element=".mobile-menu">
  ☰ Menu
</button>

<nav class="mobile-menu">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

```css
.mobile-menu {
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.mobile-menu.menu-open {
  transform: translateX(0);
}
```

### Modal Dialog
```html
<button data-toggle="modal-open" data-toggle-element="#my-modal">
  Open Modal
</button>

<div id="my-modal" class="modal">
  <div class="modal-content">
    <h2>Modal Title</h2>
    <p>Modal content here...</p>
    <button data-toggle="modal-open" data-toggle-element="#my-modal">
      Close
    </button>
  </div>
</div>
```

### Sidebar with Body Scroll Lock
```typescript
const toggle = createDataToggle();

document.addEventListener('datatoggle', (e) => {
  if (e.detail.classNames.includes('sidebar-open')) {
    // Lock body scroll when sidebar opens
    document.body.style.overflow = e.detail.active ? 'hidden' : '';
  }
});
```

## API Reference

### `createDataToggle(config?: DataToggleConfig): DataToggleInstance`

Creates a new data toggle instance.

**Configuration Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `selector` | `string` | `'[data-toggle]'` | CSS selector for toggle elements |
| `toggleAttribute` | `string` | `'data-toggle'` | Attribute containing the class name(s), comma-separated |
| `elementAttribute` | `string` | `'data-toggle-element'` | Attribute containing target selector |
| `defaultTarget` | `Element` | `document.documentElement` | Default element to toggle classes on |
| `defaultElementSelector` | `string` | `''` | Fallback selector for targets |
| `preventDefault` | `boolean \| 'auto'` | `'auto'` | Prevent default click behavior |
| `debug` | `boolean` | `false` | Enable debug logging |
| `debounceDelay` | `number` | `0` | Debounce delay in milliseconds |

**Instance Methods:**

| Method | Description |
|--------|-------------|
| `destroy()` | Remove all event listeners for this instance |
| `toggle(className, elementSelector?)` | Programmatically toggle a class |
| `isActive(className, elementSelector?)` | Check if a class is currently active |
| `refresh()` | Re-scan DOM for new toggle elements |

### Custom Events

The library dispatches `datatoggle` events with the following detail:

```typescript
{
  classNames: string[]; // Array of toggled class names
  target: Element;      // Element that received the class
  trigger: Element;     // Button/element that was clicked (null for programmatic)
  active: boolean;      // Whether classes were added (true) or removed (false)
}
```

## Browser Support

Works in all modern browsers that support:
- ES6+ features
- `classList` API
- `CustomEvent`
- `WeakMap`

## Use Cases

- 🌙 **Dark/light mode toggles**
- 📱 **Mobile navigation menus**
- 🗂️ **Sidebar panels**
- 🪟 **Modal dialogs**
- 📖 **Accordion/collapsible content**
- 🎛️ **Settings panels**
- 🔍 **Search overlays**
- 🎨 **Theme switchers**

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the package
pnpm run build

# Run tests in watch mode
pnpm run test:watch
```

## License

MIT © [phucbm](https://github.com/phucbm)
