import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MetaphorCard Component
 *
 * Displays high-complexity code snippets with metaphorical explanations
 * to help bridge understanding for developers with different skill levels.
 */
import React from 'react';
import { motion } from 'framer-motion';
/**
 * Get complexity color based on level
 */
const getComplexityColor = (level) => {
    switch (level) {
        case 'high':
            return 'border-red-500 bg-red-900/20';
        case 'medium':
            return 'border-yellow-500 bg-yellow-900/20';
        case 'low':
            return 'border-green-500 bg-green-900/20';
        default:
            return 'border-gray-500 bg-gray-900/20';
    }
};
/**
 * Get complexity icon based on level
 */
const getComplexityIcon = (level) => {
    switch (level) {
        case 'high':
            return '🟥';
        case 'medium':
            return '🟨';
        case 'low':
            return '🟢';
        default:
            return '⚪';
    }
};
export const MetaphorCard = ({ codeSnippet, language, complexity, metaphor, userSkillLevel, onExploreMore }) => {
    const complexityColorClass = getComplexityColor(complexity.level);
    const complexityIcon = getComplexityIcon(complexity.level);
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: `relative p-6 rounded-lg border-l-4 ${complexityColorClass} backdrop-blur-sm`, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-lg", children: complexityIcon }), _jsxs("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: [complexity.level, " Complexity"] }), _jsxs("span", { className: "text-xs text-gray-400", children: ["Score: ", complexity.score, "/100"] })] }), _jsxs("div", { className: "text-xs text-gray-400", children: ["Skill Level: ", userSkillLevel, "/10"] })] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-xs font-mono text-gray-400 uppercase", children: [language, " Code"] }), _jsx("span", { className: "text-xs text-gray-500", children: complexity.verdict })] }), _jsx("pre", { className: "bg-gray-900 p-3 rounded text-sm overflow-x-auto", children: _jsx("code", { className: "text-gray-300 font-mono", children: codeSnippet }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "border-t border-gray-700 pt-3", children: [_jsxs("h4", { className: "text-sm font-semibold text-blue-400 mb-2", children: ["\uD83C\uDF09 Bridge Explanation: ", metaphor.title] }), _jsx("p", { className: "text-sm text-gray-300 leading-relaxed", children: metaphor.description })] }), _jsx("div", { className: "bg-blue-900/20 p-3 rounded border-l-2 border-blue-400", children: _jsxs("p", { className: "text-sm italic text-blue-200", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Think of it like:" }), " ", metaphor.analogy] }) }), metaphor.keyPoints.length > 0 && (_jsxs("div", { children: [_jsx("h5", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2", children: "Key Concepts" }), _jsx("ul", { className: "space-y-1", children: metaphor.keyPoints.map((point, index) => (_jsxs("li", { className: "text-sm text-gray-300 flex items-start", children: [_jsx("span", { className: "text-blue-400 mr-2", children: "\u2022" }), point] }, index))) })] }))] }), onExploreMore && (_jsx("div", { className: "mt-4 pt-3 border-t border-gray-700", children: _jsx(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: onExploreMore, className: "w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors", children: "Explore More Details \u2192" }) })), _jsx("div", { className: "absolute top-2 right-2", children: _jsx("div", { className: "flex space-x-1", children: Array.from({ length: 10 }, (_, i) => (_jsx("div", { className: `w-1 h-4 rounded-full ${i < userSkillLevel ? 'bg-blue-400' : 'bg-gray-600'}` }, i))) }) })] }));
};
/**
 * Example usage and props for testing
 */
export const MetaphorCardExample = () => {
    const exampleProps = {
        codeSnippet: `function processUserData(users) {
  return users
    .filter(user => user.active)
    .map(user => ({
      ...user,
      fullName: \`\${user.firstName} \${user.lastName}\`
    }))
    .sort((a, b) => a.createdAt - b.createdAt);
}`,
        language: 'javascript',
        complexity: {
            score: 75,
            level: 'high',
            verdict: 'High Load 🟥'
        },
        metaphor: {
            title: 'Data Assembly Line',
            description: 'This code works like a factory assembly line where raw user data goes through multiple processing stations.',
            analogy: 'Imagine a car factory where cars (users) move through different stations: first a quality check (filter), then customization (map), and finally sorting by production date.',
            keyPoints: [
                'Filter removes inactive users (quality control)',
                'Map transforms each user by adding fullName (customization)',
                'Sort arranges users by creation date (final organization)',
                'Method chaining creates a pipeline of operations'
            ]
        },
        userSkillLevel: 4,
        onExploreMore: () => console.log('Exploring more details...')
    };
    return _jsx(MetaphorCard, { ...exampleProps });
};
export default MetaphorCard;
//# sourceMappingURL=MetaphorCard.js.map