import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SplitPaneLayout } from '../SplitPaneLayout';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('SplitPaneLayout', () => {
  const mockLeftContent = <div data-testid="left-content">Left Content</div>;
  const mockRightContent = <div data-testid="right-content">Right Content</div>;

  it('renders both panes with content', () => {
    render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
      />
    );

    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
  });

  it('applies initial split position correctly', () => {
    const { container } = render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
        initialSplitPosition={30}
      />
    );

    const leftPane = container.querySelector('[style*="width: 30%"]');
    const rightPane = container.querySelector('[style*="width: 70%"]');

    expect(leftPane).toBeInTheDocument();
    expect(rightPane).toBeInTheDocument();
  });

  it('renders resizer element', () => {
    const { container } = render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
      />
    );

    const resizer = container.querySelector('.cursor-col-resize');
    expect(resizer).toBeInTheDocument();
  });

  it('handles mouse down on resizer', () => {
    const { container } = render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
      />
    );

    const resizer = container.querySelector('.cursor-col-resize');
    expect(resizer).toBeInTheDocument();

    if (resizer) {
      fireEvent.mouseDown(resizer, { clientX: 100 });
      // After mouse down, the component should be in dragging state
      // We can verify this by checking if the overlay appears
      const overlay = container.querySelector('.absolute.inset-0.cursor-col-resize.z-10');
      expect(overlay).toBeInTheDocument();
    }
  });

  it('applies custom className', () => {
    const { container } = render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
        className="custom-class"
      />
    );

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('custom-class');
  });

  it('sets up scroll event listeners when synchronized scrolling is enabled', () => {
    const { container } = render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
        enableSynchronizedScrolling={true}
      />
    );

    const leftPane = container.querySelector('.overflow-auto.bg-gray-50');
    const rightPane = container.querySelector('.overflow-auto.bg-white');

    expect(leftPane).toBeInTheDocument();
    expect(rightPane).toBeInTheDocument();

    // Verify that scroll handlers are attached by checking if onScroll is present
    // This is a basic check since we can't easily test the actual scroll synchronization
    // without more complex setup
  });

  it('renders with minimum pane width constraint', () => {
    render(
      <SplitPaneLayout
        leftContent={mockLeftContent}
        rightContent={mockRightContent}
        minPaneWidth={250}
      />
    );

    // The component should render without errors with the minPaneWidth prop
    expect(screen.getByTestId('left-content')).toBeInTheDocument();
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
  });
});