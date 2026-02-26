import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComplexityHeatmap, FileComplexity } from '../ComplexityHeatmap';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockComplexityData: FileComplexity[] = [
  {
    path: 'src/utils/helper.js',
    fileName: 'helper.js',
    complexityScore: 5.2,
    cognitiveLoad: 4.1,
    cyclomaticComplexity: 6,
    dependencyDepth: 3,
    loc: 89,
    language: 'javascript'
  },
  {
    path: 'src/components/Button.tsx',
    fileName: 'Button.tsx',
    complexityScore: 2.8,
    cognitiveLoad: 2.3,
    cyclomaticComplexity: 3,
    dependencyDepth: 2,
    loc: 45,
    language: 'typescript'
  },
  {
    path: 'tests/integration.test.js',
    fileName: 'integration.test.js',
    complexityScore: 8.1,
    cognitiveLoad: 7.2,
    cyclomaticComplexity: 10,
    dependencyDepth: 5,
    loc: 156,
    language: 'javascript'
  }
];

describe('ComplexityHeatmap', () => {
  it('renders the heatmap with title and legend', () => {
    render(<ComplexityHeatmap complexityData={mockComplexityData} />);
    
    expect(screen.getByText('🔥 Complexity Heatmap')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('displays file tree structure correctly', () => {
    render(<ComplexityHeatmap complexityData={mockComplexityData} />);
    
    // Check for directory nodes
    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('tests')).toBeInTheDocument();
    
    // Check for file nodes (initially collapsed)
    expect(screen.queryByText('helper.js')).not.toBeInTheDocument();
    expect(screen.queryByText('Button.tsx')).not.toBeInTheDocument();
  });

  it('expands directories when clicked', () => {
    render(<ComplexityHeatmap complexityData={mockComplexityData} />);
    
    // Click on src directory to expand
    const srcDirectory = screen.getByText('src');
    fireEvent.click(srcDirectory);
    
    // Now files should be visible
    expect(screen.getByText('utils')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
  });

  it('calls onFileSelect when a file is clicked', () => {
    const mockOnFileSelect = jest.fn();
    render(
      <ComplexityHeatmap 
        complexityData={mockComplexityData} 
        onFileSelect={mockOnFileSelect}
      />
    );
    
    // Expand directories to access files
    fireEvent.click(screen.getByText('src'));
    fireEvent.click(screen.getByText('utils'));
    
    // Click on a file
    const helperFile = screen.getByText('helper.js');
    fireEvent.click(helperFile);
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockComplexityData[0]);
  });

  it('displays complexity scores for files', () => {
    render(<ComplexityHeatmap complexityData={mockComplexityData} />);
    
    // Expand to show files
    fireEvent.click(screen.getByText('src'));
    fireEvent.click(screen.getByText('utils'));
    
    // Check that complexity score is displayed
    expect(screen.getByText('5.2')).toBeInTheDocument();
  });

  it('shows correct statistics in footer', () => {
    render(<ComplexityHeatmap complexityData={mockComplexityData} />);
    
    expect(screen.getByText('3 files analyzed')).toBeInTheDocument();
    
    // Calculate expected average: (5.2 + 2.8 + 8.1) / 3 = 5.4
    expect(screen.getByText('Avg complexity: 5.4')).toBeInTheDocument();
  });

  it('highlights selected file', () => {
    render(
      <ComplexityHeatmap 
        complexityData={mockComplexityData} 
        selectedFile="src/utils/helper.js"
      />
    );
    
    // Expand to show the selected file
    fireEvent.click(screen.getByText('src'));
    fireEvent.click(screen.getByText('utils'));
    
    const selectedFile = screen.getByText('helper.js').closest('div');
    expect(selectedFile).toHaveClass('bg-blue-100');
  });

  it('shows empty state when no data provided', () => {
    render(<ComplexityHeatmap complexityData={[]} />);
    
    expect(screen.getByText('No complexity data available')).toBeInTheDocument();
    expect(screen.getByText('0 files analyzed')).toBeInTheDocument();
    expect(screen.getByText('Avg complexity: 0.0')).toBeInTheDocument();
  });

  it('applies correct complexity colors based on score', () => {
    const highComplexityData: FileComplexity[] = [
      {
        path: 'high.js',
        fileName: 'high.js',
        complexityScore: 9.0, // Should be red
        cognitiveLoad: 8.0,
        cyclomaticComplexity: 12,
        dependencyDepth: 6,
        loc: 200,
        language: 'javascript'
      }
    ];

    render(<ComplexityHeatmap complexityData={highComplexityData} />);
    
    // The complexity indicator should have red background for high complexity
    const complexityIndicator = screen.getByTitle(/Complexity: 9.00/);
    expect(complexityIndicator).toHaveClass('bg-red-500');
  });
});