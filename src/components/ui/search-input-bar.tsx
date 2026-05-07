import * as React from "react"
import { Search } from "lucide-react"

import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"

interface SearchInputBarProps {
  /** Controlled value. */
  value: string
  onQueryChange: (value: string) => void
  /** Called when the user presses Enter. */
  onSearch?: (value: string) => void
  placeholder?: string
  inputAriaLabel?: string
  inputRef?: React.Ref<HTMLInputElement>
  className?: string
}

/**
 * Rectangular search bar with a leading search icon and no dropdown. Use when
 * results render somewhere outside the bar (or there are none).
 */
export const SearchInputBar = ({
  value,
  onQueryChange,
  onSearch,
  placeholder = "Search",
  inputAriaLabel,
  inputRef,
  className,
}: SearchInputBarProps) => (
  <div
    className={cn(
      "flex items-center gap-3 px-4 py-3",
      "bg-card rounded-lg shadow-md border border-border/60",
      className,
    )}
  >
    <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
    <SearchInput
      ref={inputRef}
      value={value}
      placeholder={placeholder}
      aria-label={inputAriaLabel ?? placeholder}
      onChange={(e) => {
        onQueryChange(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch?.(value)
      }}
    />
  </div>
)
