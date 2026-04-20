export const fadeIn = (direction = "up", type = "spring", delay = 0, duration = 0.75) => {
    return {
        hidden: {
            x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
            y: direction === "up" ? 100 : direction === "down" ? -100 : 0,
            opacity: 0,
        },
        show: {
            x: 0,
            y: 0,
            opacity: 1,
            transition: {
                type: type,
                delay: delay,
                duration: duration,
                ease: "easeOut",
            },
        },
    };
};

export const staggerContainer = (staggerChildren, delayChildren) => {
    return {
        hidden: {},
        show: {
            transition: {
                staggerChildren: staggerChildren,
                delayChildren: delayChildren || 0,
            },
        },
    };
};

export const textVariant = (delay) => {
    return {
        hidden: {
            y: -50,
            opacity: 0,
        },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                duration: 1.25,
                delay: delay,
            },
        },
    };
};

export const zoomIn = (delay, duration) => {
    return {
        hidden: {
            scale: 0,
            opacity: 0,
        },
        show: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "tween",
                delay: delay,
                duration: duration,
                ease: "easeOut",
            },
        },
    };
};

export const slideIn = (direction, type, delay, duration) => {
    return {
        hidden: {
            x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
            y: direction === "up" ? "100%" : direction === "down" ? "100%" : 0,
        },
        show: {
            x: 0,
            y: 0,
            transition: {
                type: type,
                delay: delay,
                duration: duration,
                ease: "easeOut",
            },
        },
    };
};

/**
 * Clip reveal — element slides up from behind a clip edge (curtain-lift effect).
 * Use inside a container with overflow:hidden.
 */
export const clipReveal = (delay = 0, duration = 0.85) => ({
  hidden: { y: '105%', opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration, ease: [0.22, 1, 0.36, 1], delay },
  },
})

/**
 * Parallax fade-in — larger Y offset + slower ease for dramatic section entrance.
 */
export const parallaxFadeIn = (yOffset = 60, delay = 0, duration = 0.9) => ({
  hidden: { y: yOffset, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration, ease: [0.22, 1, 0.36, 1], delay },
  },
})
