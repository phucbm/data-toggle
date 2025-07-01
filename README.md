# data-toggle

A TypeScript utility package

[![npm version](https://badgen.net/npm/v/@phucbm/data-toggle?icon=npm)](https://www.npmjs.com/package/@phucbm/data-toggle)
[![npm downloads](https://badgen.net/npm/dm/@phucbm/data-toggle?icon=npm)](https://www.npmjs.com/package/@phucbm/data-toggle)
[![npm dependents](https://badgen.net/npm/dependents/@phucbm/data-toggle?icon=npm)](https://www.npmjs.com/package/@phucbm/data-toggle)
[![github stars](https://badgen.net/github/stars/phucbm/data-toggle?icon=github)](https://github.com/phucbm/data-toggle/)
[![github license](https://badgen.net/github/license/phucbm/data-toggle?icon=github)](https://github.com/phucbm/data-toggle/blob/main/LICENSE)

## Installation

```bash
npm i @phucbm/data-toggle
```

```bash
pnpm add @phucbm/data-toggle
```

## Usage

```typescript
import {myUtilityFunction} from '@phucbm/data-toggle'
// or
import myUtilityFunction from '@phucbm/data-toggle'

// Basic usage
const result = myUtilityFunction('your input');
```

## API

### `myUtilityFunction(input?: any): any`

Main utility function that processes the input.

**Parameters:**

- `input` (optional) - The input to process

**Returns:**

- The processed result

### `processElement(element: HTMLElement): HTMLElement`

Function for DOM element processing.

**Parameters:**

- `element` - HTML element to process

**Returns:**

- The processed element

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
