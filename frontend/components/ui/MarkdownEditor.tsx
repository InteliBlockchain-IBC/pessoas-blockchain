"use client";

import { useState } from "react";
import { MarkdownViewer } from "./MarkdownViewer";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className = "" }: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className={`flex flex-col border border-border rounded-block overflow-hidden ${className}`}>
      <div className="flex bg-surface-raised border-b border-border">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 font-heading font-bold text-sm ${!isPreview ? "bg-surface text-accent" : "text-fg-muted hover:text-fg"}`}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 font-heading font-bold text-sm border-l border-border ${isPreview ? "bg-surface text-accent" : "text-fg-muted hover:text-fg"}`}
        >
          Visualizar
        </button>
      </div>

      <div className="bg-surface-sunken p-4 min-h-[200px]">
        {isPreview ? (
          <MarkdownViewer content={value} />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Suporta Markdown (ex: **negrito**, - lista)"}
            className="w-full h-full min-h-[180px] bg-transparent text-fg placeholder:text-fg-subtle focus:outline-none resize-y"
          />
        )}
      </div>
    </div>
  );
}
