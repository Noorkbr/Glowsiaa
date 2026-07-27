import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
    title: 'Discover Your Inner Glow',
    subtitle: 'High-quality skincare products for a radiant you.',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
    title: 'New Arrivals',
    subtitle: 'Check out our latest collection of must-have items.',
  },
];

const Banner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gray-800 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={banners[currentBanner].id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${banners[currentBanner].image})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold mb-2"
            >
              {banners[currentBanner].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg"
            >
              {banners[currentBanner].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Banner;