import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn' // We need to create this utility or use clsx directly

export default function BentoCard({ children, className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:bg-white/10",
                className
            )}
        >
            {children}
        </motion.div>
    )
}
