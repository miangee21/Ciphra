// src/features/lock/components/PinInput.tsx
import { useState, useRef, useEffect } from "react";

interface PinInputProps {
  onSubmit: (pin: string) => void;
  error: string;
  disabled: boolean;
}

export default function PinInput({ onSubmit, error, disabled }: PinInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isRevealed, setIsRevealed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto submit when all 6 digits filled
  const isComplete = digits.every((d) => d !== "");
  const currentPin = digits.join("");

  useEffect(() => {
    if (isComplete) {
      onSubmit(currentPin);
      // Clear after submit attempt
      const timer = setTimeout(() => {
        setDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, currentPin]);

  const handleChange = (index: number, value: string) => {
    // Extract only the number
    const digit = value.replace(/\D/g, "").slice(-1);

    if (digit) {
      const updated = [...digits];
      updated[index] = digit;
      setDigits(updated);

      // Move to next input smoothly
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const updated = [...digits];

      if (digits[index]) {
        // Clear current box
        updated[index] = "";
        setDigits(updated);
      } else if (index > 0) {
        // Clear previous box and jump back
        updated[index - 1] = "";
        setDigits(updated);
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Allow arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 6 PIN Boxes Container */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-3 group/container cursor-pointer"
        onMouseEnter={() => setIsRevealed(true)}
        onMouseLeave={() => setIsRevealed(false)}
      >
        {digits.map((digit, i) => {
          const isFilled = digit !== "";

          // The magic logic: Show actual number if container is hovered, otherwise show bullet
          const displayValue = isFilled ? (isRevealed ? digit : "•") : "";

          return (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={displayValue}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={disabled}
              className={`
                w-12 h-14 sm:w-14 sm:h-16 text-center text-3xl font-bold rounded-2xl border-2 outline-none transition-all duration-300 ease-out select-none
                ${
                  isFilled
                    ? "bg-white dark:bg-slate-800/80 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                    : "bg-slate-100 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700/50 text-slate-900 dark:text-white"
                }
                ${error ? "border-red-400! dark:border-red-500/50! bg-red-50! dark:bg-red-950/20! text-red-500" : ""}
                focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:-translate-y-1
                disabled:opacity-40 disabled:cursor-not-allowed
              `}
              autoComplete="off"
              spellCheck="false"
            />
          );
        })}
      </div>

      {/* Error Message */}
      <div className="h-6 flex items-center justify-center">
        {error && (
          <p className="text-sm text-red-500 text-center font-medium animate-in slide-in-from-top-1 fade-in">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
