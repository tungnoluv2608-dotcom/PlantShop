import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type Direction = "up" | "down" | "left" | "right";

interface FadeInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

function getOffset(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
  }
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  className,
  once = true,
  amount = 0.2,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  const offset = getOffset(direction, prefersReducedMotion ? 0 : 24);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...offset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.15 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
