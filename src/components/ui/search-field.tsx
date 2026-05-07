import * as React from "react"
import { Search, X } from "lucide-react"

import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"

interface SearchFieldProps {
  /** Controlled value. */
  value: string
  onQueryChange: (value: string) => void
  /** Called when the user presses Enter. */
  onSearch?: (value: string) => void
  onFocus?: () => void
  /** When provided and `value` is non-empty, renders a trailing X button. */
  onClear?: () => void
  /** Defaults to a search icon. */
  leadingIcon?: React.ReactNode
  /** Render a focus ring even when blurred (e.g. while this field owns the active search). */
  active?: boolean
  placeholder?: string
  inputAriaLabel?: string
  inputRef?: React.Ref<HTMLInputElement>
  className?: string
}

/**
 * Rounded-pill search field with a customizable leading icon and an optional
 * trailing clear button. Renders no dropdown — use when results live elsewhere
 * (e.g. shared between multiple field instances in a panel body).
 */
export const SearchField = ({
  value,
  onQueryChange,
  onSearch,
  onFocus,
  onClear,
  leadingIcon,
  active,
  placeholder = "Search",
  inputAriaLabel,
  inputRef,
  className,
}: SearchFieldProps) => (
  <div
    className={cn(
      "flex items-center gap-3 px-4 py-3",
      "bg-card rounded-full shadow-md border border-border/60",
      active && "ring-2 ring-primary/60",
      className,
    )}
  >
    {leadingIcon ?? (
      <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
    )}
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
      onFocus={onFocus}
    />
    {onClear && value.length > 0 && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear"
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    )}
  </div>
)
