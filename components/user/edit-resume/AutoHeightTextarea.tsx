"use client";

import { useEffect, useRef } from "react";

interface AutoHeightTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
}

export const AutoHeightTextarea = ({
  value,
  onChange,
  className,
  placeholder,
}: AutoHeightTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`${className} overflow-y-auto`}
      placeholder={placeholder}
      style={{ maxHeight: "700px" }}
    />
  );
};

