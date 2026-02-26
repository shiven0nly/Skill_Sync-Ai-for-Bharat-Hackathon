import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// BridgeUI.tsx
import { motion } from 'framer-motion';
export const BridgeCard = ({ originalConcept, translatedConcept, metaphor }) => {
    return (_jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, className: "p-4 border-l-4 border-blue-500 bg-slate-900 rounded-r-lg", children: [_jsx("h3", { className: "text-xs font-bold text-blue-400 uppercase tracking-widest", children: "The Bridge" }), _jsxs("div", { className: "mt-2", children: [_jsx("span", { className: "line-through text-slate-500", children: originalConcept }), _jsx("span", { className: "mx-2 text-white", children: "\u2192" }), _jsx("span", { className: "text-green-400 font-mono", children: translatedConcept })] }), _jsxs("p", { className: "mt-3 text-sm italic text-slate-300", children: ["\"\uD83D\uDCA1 ", metaphor, "\""] })] }));
};
//# sourceMappingURL=BridgeCard.js.map