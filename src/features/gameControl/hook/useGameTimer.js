import { useState, useEffect } from 'react';

export const useGameTimer = (initialMinutes = 10) => {
    const [seconds, setSeconds] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);

    // Cuando el contador llega a 0, apagamos el timer.
    useEffect(() => {
        if (seconds === 0 && isActive) {
            setIsActive(false);
        }
    }, [seconds, isActive]);

    useEffect(() => {
        let interval = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => Math.max(0, prevSeconds - 1));
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    const toggleTimer = () => setIsActive(!isActive);
    const startTimer = () => setIsActive(true);
    const pauseTimer = () => setIsActive(false);

    const resetTimer = (mins = initialMinutes) => {
        setIsActive(false);
        setSeconds(mins * 60);
    };

    const setExactSeconds = (secs) => {
        setSeconds(secs);
    };

    const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return {
        seconds,
        isActive,
        toggleTimer,
        startTimer,
        pauseTimer,
        resetTimer,
        setExactSeconds,
        formatTime
    };
};
