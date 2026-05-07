import * as React from "react"

import { cn } from "@/lib/utils"

interface ComboboxAttrs {
  expanded: boolean
  controlsId?: string
}

export interface SearchInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** When set, marks the input as a combobox controlling a results dropdown. */
  combobox?: ComboboxAttrs
}

/**
 * Bare search input. Strips the wrapping shadcn `Input` borders/shadow/padding
 * so the surrounding pill provides the visual chrome, and hides the WebKit
 * cancel button so callers can render their own clear affordance.
 */
export const SearchInput = ({ combobox, className, ...props }: SearchInputProps) => (
  <input
    type="search"
    role={combobox ? "combobox" : undefined}
    aria-expanded={combobox?.expanded}
    aria-autocomplete={combobox ? "list" : undefined}
    aria-controls={combobox?.controlsId}
    className={cn(
      "flex-1 min-w-0 bg-transparent text-foreground",
      "placeholder:text-muted-foreground",
      "text-base leading-6",
      "focus:outline-none",
      "[&::-webkit-search-cancel-button]:hidden",
      className,
    )}
    {...props}
  />
)
