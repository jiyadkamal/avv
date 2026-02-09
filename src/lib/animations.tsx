'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

interface FadeInViewProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export const FadeInView = ({ children, delay = 0, className }: FadeInViewProps) => (
    <motion.div
        initial="initial"
        animate="animate"
        className={className}
        variants={{
            initial: { opacity: 0, y: 15 },
            animate: {
                opacity: 1,
                y: 0,
                transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }
        }}
    >
        {children}
    </motion.div>
);
