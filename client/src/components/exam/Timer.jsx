import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Timer = ({ expiresAt, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft(0);
        if (onTimeUp) onTimeUp();
        return 0;
      }

      // Show warning when less than 5 minutes left
      if (difference < 5 * 60 * 1000) {
        setIsWarning(true);
      }

      return Math.floor(difference / 1000); // Convert to seconds
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-300">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-semibold">Time's Up!</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${isWarning
          ? 'bg-red-50 text-red-800 border-red-300 animate-pulse'
          : 'bg-blue-50 text-blue-800 border-blue-300'
        }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <div className="text-xs font-medium uppercase">Time Remaining</div>
        <div className="text-lg font-bold tabular-nums">{formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};

Timer.propTypes = {
  expiresAt: PropTypes.string.isRequired,
  onTimeUp: PropTypes.func
};

export default Timer;
