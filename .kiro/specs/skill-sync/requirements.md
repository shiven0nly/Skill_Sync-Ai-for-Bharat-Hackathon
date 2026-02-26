# Requirements: Skill-Sync (The Developer Shiven Sharma)

## 🎯 Problem Statement
Developers lose 30-40% of their time "context switching" when moving between different tech stacks. Traditional documentation is static; it doesn't care if you're a Senior Java Dev or a Junior Pythonista. 

## ✅ Functional Requirements
1. **Source-Target Mapping**: The system MUST allow users to set a "Native Language" (e.g., C#) to explain "Foreign Code" (e.g., Rust).
2. **Cognitive Load Analysis**: Automatically flag files that exceed a specific complexity threshold.
3. **Bridge Explanations**: Generate "metaphor-based" code explanations (e.g., "Think of this Rust Borrow Checker as a library card system").
4. **Interactive Complexity Heatmap**: A visual directory tree showing where the "hardest" code lives.

## 🛠 Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Framer Motion.
- **Analysis**: Tree-sitter (for parsing), OpenAI/Anthropic (for metaphors).
- **Visualization**: Recharts & React-Flow.