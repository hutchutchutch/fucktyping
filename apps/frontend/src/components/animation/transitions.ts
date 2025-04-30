// apps/frontend/src/components/transitions.ts
export const slideVariants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

export const bounceTransition = {
  type: "spring",
  stiffness: 60,
  damping: 15,
  mass: 0.5,
};

// Vertical bar transition variants
export const verticalBarVariants = {
  initial: { 
    x: "-10px", 
    width: "2px", 
    opacity: 1,
    backgroundColor: "#000"
  },
  animate: { 
    x: "100vw", 
    width: "2px", 
    opacity: 1,
    backgroundColor: "#000"
  },
  exit: { 
    x: "100vw", 
    opacity: 0,
    backgroundColor: "#000"
  },
};

// Transition for the vertical bar - using tween for smooth, predictable animation
export const verticalBarTransition = {
  type: "tween",
  ease: "linear",
  duration: 2.0,
};

// Container variants for the desktop transition
export const desktopContainerVariants = {
  initial: {},
  animate: {},
  exit: {},
};

// Clip path variants for revealing content
export const clipPathVariants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0 0 0)" },
};
