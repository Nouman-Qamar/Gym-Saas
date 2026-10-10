"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

export function QrDisplay({ value }: { value: string }) {
  return (
    <motion.div
      className="rounded-[var(--radius-lg)] bg-white p-6 shadow-xl shadow-black/20"
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <QRCodeSVG value={value} size={220} fgColor="#121016" bgColor="#ffffff" level="M" />
    </motion.div>
  );
}
