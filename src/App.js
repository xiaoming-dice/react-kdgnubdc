// App.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const levels = [
  { name: '排', base: 10, color: 'bg-blue-100' },
  { name: '连', mult: 3, color: 'bg-green-100' },
  { name: '营', mult: 3, color: 'bg-yellow-100' },
  { name: '团', mult: 3, color: 'bg-orange-100' },
  { name: '旅', mult: 3, color: 'bg-red-100' },
  { name: '师', mult: 3, color: 'bg-purple-100' },
  { name: '军', mult: 3, color: 'bg-pink-100' },
];

function Node({ index, openIndex, setOpenIndex, parentTotal }) {
  const level = levels[index];
  const isOpen = openIndex === index;
  const nextTotal = index === 0 ? level.base : parentTotal * (level.mult || 1);

  return (
    <motion.div
      layout
      className={`p-4 rounded-2xl shadow-md my-3 ${
        level.color
      } cursor-pointer border-l-4 ${
        isOpen ? 'border-blue-500' : 'border-transparent'
      }`}
      whileHover={{ scale: 1.03 }}
      onClick={() => setOpenIndex(isOpen ? null : index)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{level.name}</h3>
        <span className="text-gray-700 text-sm">
          {index === 0 ? `${level.base}人` : `×${level.mult}`}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && index < levels.length - 1 && (
          <motion.div
            key={index + 1}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="ml-5 mt-3 border-l-4 border-gray-300 pl-4"
          >
            <Node
              index={index + 1}
              openIndex={openIndex}
              setOpenIndex={setOpenIndex}
              parentTotal={nextTotal}
            />
          </motion.div>
        )}
        {isOpen && index === levels.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-gray-600"
          >
            ✅ 总人数：{nextTotal.toLocaleString()} 人
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function App() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        🧭 结构化组织 × 数学思维
      </h1>
      <p className="text-gray-600 max-w-lg text-center mb-6">
        点击下方的“排 → 连 → 营 → 团 → 旅 → 师 → 军”，看看人数是如何层层叠加的！
      </p>

      <div className="w-full max-w-md">
        <Node
          index={0}
          openIndex={openIndex}
          setOpenIndex={setOpenIndex}
          parentTotal={1}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 p-4 bg-white rounded-xl shadow-md max-w-md text-center"
      >
        <h2 className="font-semibold text-lg text-gray-700 mb-2">
          数学启示 ✨
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          每一层都像是“乘法”的一次嵌套。 当你展开所有层级时，
          <strong> 军 = 排人数 × 3⁶ </strong>， 这体现了
          <strong>分解（递归）与整合（代数）</strong>的思想！
        </p>
      </motion.div>
    </div>
  );
}
