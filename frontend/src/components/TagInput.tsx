"use client";

import { KeyboardEvent, useState } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  tags,
  onChange,
  placeholder = "Type and press Enter…",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue("");
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="tag-container">
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "#1e1e1e",
            border: "1px solid #333",
            borderRadius: 4,
            padding: "3px 8px",
            fontSize: 12,
            fontWeight: 600,
            color: "#c0c0c0",
            letterSpacing: "0.03em",
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              fontSize: 14,
              marginLeft: 2,
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{
          flex: 1,
          minWidth: 120,
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 13,
          color: "#f5f5f5",
          padding: 0,
        }}
      />
    </div>
  );
}
