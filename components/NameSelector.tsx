"use client";
import { useState, useEffect } from "react";

const TEAM = ["Izzy", "팀원2", "팀원3"];

export default function NameSelector({
  onSelect,
}: {
  onSelect: (name: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("eo_user");
    if (saved) {
      setSelected(saved);
      onSelect(saved);
    }
  }, [onSelect]);

  const handleSelect = (name: string) => {
    localStorage.setItem("eo_user", name);
    setSelected(name);
    onSelect(name);
  };

  if (selected) return null;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <p className="text-lg font-semibold mb-6 text-white">나는 누구?</p>
      <div className="flex flex-col gap-3">
        {TEAM.map((name) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className="px-10 py-3 bg-white text-black rounded-full font-medium text-base hover:bg-gray-200 transition"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
