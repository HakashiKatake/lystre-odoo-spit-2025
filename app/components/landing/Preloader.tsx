"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Slightly longer for the reveal

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-lystre-black text-lystre-white"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
        >
          <motion.h1
            className="text-6xl md:text-9xl font-serif tracking-tighter"
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            transition={{ duration: 1.5, ease: "circOut" }}
          >
            Lystré
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
