import { Accessibility, Circle, Crosshair, MapPin, Route, Zap } from "lucide-react"

import type { SearchResultItem } from "#/components/ui/search-result-list"
import type { FieldKey } from "#/lib/navigation-context"
import type { RoutePreference } from "#/types/navigation"
import type { LucideIcon } from "lucide-react"

export type { FieldKey }

export interface FieldConfig {
  key: FieldKey
  icon: LucideIcon
  placeholder: string
  ariaLabel: string
}

/** Fields rendered (in order) at the top of the navigation panel. */
export const FIELDS: FieldConfig[] = [
  { key: "start", icon: Circle, placeholder: "Choose start location", ariaLabel: "Start location" },
  {
    key: "destination",
    icon: MapPin,
    placeholder: "Search destination",
    ariaLabel: "Destination",
  },
]

/** Human-readable name for each field, used in headers and result captions. */
export const FIELD_LABEL: Record<FieldKey, string> = {
  start: "start location",
  destination: "destination",
}

interface PreferenceOption {
  value: RoutePreference
  label: string
  icon: LucideIcon
}

/** Routing preference choices shown as a single-select toggle group. */
export const PREFERENCE_OPTIONS: PreferenceOption[] = [
  { value: "SIMPLE", label: "Simple", icon: Route },
  { value: "FAST", label: "Fast", icon: Zap },
  { value: "ACCESSIBLE", label: "Accessible", icon: Accessibility },
]

/** Static "pick a point on the floor plan" row shown above start results. */
export const SELECT_ON_MAP_ITEM: SearchResultItem = {
  id: "Select on map",
  icon: <Crosshair className="w-5 h-5 text-white" />,
  iconBgStyle: { backgroundColor: "var(--color-primary)" },
  title: "",
  type: "Pick a point on the floor plan",
}

/**
 * Vertical 3-dot connector between the two field icons. Aligned to the
 * leading-icon column of the SearchBar field variant (px-4 + half icon).
 */
export const DotConnector = () => (
  <div className="flex pl-4 my-2.5">
    <div className="flex w-5 flex-col items-center gap-1.5 py-0.5">
      <div className="size-1 rounded-full bg-muted-foreground/60" />
      <div className="size-1 rounded-full bg-muted-foreground/60" />
      <div className="size-1 rounded-full bg-muted-foreground/60" />
    </div>
  </div>
)
