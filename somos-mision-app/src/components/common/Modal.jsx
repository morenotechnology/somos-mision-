import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              className={`card w-full ${sizes[size]} shadow-2xl max-h-[90vh] flex flex-col`}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
                  <h3 className="font-bold text-[#0F172A] text-base">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl hover:bg-[#F5F7FA] transition text-[#94A3B8] hover:text-[#475569]"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
