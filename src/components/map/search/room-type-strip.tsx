import { RoomTypeBadge } from "@/components/ui/room-type-badge"
import type { RoomType } from "@/generated/prisma/enums"
import { ROOM_TYPES } from "@/lib/room-types"
import { cn } from "@/lib/utils"

interface RoomTypeStripProps {
  /** Fires when a badge is clicked. The parent decides what to do (e.g. fill the search input). */
  onSelect: (type: RoomType) => void
  className?: string
}

/**
 * Horizontally-scrolling row of room-type badges used as a quick-pick strip.
 * Stateless; the badges have no selected/active styling.
 */
export const RoomTypeStrip = ({ onSelect, className }: RoomTypeStripProps) => (
  <div className={cn("w-full", className)}>
    <div className="flex gap-2 overflow-x-auto px-3 py-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ROOM_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => {
            onSelect(type)
          }}
          className="shrink-0 snap-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <RoomTypeBadge type={type} variant="search" className="border-border/60 cursor-pointer" />
        </button>
      ))}
    </div>
  </div>
)
