import { useState } from "react";
import { X, Plus, Tag } from "lucide-react";

// ─── Interest suggestions ──────────────────────────────────────────────────────

const INTEREST_SUGGESTIONS = [
  "Hackathon",
  "Acadêmico",
  "Pesquisa",
  "Blockchain",
  "Design",
  "Tecnologia",
  "Finanças",
];

// ─── Interests tag editor ──────────────────────────────────────────────────────

export function InterestsTags({
  interests,
  editing,
  onChange,
}: {
  interests: string[];
  editing: boolean;
  onChange?: (interests: string[]) => void;
}) {
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !interests.includes(tag)) {
      onChange?.([...interests, tag]);
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    onChange?.(interests.filter((t) => t !== tag));
  };

  if (interests.length === 0 && !editing) {
    return <span className="opacity-40 text-sm">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {interests.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2.5 py-1 bg-surface-raised border border-border rounded-full text-xs font-medium text-fg"
        >
          <Tag size={10} className="opacity-50" />
          {tag}
          {editing && (
            <button
              onClick={() => removeTag(tag)}
              className="ml-0.5 text-danger hover:opacity-80"
            >
              <X size={11} />
            </button>
          )}
        </span>
      ))}
      {editing && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="+ adicionar..."
            className="bg-surface-sunken border border-border-interactive text-fg text-xs rounded-full px-3 py-1 w-32 focus:outline-none focus:border-accent"
          />
          <button
            onClick={addTag}
            className="p-1 rounded-full bg-accent text-accent-fg hover:opacity-80"
          >
            <Plus size={11} />
          </button>
        </div>
      )}
      {editing && (
        <div className="w-full flex flex-wrap gap-1.5 items-center pt-1">
          <span className="text-xs opacity-40">Sugestões:</span>
          {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => onChange?.([...interests, s])}
              className="px-2 py-0.5 text-xs rounded-full border border-border text-fg-muted hover:border-accent hover:text-accent transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
