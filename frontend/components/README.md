# SplitPaneLayout Component

A React component that provides a resizable split-pane layout with synchronized scrolling, built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- ✅ **Resizable Panes**: Drag the divider to resize left and right panes
- ✅ **Synchronized Scrolling**: Scroll in one pane automatically scrolls the other
- ✅ **Minimum Width Constraints**: Prevents panes from becoming too small
- ✅ **Smooth Animations**: Uses Framer Motion for smooth transitions
- ✅ **Responsive Design**: Built with Tailwind CSS for responsive layouts
- ✅ **TypeScript Support**: Fully typed for better development experience

## Usage

```tsx
import { SplitPaneLayout } from '@/components/SplitPaneLayout';

function MyComponent() {
  return (
    <SplitPaneLayout
      leftContent={<div>Source Code</div>}
      rightContent={<div>Bridge Explanation</div>}
      initialSplitPosition={50}
      minPaneWidth={300}
      enableSynchronizedScrolling={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftContent` | `React.ReactNode` | - | Content to display in the left pane |
| `rightContent` | `React.ReactNode` | - | Content to display in the right pane |
| `initialSplitPosition` | `number` | `50` | Initial split position as percentage (0-100) |
| `minPaneWidth` | `number` | `200` | Minimum width for each pane in pixels |
| `className` | `string` | `''` | Additional CSS classes for the container |
| `enableSynchronizedScrolling` | `boolean` | `true` | Enable/disable synchronized scrolling |

## Implementation Details

### Synchronized Scrolling
The component implements synchronized scrolling by:
1. Listening to scroll events on both panes
2. Calculating the scroll percentage of the source pane
3. Applying the same scroll percentage to the target pane
4. Using a debounce mechanism to prevent infinite scroll loops

### Resizing Logic
The resizing functionality:
1. Tracks mouse down events on the divider
2. Calculates the new split position based on mouse movement
3. Applies minimum width constraints to prevent panes from becoming too small
4. Updates the pane widths using CSS percentage values

### Accessibility
- The divider has proper cursor styling (`cursor-col-resize`)
- Visual feedback is provided during dragging
- Keyboard navigation support can be added in future iterations

## Testing

The component includes comprehensive unit tests covering:
- Rendering of both panes with content
- Initial split position application
- Resizer functionality
- Custom className application
- Synchronized scrolling setup

Run tests with:
```bash
npm test
```

## Browser Support

This component works in all modern browsers that support:
- CSS Grid and Flexbox
- ES6+ JavaScript features
- React 18+
- Next.js 14+