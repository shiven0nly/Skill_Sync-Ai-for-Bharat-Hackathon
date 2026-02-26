import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MetaphorCard, CodeSnippet, MetaphorExplanation } from '../MetaphorCard';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('MetaphorCard', () => {
  const mockSnippet: CodeSnippet = {
    id: 'test-snippet-1',
    code: 'const [state, setState] = useState(0);\nuseEffect(() => {\n  console.log(state);\n}, [state]);',
    language: 'javascript',
    fileName: 'component.js',
    startLine: 10,
    endLine: 13,
    complexityScore: 6.5,
  };

  const mockMetaphor: MetaphorExplanation = {
    title: 'React State Hook',
    description: 'This code manages component state and reacts to changes.',
    analogy: 'Think of useState as a memory slot that remembers values between renders.',
    keyPoints: [
      'useState creates a reactive memory slot',
      'useEffect watches for changes',
      'State updates trigger re-renders',
      'Dependencies control when effects run',
      'Functional updates prevent stale closures',
    ],
  };

  it('renders with basic props', () => {
    render(<MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} />);

    expect(screen.getByText('React State Hook')).toBeInTheDocument();
    expect(screen.getByText('This code manages component state and reacts to changes.')).toBeInTheDocument();
    expect(screen.getByText(/Think of useState as a memory slot/)).toBeInTheDocument();
  });

  it('displays complexity score with correct color coding', () => {
    const { rerender } = render(<MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} />);
    
    // Medium complexity (6.5) should show orange
    expect(screen.getByText('Complexity: 6.5')).toBeInTheDocument();
    
    // Test high complexity (red)
    const highComplexitySnippet = { ...mockSnippet, complexityScore: 9.0 };
    rerender(<MetaphorCard snippet={highComplexitySnippet} metaphor={mockMetaphor} />);
    expect(screen.getByText('Complexity: 9.0')).toBeInTheDocument();
    
    // Test low complexity (green)
    const lowComplexitySnippet = { ...mockSnippet, complexityScore: 2.0 };
    rerender(<MetaphorCard snippet={lowComplexitySnippet} metaphor={mockMetaphor} />);
    expect(screen.getByText('Complexity: 2.0')).toBeInTheDocument();
  });

  it('shows file information correctly', () => {
    render(<MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} />);

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getAllByText('component.js')).toHaveLength(2); // Appears in header and code preview
    expect(screen.getByText('Lines 10-13')).toBeInTheDocument();
  });

  it('displays code snippet', () => {
    render(<MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} />);

    expect(screen.getByText(/const \[state, setState\]/)).toBeInTheDocument();
  });

  it('adjusts explanation depth based on skill level', () => {
    // Basic level (1-3) - should not show key points
    const { rerender } = render(
      <MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} userSkillLevel={2} />
    );
    expect(screen.queryByText('Key Concepts:')).not.toBeInTheDocument();

    // Intermediate level (4-7) - should show limited key points
    rerender(
      <MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} userSkillLevel={5} />
    );
    expect(screen.getByText('Key Concepts:')).toBeInTheDocument();
    expect(screen.getByText('useState creates a reactive memory slot')).toBeInTheDocument();

    // Advanced level (8-10) - should show more key points
    rerender(
      <MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} userSkillLevel={9} />
    );
    expect(screen.getByText('Key Concepts:')).toBeInTheDocument();
    expect(screen.getByText('Functional updates prevent stale closures')).toBeInTheDocument();
  });

  it('calls onExpand when clicked', () => {
    const mockOnExpand = jest.fn();
    render(
      <MetaphorCard 
        snippet={mockSnippet} 
        metaphor={mockMetaphor} 
        onExpand={mockOnExpand}
      />
    );

    fireEvent.click(screen.getByText('React State Hook'));
    expect(mockOnExpand).toHaveBeenCalledWith('test-snippet-1');
  });

  it('shows expand/collapse indicator', () => {
    render(<MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} />);

    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('changes expand indicator when expanded', () => {
    render(
      <MetaphorCard 
        snippet={mockSnippet} 
        metaphor={mockMetaphor} 
        isExpanded={true}
      />
    );

    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MetaphorCard 
        snippet={mockSnippet} 
        metaphor={mockMetaphor} 
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays analogy section with proper styling', () => {
    render(<MetaphorCard snippet={mockSnippet} metaphor={mockMetaphor} />);

    expect(screen.getByText('Think of it like this:')).toBeInTheDocument();
    expect(screen.getByText(/Think of useState as a memory slot/)).toBeInTheDocument();
  });

  it('handles empty key points gracefully', () => {
    const metaphorWithoutKeyPoints = {
      ...mockMetaphor,
      keyPoints: [],
    };

    render(
      <MetaphorCard 
        snippet={mockSnippet} 
        metaphor={metaphorWithoutKeyPoints} 
        userSkillLevel={5}
      />
    );

    expect(screen.queryByText('Key Concepts:')).not.toBeInTheDocument();
  });

  it('shows skill level indicator in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <MetaphorCard 
        snippet={mockSnippet} 
        metaphor={mockMetaphor} 
        userSkillLevel={7}
      />
    );

    expect(screen.getByText(/Skill Level: 7\/10/)).toBeInTheDocument();
    expect(screen.getByText(/Depth: intermediate/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});