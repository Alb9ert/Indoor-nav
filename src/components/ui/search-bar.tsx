"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchResultList, type SearchResultItem } from "./search-result-list"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBarBaseProps {
  placeholder?: string
  /** Called on input value change (both modes) */
  onQueryChange?: (query: string) => void
  /** Called when the search icon / Enter key is pressed (both modes) */
  onSearch?: (query: string) => void
  /** Called when the input gains focus */
  onFocus?: () => void
  className?: string
  /** Initial / controlled value */
  value?: string
  /** aria-label for the input */
  inputAriaLabel?: string
}

/** Standalone bar – no results dropdown */
interface SearchBarStandaloneProps extends SearchBarBaseProps {
  type: "standalone"
}

/** Integrated bar – dropdown opens when focused / query changes */
interface SearchBarIntegratedProps extends SearchBarBaseProps {
  type: "integrated"
  /** Items to show in the dropdown */
  results: SearchResultItem[]
  onResultClick?: (item: SearchResultItem) => void
  /** Show results even when query is empty (like Google Maps on focus) */
  showResultsWhenEmpty?: boolean
}

/**
 * Field bar – integrated styling (rounded pill) with a customizable leading
 * icon and no internal dropdown. Use when results are rendered elsewhere
 * (e.g. in a panel body shared between multiple field instances).
 */
interface SearchBarFieldProps extends SearchBarBaseProps {
  type: "field"
  /** Leading icon. Defaults to a Search icon. */
  leadingIcon?: React.ReactNode
  /** Show a focus ring even when blurred (e.g. while this field owns the active search). */
  active?: boolean
  /** When set, renders a trailing X that calls this on click. */
  onClear?: () => void
}

export type SearchBarProps =
  | SearchBarStandaloneProps
  | SearchBarIntegratedProps
  | SearchBarFieldProps

// ─── SearchBar ────────────────────────────────────────────────────────────────

export function SearchBar(props: SearchBarProps) {
  const {
    placeholder = "Search",
    onQueryChange,
    onSearch,
    className,
    value: controlledValue,
    inputAriaLabel,
  } = props

  const [internalQuery, setInternalQuery] = React.useState(controlledValue ?? "")
  const [isFocused, setIsFocused] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const query = controlledValue !== undefined ? controlledValue : internalQuery

  // Sync if controlled
  React.useEffect(() => {
    if (controlledValue !== undefined) setInternalQuery(controlledValue)
  }, [controlledValue])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (props.type !== "integrated") return
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [props.type])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    if (controlledValue === undefined) setInternalQuery(val)
    onQueryChange?.(val)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onSearch?.(query)
      if (props.type === "integrated") setIsFocused(false)
    }
    if (e.key === "Escape" && props.type === "integrated") {
      setIsFocused(false)
    }
  }

  // ── Field mode (rounded pill, custom leading icon, no dropdown) ─────────

  if (props.type === "field") {
    const { leadingIcon, active, onFocus, onClear } = props
    return (
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
        <input
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true)
            onFocus?.()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={inputAriaLabel ?? placeholder}
          className={cn(
            "flex-1 min-w-0 bg-transparent text-card-foreground",
            "placeholder:text-muted-foreground",
            "text-base leading-6",
            "focus:outline-none",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        {onClear && query.length > 0 && (
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
  }

  // ── Integrated mode (rounded, dropdown overlays content) ─────────────────

  if (props.type === "integrated") {
    const { results, onResultClick, showResultsWhenEmpty = true } = props

    const showDropdown =
      isFocused && (showResultsWhenEmpty || query.length > 0) && results.length > 0

    return (
      <div ref={wrapperRef} className={cn("relative w-full", className)}>
        {/* Search bar */}
        <div
          className={cn(
            "bg-card shadow-md border border-border/60 overflow-hidden",
            showDropdown ? "rounded-t-2xl rounded-b-none" : "rounded-full",
          )}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={handleChange}
              onFocus={() => {
                setIsFocused(true)
                props.onFocus?.()
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label={inputAriaLabel ?? placeholder}
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls={showDropdown ? "search-results-dropdown" : undefined}
              role="combobox"
              className={cn(
                "flex-1 min-w-0 bg-transparent text-foreground",
                "placeholder:text-muted-foreground",
                "text-base leading-6",
                "focus:outline-none",
                "[&::-webkit-search-cancel-button]:hidden",
              )}
            />
          </div>
        </div>

        {/* Dropdown results – positioned absolutely to overlay content */}
        {showDropdown && (
          <div
            id="search-results-dropdown"
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

  // ── Standalone mode (more square/rectangular) ────────────────────────────

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "bg-card rounded-lg shadow-md border border-border/60",
        className,
      )}
    >
      <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={inputAriaLabel ?? placeholder}
        className={cn(
          "flex-1 min-w-0 bg-transparent text-foreground",
          "placeholder:text-muted-foreground",
          "text-base leading-6",
          "focus:outline-none",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
    </div>
  )
}
