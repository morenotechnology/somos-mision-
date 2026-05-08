import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, Home, ArrowLeft, Map } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Visual */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#1A237E]/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#1A237E]/15 flex items-center justify-center">
              <Map size={36} className="text-[#1A237E]" />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37]/40 flex items-center justify-center">
            <Globe size={18} className="text-[#D4AF37]" />
          </div>
        </div>

        {/* 404 number */}
        <p className="text-8xl font-black text-[#E2E8F0] leading-none mb-4 select-none">404</p>

        <h1 className="text-2xl font-black text-[#0F172A] mb-3">Página no encontrada</h1>
        <p className="text-[#475569] text-sm leading-relaxed mb-8">
          La ruta que buscas no existe o fue movida. Vuelve al inicio y continúa tu misión.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#475569] hover:border-[#1A237E] hover:text-[#1A237E] transition bg-white"
          >
            <ArrowLeft size={15} /> Volver atrás
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="btn-primary flex items-center justify-center gap-2 py-3 px-5 text-sm"
          >
            <Home size={15} /> Ir al Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
