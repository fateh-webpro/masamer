"use client";

import { motion, useReducedMotion } from "motion/react";

export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 12 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}
