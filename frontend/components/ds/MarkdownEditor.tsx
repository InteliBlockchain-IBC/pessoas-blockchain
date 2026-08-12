"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownViewer } from "./MarkdownViewer";

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, className = "" }: MarkdownEditorProps) {
  return (
    <Tabs defaultValue="editar" className={`gap-0 overflow-hidden rounded-none border border-border ${className}`}>
      <TabsList variant="line" className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-surface-raised p-0">
        <TabsTrigger
          value="editar"
          className="flex-none rounded-none px-4 py-2 font-heading text-sm font-bold data-[state=active]:bg-surface data-[state=active]:text-accent data-[state=active]:shadow-none"
        >
          Editar
        </TabsTrigger>
        <TabsTrigger
          value="visualizar"
          className="flex-none rounded-none border-l border-border px-4 py-2 font-heading text-sm font-bold data-[state=active]:bg-surface data-[state=active]:text-accent data-[state=active]:shadow-none"
        >
          Visualizar
        </TabsTrigger>
      </TabsList>

      <TabsContent value="editar" className="mt-0 flex flex-col bg-surface-sunken">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Suporta Markdown (ex: **negrito**, - lista)"}
          className="min-h-[180px] w-full resize-y bg-transparent p-4 text-fg placeholder:text-fg-subtle"
        />
        <div className="border-t border-border px-4 py-1.5 text-right text-xs text-fg-muted">
          {value.length} caractere{value.length === 1 ? "" : "s"}
        </div>
      </TabsContent>

      <TabsContent value="visualizar" className="mt-0 min-h-[200px] bg-surface-sunken p-4">
        <MarkdownViewer content={value} />
      </TabsContent>
    </Tabs>
  );
}
