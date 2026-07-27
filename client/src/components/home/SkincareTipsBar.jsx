import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tips = [
  'Stay hydrated for a healthy glow!',
  'Always wear sunscreen, even on cloudy days.',
  'Cleanse your face twice a day.',
  'Moisturize, moisturize, moisturize!',
  'Get enough sleep for your skin to repair itself.',
];

const SkincareTipsBar = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-pink-500 text-white p-2 text-center overflow-hidden">
      <AnimatePresence>
        <motion.p
          key={tips[currentTip]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {tips[currentTip]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default SkincareTipsBar;