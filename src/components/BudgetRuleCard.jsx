import React from 'react';
import { motion } from 'framer-motion';

const RuleItem = ({ label, percentage, color, delay }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-baseline">
      <span className="font-semibold text-gray-800 dark:text-gray-100">{label}</span>
      <span className="text-lg font-bold text-gray-900 dark:text-white">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
      <motion.div
        className={`h-3 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeInOut", delay }}
      />
    </div>
  </div>
);

const BudgetRuleCard = ({ onApply, formatCurrency }) => {
  const rules = [
    { label: 'Needs', percentage: 50, color: 'bg-blue-500' },
    { label: 'Wants', percentage: 30, color: 'bg-purple-500' },
    { label: 'Savings', percentage: 20, color: 'bg-green-500' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-lg mx-auto border border-gray-200 dark:border-gray-700"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Auto-Allocate with the 50/30/20 Rule
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
          Automatically divide your monthly income into three key categories.
        </p>
      </div>
      
      <div className="space-y-5">
        {rules.map((rule, index) => (
          <RuleItem key={rule.label} {...rule} delay={0.2 + index * 0.2} />
        ))}
      </div>

      <div className="mt-8">
        <motion.button
          onClick={onApply}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          aria-label="Apply the 50-30-20 budgeting rule to your monthly income"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Apply 50-30-20 Rule
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BudgetRuleCard;
