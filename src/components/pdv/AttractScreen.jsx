import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScanLine } from 'lucide-react';

export default function AttractScreen({ logoUrl, companyName }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = format(time, 'HH:mm:ss');
  const formattedDate = format(time, "eeee, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 text-slate-800 p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center flex flex-col items-center"
      >
        {logoUrl ? (
          <img src={logoUrl} alt="Logo da Empresa" className="max-h-32 md:max-h-48 mb-8 object-contain" />
        ) : (
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-slate-900">{companyName || "Bem-vindo"}</h1>
        )}
        
        <p className="text-2xl font-light text-slate-500 capitalize">
          {format(time, "eeee", { locale: ptBR })}
        </p>
        <p className="text-7xl md:text-9xl font-bold tracking-tight text-blue-700 my-2">
          {formattedTime}
        </p>
        <p className="text-lg text-slate-600 capitalize">
          {formattedDate.replace(format(time, 'eeee', { locale: ptBR }), '').trim()}
        </p>

      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-12 flex items-center gap-3 text-slate-400"
      >
        <ScanLine className="w-5 h-5" />
        <span className="text-lg">Aguardando início da venda...</span>
      </motion.div>
    </div>
  );
}