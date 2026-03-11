"use client";

import { useState, useCallback, useMemo } from "react";
import { objects } from "@/lib/constants/object";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

// Get objects with values for the game
const gameObjects = objects.filter((obj) => obj.value && obj.value > 0);

interface ObjectPair {
  left: (typeof gameObjects)[0];
  right: (typeof gameObjects)[0];
}

function getRandomPair(): ObjectPair {
  // Get all unique types from game objects
  const types = [...new Set(gameObjects.map((obj) => obj.type))];

  // Pick a random type/category
  const randomType = types[Math.floor(Math.random() * types.length)];

  // Filter objects by the selected type
  const objectsOfType = gameObjects.filter((obj) => obj.type === randomType);

  // Need at least 2 objects of this type to make a comparison
  if (objectsOfType.length < 2) {
    // Fallback: if type has less than 2 objects, use all objects
    const leftIdx = Math.floor(Math.random() * gameObjects.length);
    let rightIdx = (leftIdx + 1) % gameObjects.length;
    return { left: gameObjects[leftIdx], right: gameObjects[rightIdx] };
  }

  // Pick two random objects from the same category with at least 20% price difference
  let attempts = 0;
  while (attempts < 50) {
    const leftIdx = Math.floor(Math.random() * objectsOfType.length);
    let rightIdx = Math.floor(Math.random() * objectsOfType.length);

    // Ensure different objects
    while (rightIdx === leftIdx) {
      rightIdx = Math.floor(Math.random() * objectsOfType.length);
    }

    const left = objectsOfType[leftIdx];
    const right = objectsOfType[rightIdx];

    // Check for meaningful price difference (at least 20%)
    const minVal = Math.min(left.value, right.value);
    const maxVal = Math.max(left.value, right.value);
    const diff = (maxVal - minVal) / minVal;

    if (diff >= 0.2) {
      return { left, right };
    }
    attempts++;
  }

  // Fallback: just return any two different objects from the same category
  const leftIdx = Math.floor(Math.random() * objectsOfType.length);
  let rightIdx = (leftIdx + 1) % objectsOfType.length;
  return { left: objectsOfType[leftIdx], right: objectsOfType[rightIdx] };
}

function formatPrice(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

interface FlexGameProps {
  onEarningsChange: (earnings: number) => void;
  totalEarnings: number;
}

export function FlexGame({ onEarningsChange, totalEarnings }: FlexGameProps) {
  const [pair, setPair] = useState<ObjectPair>(() => getRandomPair());
  const [selectedSide, setSelectedSide] = useState<"left" | "right" | null>(
    null
  );
  const [revealed, setRevealed] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);

  const winner = useMemo(() => {
    return pair.left.value > pair.right.value ? "left" : "right";
  }, [pair]);

  const isCorrect = selectedSide === winner;

  const handleSelect = useCallback(
    (side: "left" | "right") => {
      if (revealed) return;

      setSelectedSide(side);
      setRevealed(true);
      setRoundsPlayed((r) => r + 1);

      const winnerValue =
        side === winner ? Math.max(pair.left.value, pair.right.value) : 0;

      if (side === winner) {
        setCorrectStreak((s) => s + 1);
        onEarningsChange(totalEarnings + winnerValue);
      } else {
        setCorrectStreak(0);
      }
    },
    [revealed, winner, pair, totalEarnings, onEarningsChange]
  );

  const handleNextRound = useCallback(() => {
    setPair(getRandomPair());
    setSelectedSide(null);
    setRevealed(false);
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Flex Worth:</span>
          <span className="text-sm font-semibold text-white">
            {formatPrice(totalEarnings)}
          </span>
        </div>
        <div className="text-xs text-neutral-500">
          {correctStreak > 0 && (
            <span className="text-white">🔥 {correctStreak}</span>
          )}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm text-neutral-400 py-3">Which costs more?</p>

      {/* Main game area - two sides with divider */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        {/* Left side - darker grey */}
        <button
          onClick={() => handleSelect("left")}
          disabled={revealed}
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300 relative",
            "bg-neutral-900",
            !revealed && "hover:bg-neutral-800 active:bg-neutral-850",
            revealed &&
              selectedSide === "left" &&
              isCorrect &&
              "bg-green-950/40",
            revealed &&
              selectedSide === "left" &&
              !isCorrect &&
              "bg-red-950/40",
            revealed &&
              winner === "left" &&
              selectedSide !== "left" &&
              "bg-green-950/20"
          )}
        >
          {/* Object image - large, no background */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            <img
              src={pair.left.image}
              alt={pair.left.name}
              className="max-w-full max-h-full object-contain drop-shadow-lg"
            />
          </div>

          {/* Object name */}
          <p className="text-sm font-medium text-white text-center mt-4 line-clamp-2 px-2">
            {pair.left.name}
          </p>

          {/* Price reveal */}
          <div
            className={cn(
              "mt-3 transition-all duration-500",
              revealed ? "opacity-100" : "opacity-0"
            )}
          >
            {revealed && (
              <span
                className={cn(
                  "text-xl font-bold",
                  winner === "left" ? "text-green-400" : "text-neutral-500"
                )}
              >
                {formatPrice(pair.left.value)}
              </span>
            )}
          </div>

          {/* Result indicator */}
          {revealed && selectedSide === "left" && (
            <div
              className={cn(
                "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
                isCorrect ? "bg-green-500" : "bg-red-500"
              )}
            >
              {isCorrect ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <X className="w-5 h-5 text-white" />
              )}
            </div>
          )}
        </button>

        {/* Center divider line */}
        <div className="w-px bg-neutral-700 relative flex items-center justify-center"></div>

        {/* Right side - lighter grey */}
        <button
          onClick={() => handleSelect("right")}
          disabled={revealed}
          className={cn(
            "flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300 relative",
            "bg-neutral-800",
            !revealed && "hover:bg-neutral-700 active:bg-neutral-750",
            revealed &&
              selectedSide === "right" &&
              isCorrect &&
              "bg-green-950/40",
            revealed &&
              selectedSide === "right" &&
              !isCorrect &&
              "bg-red-950/40",
            revealed &&
              winner === "right" &&
              selectedSide !== "right" &&
              "bg-green-950/20"
          )}
        >
          {/* Object image - large, no background */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            <img
              src={pair.right.image}
              alt={pair.right.name}
              className="max-w-full max-h-full object-contain drop-shadow-lg"
            />
          </div>

          {/* Object name */}
          <p className="text-sm font-medium text-white text-center mt-4 line-clamp-2 px-2">
            {pair.right.name}
          </p>

          {/* Price reveal */}
          <div
            className={cn(
              "mt-3 transition-all duration-500",
              revealed ? "opacity-100" : "opacity-0"
            )}
          >
            {revealed && (
              <span
                className={cn(
                  "text-xl font-bold",
                  winner === "right" ? "text-green-400" : "text-neutral-500"
                )}
              >
                {formatPrice(pair.right.value)}
              </span>
            )}
          </div>

          {/* Result indicator */}
          {revealed && selectedSide === "right" && (
            <div
              className={cn(
                "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
                isCorrect ? "bg-green-500" : "bg-red-500"
              )}
            >
              {isCorrect ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <X className="w-5 h-5 text-white" />
              )}
            </div>
          )}
        </button>
      </div>

      {/* Result message & next button */}
      {revealed && (
        <div className="w-full px-4 py-4 border-t border-neutral-800 flex items-center justify-between animate-in fade-in duration-300">
          <p
            className={cn(
              "text-sm font-medium",
              isCorrect ? "text-green-400" : "text-red-400"
            )}
          >
            {isCorrect
              ? `+${formatPrice(Math.max(pair.left.value, pair.right.value))}`
              : "Wrong!"}
          </p>

          <button
            onClick={handleNextRound}
            className="px-5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-900 text-sm font-medium transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
