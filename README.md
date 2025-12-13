# radix-cm

[![npm version](https://badge.fury.io/js/radix-cm.svg)](https://badge.fury.io/js/radix-cm)

A lightweight React library that enables opening Radix UI context menus with two key benefits:

1. **Avoid wrapping context menu targets** - No need to use Radix UI's `<ContextMenu.Root>` and `<ContextMenu.Trigger>` components. This reduces JSX boilerplate and improves app performance **significantly**. Simply get a handler from `useContextMenu` and attach it to the target's `onContextMenu`.

2. **Canvas and dynamic context menus** - Open custom context menus based on exactly where the pointer hit, enabling Radix context menus for canvas elements.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Using the Hook](#using-the-hook)
- [Canvas Context Menus](#canvas-context-menus)
- [Using shadcn](#using-shadcn)
- [API Reference](#api-reference)

## Installation

```bash
bun add radix-cm
```

### Peer Dependencies

This library requires the following peer dependencies:

- `react` >= 19
- `@radix-ui/react-context-menu` >= 2

## Setup

Wrap your application (or a portion of it) with the `ContextMenuProvider`:

```tsx
import { ContextMenuProvider } from "radix-cm";

function App() {
  return (
    <ContextMenuProvider>
      <YourAppContent />
    </ContextMenuProvider>
  );
}
```

## Using the Hook

Use the `useContextMenu` hook to create context menu handlers:

```tsx
import { useContextMenu } from "radix-cm";

function MyComponent() {
  const handleContextMenu = useContextMenu(() => (
    <ContextMenu.Portal>
      <ContextMenu.Content>
        <ContextMenu.Item>Copy</ContextMenu.Item>
        <ContextMenu.Item>Paste</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Portal>
  ));

  return <div onContextMenu={handleContextMenu}>Right-click me!</div>;
}
```

## Canvas Context Menus

The node factory passed to `useContextMenu` receives the hit coordinates and event as arguments. This allows you to render different menu content based on where the context menu was triggered. The coordinates are relative to the current target element (the one with `onContextMenu`). For screen coordinates, use the event directly.

```tsx
import { useContextMenu } from "radix-cm";

function CanvasComponent() {
  const handleContextMenu = useContextMenu((x, y, event) => {
    // x, y are relative to the canvas element.
    // Use event.clientX/clientY for screen coordinates
    const hitShape = shapeAt(x, y);

    if (hitShape) {
      return (
        <ContextMenu.Portal>
          <ContextMenu.Content>
            <ContextMenu.Item onSelect={() => duplicateShape(hitShape)}>
              Duplicate Shape
            </ContextMenu.Item>
            <ContextMenu.Item onSelect={() => deleteShape(hitShape)}>
              Delete Shape
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      );
    }

    // If the background was hit
    return (
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => addShapeAt(x, y)}>
            Add Circle
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={() => addShapeAt(x, y)}>
            Add Rectangle
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    );
  });

  return (
    <canvas
      onContextMenu={handleContextMenu}
      style={{ width: 400, height: 400 }}
    />
  );
}
```

## Using shadcn

Simply:

```tsx
import { ContextMenuProvider } from "radix-cm";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";

// Tell the provider to use shadcn's root and trigger
function App() {
  return (
    <ContextMenuProvider root={ContextMenu} trigger={ContextMenuTrigger}>
      <YourAppContent />
    </ContextMenuProvider>
  );
}

// Now use the hook with shadcn components
import { useContextMenu } from "radix-cm";

function MyComponent() {
  const handleContextMenu = useContextMenu(() => (
    <ContextMenuContent>
      <ContextMenuItem>Copy</ContextMenuItem>
      <ContextMenuItem>Paste</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Delete</ContextMenuItem>
    </ContextMenuContent>
  ));

  return <div onContextMenu={handleContextMenu}>Right-click me!</div>;
}
```

## API Reference

### ContextMenuProvider

The provider component that sets up the context menu system.

```tsx
export interface ContextMenuProviderProps {
  root?: ComponentType<ComponentProps<typeof ContextMenu.Root>>; // Defaults to Radix Root
  trigger?: ComponentType<ComponentProps<typeof ContextMenu.Trigger>>; // Defaults to Radix Trigger
  children?: ReactNode;
}
```

### useContextMenu

Hook that returns a context menu event handler.

```tsx
function useContextMenu(
  factory: (x: number, y: number, event: MouseEvent) => ReactNode
): (event: MouseEvent) => void;
```

**Parameters:**

- `factory`: A function that returns a React node. Receives `(x, y, event)` where `x` and `y` are relative coordinates from the context menu target element. For client coordinates (absolute screen position), use `event.clientX` and `event.clientY`.

**Returns:** A function to attach to the `onContextMenu` prop of any element
