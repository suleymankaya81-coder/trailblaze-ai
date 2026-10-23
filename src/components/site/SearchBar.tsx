import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const popular = [
  "Yellowstone",
  "Yosemite",
  "Glamping Weekend",
  "RV Adventure",
  "Lake Tahoe",
  "Moab",
];

export function SearchBar({ size = "lg" }: { size?: "lg" | "md" }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    navigate({ to: "/search", search: { q: v } });
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className={
          "flex w-full items-center gap-2 rounded-full border border-border bg-background/90 p-2 shadow-lift backdrop-blur " +
          (size === "lg" ? "max-w-2xl" : "max-w-xl")
        }
      >
        <Search className="ml-1 h-5 w-5 shrink-0 text-muted-foreground sm:ml-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Where do you want to go? Try 'Yellowstone' or 'RV Adventure'"
          aria-label="Destination or trip type"
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:px-2"
        />
        <Button type="submit" variant="hero" size={size === "lg" ? "lg" : "default"} className="shrink-0 px-3 sm:px-6">
          Build my trip
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap gap-2">
        {popular.map((p) => (
          <button
            key={p}
            onClick={() => submit(p)}
            className="rounded-full border border-foreground/15 bg-background/40 px-4 py-1.5 text-xs text-foreground/85 backdrop-blur transition hover:bg-background/70"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
