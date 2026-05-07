import * as React from "react"
import { Search } from "lucide-react"

import { SearchInput } from "@/components/ui/search-input"
import { SearchResultList, type SearchResultItem } from "@/components/ui/search-result-list"
import { cn } from "@/lib/utils"

interface SearchComboboxProps {
  /** Controlled value. */
  value: string
  onQueryChange: (value: string) => void
  /** Called when the user presses Enter. Closes the dropdown as a side effect. */
  onSearch?: (value: string) => void
  onFocus?: () => void
  /** Items to show in the dropdown. */
  results: SearchResultItem[]
  onResultClick?: (item: SearchResultItem) => void
  /** Show results even when `value` is empty (e.g. recent searches). Defaults to true. */
  showResultsWhenEmpty?: boolean
  placeholder?: string
  inputAriaLabel?: string
  inputRef?: React.Ref<HTMLInputElement>
  className?: string
}

const DROPDOWN_ID = "search-results-dropdown"

/**
 * Rounded-pill search bar with an overlay dropdown of results. Opens on focus,
 * closes on outside click, Escape, or after a result is chosen. The bar's top
 * corners square off when the dropdown is open so the two read as one surface.
 */
export const SearchCombobox = ({
  value,
  onQueryChange,
  onSearch,
  onFocus,
  results,
  onResultClick,
  showResultsWhenEmpty = true,
  placeholder = "Search",
  inputAriaLabel,
  inputRef,
  className,
}: SearchComboboxProps) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [])

  const showDropdown =
    isFocused && (showResultsWhenEmpty || value.length > 0) && results.length > 0

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "bg-card shadow-md border border-border/60 overflow-hidden",
          showDropdown ? "rounded-t-2xl rounded-b-none" : "rounded-full",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3">
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
              if (e.key === "Enter") {
                onSearch?.(value)
                setIsFocused(false)
              } else if (e.key === "Escape") {
                setIsFocused(false)
              }
            }}
            onFocus={() => {
              setIsFocused(true)
              onFocus?.()
            }}
            combobox={{
              expanded: showDropdown,
              controlsId: showDropdown ? DROPDOWN_ID : undefined,
            }}
          />
        </div>
      </div>

      {showDropdown && (
        <div
          id={DROPDOWN_ID}
          className="absolute left-0 right-0 top-full z-50 bg-card border border-t-0 border-border/60 rounded-b-2xl shadow-lg overflow-hidden"
        >
          <div className="h-px bg-border" />
          <SearchResultList
            items={results}
            onItemClick={(item) => {
              onResultClick?.(item)
              setIsFocused(false)
            }}
            bare
          />
        </div>
      )}
    </div>
  )
}
