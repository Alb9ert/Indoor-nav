import {
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  BookOpen,
  Presentation,
  BookMarked,
  UtensilsCrossed,
  Wrench,
  FlaskConical,
  DoorOpen,
  Sofa,
  Coffee,
  Landmark,
  Dumbbell,
  Archive,
  Printer,
  Shirt,
  Toilet,
  ShowerHead,
  Sparkles,
  Moon,
  Headphones,
  LifeBuoy,
  Truck,
  Trash2,
  ArrowUpDown,
  Layers,
  GitFork,
  ShieldCheck,
  Mic,
  TrendingUpDownIcon,
  Armchair,
  ConciergeBell,
  Toolbox,
  TriangleRight,
  Waves,
} from "lucide-react"

import { RoomType } from "#/generated/prisma/enums"

import type { LucideIcon } from "lucide-react"

interface RoomTypeMeta {
  label: string
  /** Fill color (hex). The outline color is derived from this. */
  color: string
  icon: LucideIcon
}

export const ROOM_TYPE_META: Record<RoomType, RoomTypeMeta> = {
  DEFAULT: { label: "Default", color: "#64748b", icon: Building2 },

  // Workspace & education
  OFFICE: { label: "Office", color: "#0ea5e9", icon: Briefcase },
  SEMINAR_ROOM: { label: "Seminar room", color: "#fbbf24", icon: GraduationCap },
  GROUP_ROOM: { label: "Group room", color: "#a3e635", icon: Users },
  MEETING_ROOM: { label: "Meeting room", color: "#0051ff", icon: Armchair },
  LABORATORY: { label: "Laboratory", color: "#ef4444", icon: FlaskConical },
  AUDITORIUM: { label: "Auditorium", color: "#763dfc", icon: Presentation },
  STUDY_SPACE: { label: "Study space", color: "#009737", icon: BookOpen },
  VIBRATION_ROOM: { label: "Vibration room", color: "#fb7185", icon: Waves },
  SOUND_BOOTH: { label: "Sound booth", color: "#a78bfa", icon: Mic },
  QUIET_ROOM: { label: "Quiet room", color: "#c4b5fd", icon: Moon },

  // Common areas
  CORRIDOR: { label: "Corridor / hallway", color: "#94a3b8", icon: DoorOpen },
  LOUNGE: { label: "Lounge / common area", color: "#f97316", icon: Sofa },
  KITCHEN: { label: "Kitchen / kitchenette", color: "#fb923c", icon: Coffee },
  CANTEEN: { label: "Canteen / cafeteria", color: "#f59e0b", icon: UtensilsCrossed },
  ATRIUM: { label: "Atrium", color: "#71753b", icon: Landmark },
  RECEPTION: { label: "Reception", color: "#3b82f6", icon: ConciergeBell },
  LIBRARY: { label: "Library", color: "#b08968", icon: BookMarked },
  FITNESS: { label: "Fitness / gym", color: "#10b981", icon: Dumbbell },
  COVERED_AREA: { label: "Covered area", color: "#6b7280", icon: Layers },

  // Service & support
  TECHNICAL_ROOM: { label: "Technical room", color: "#52525b", icon: Wrench },
  STORAGE: { label: "Storage", color: "#a8a29e", icon: Archive },
  PRINT_ROOM: { label: "Print room", color: "#cbd5e1", icon: Printer },
  CLOAKROOM: { label: "Cloakroom", color: "#835f31", icon: Shirt },
  TOILET: { label: "Toilet / restroom", color: "#f7ed61", icon: Toilet },
  CHANGING_ROOM: { label: "Changing / bath", color: "#fb7185", icon: ShowerHead },
  CLEANING_ROOM: { label: "Cleaning room", color: "#f850ce", icon: Sparkles },
  IT_SUPPORT: { label: "IT support", color: "#00ff55", icon: Headphones },
  SERVICE_DESK: { label: "Service desk", color: "#bfff94", icon: LifeBuoy },
  FACILITY_SUPPORT: { label: "Facility support", color: "#78716c", icon: Toolbox },
  LOADING_DOCK: { label: "Loading dock", color: "#2b2b2b", icon: Truck },
  WASTE: { label: "Waste / sorting", color: "#71717a", icon: Trash2 },

  // Infrastructure
  ELEVATOR: { label: "Elevator", color: "#64748b", icon: ArrowUpDown },
  STAIRS: { label: "Stairs", color: "#94a3b8", icon: TrendingUpDownIcon },
  VESTIBULE: { label: "Vestibule / anteroom", color: "#e2e8f0", icon: DoorOpen },
  SHAFT: { label: "Shaft", color: "#475569", icon: GitFork },
  AIRLOCK: { label: "Airlock / sluice", color: "#474747", icon: ShieldCheck },
  RAMP: { label: "Ramp", color: "#cbd5e1", icon: TriangleRight },
}

export const ROOM_TYPES = Object.keys(ROOM_TYPE_META) as RoomType[]

export const withOpacity = (hex: string, opacity = 0.5): string => {
  const num = Number.parseInt(hex.slice(1), 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export const getRoomTypeMeta = (type: RoomType): RoomTypeMeta => ({
  ...ROOM_TYPE_META[type],
  color: withOpacity(ROOM_TYPE_META[type].color),
})

/**
 * Scales each RGB channel toward black. `amount` is the fraction of the
 * channel to remove (0 = unchanged, 1 = black). Used to derive a room's
 * outline color from its fill.
 */
export const darkenHex = (hex: string, amount = 0.5): string => {
  const num = Number.parseInt(hex.slice(1), 16)
  const factor = 1 - amount
  const r = Math.round(((num >> 16) & 0xff) * factor)
  const g = Math.round(((num >> 8) & 0xff) * factor)
  const b = Math.round((num & 0xff) * factor)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

export const getRoomTypeOutline = (type: RoomType): string => darkenHex(ROOM_TYPE_META[type].color)

export const ROOM_TYPE_ALT: Record<RoomType, string[]> = {
  DEFAULT: ["general", "unspecified", "other", "misc", "miscellaneous", "unknown"],

  // Workspace & education
  OFFICE: ["workspace", "desk area", "open plan", "workroom", "bullpen", "cubicle", "bureau"],
  SEMINAR_ROOM: [
    "seminar",
    "classroom",
    "lecture room",
    "teaching room",
    "course room",
    "training room",
    "workshop room",
    "instruction room",
  ],
  GROUP_ROOM: [
    "group space",
    "collaboration room",
    "team room",
    "project room",
    "breakout room",
    "group work",
    "collaborative space",
  ],
  MEETING_ROOM: [
    "conference room",
    "boardroom",
    "board room",
    "meeting space",
    "huddle room",
    "booking room",
    "presentation room",
  ],
  LABORATORY: [
    "lab",
    "science room",
    "research room",
    "experiment room",
    "testing room",
    "research lab",
  ],
  AUDITORIUM: [
    "lecture hall",
    "theater",
    "theatre",
    "assembly hall",
    "hall",
    "presentation hall",
    "event hall",
    "big hall",
  ],
  STUDY_SPACE: [
    "study area",
    "reading area",
    "study hall",
    "study room",
    "learning space",
    "reading room",
    "study zone",
  ],
  VIBRATION_ROOM: [
    "vibration lab",
    "acoustics room",
    "isolation room",
    "testing chamber",
    "vibration chamber",
  ],
  SOUND_BOOTH: [
    "recording booth",
    "recording studio",
    "vocal booth",
    "studio",
    "audio room",
    "music room",
    "podcast room",
  ],
  QUIET_ROOM: [
    "silent room",
    "focus room",
    "no-talk zone",
    "silent zone",
    "concentration room",
    "meditation room",
    "calm room",
  ],

  // Common areas
  CORRIDOR: ["hallway", "hall", "passage", "passageway", "walkway", "aisle", "gangway"],
  LOUNGE: [
    "common area",
    "common room",
    "social area",
    "break area",
    "seating area",
    "relaxation area",
    "chill area",
    "common space",
    "rec room",
  ],
  KITCHEN: [
    "kitchenette",
    "break room",
    "coffee station",
    "tea room",
    "lunchroom",
    "food prep",
    "canteen kitchen",
  ],
  CANTEEN: [
    "cafeteria",
    "food hall",
    "dining room",
    "restaurant",
    "cafe",
    "café",
    "eating area",
    "lunch room",
    "refectory",
    "mess hall",
  ],
  ATRIUM: ["foyer", "open hall", "central hall", "glass hall", "light well", "inner courtyard"],
  RECEPTION: [
    "front desk",
    "lobby",
    "welcome desk",
    "entrance desk",
    "check-in",
    "visitor desk",
    "info desk",
    "information desk",
  ],
  LIBRARY: [
    "book room",
    "reading room",
    "media center",
    "resource center",
    "knowledge center",
    "archive room",
  ],
  FITNESS: ["gym", "exercise room", "workout room", "training room", "sports room", "weight room"],
  COVERED_AREA: [
    "sheltered area",
    "covered space",
    "canopy area",
    "roofed area",
    "outdoor shelter",
  ],

  // Service & support
  TECHNICAL_ROOM: [
    "tech room",
    "mechanical room",
    "plant room",
    "utility room",
    "server room",
    "equipment room",
    "maintenance room",
  ],
  STORAGE: ["stockroom", "store room", "supply room", "warehouse", "depot", "closet", "storeroom"],
  PRINT_ROOM: [
    "copy room",
    "printing room",
    "copier room",
    "print station",
    "reprographics",
    "document room",
  ],
  CLOAKROOM: [
    "coat room",
    "wardrobe",
    "checkroom",
    "cloak area",
    "coat check",
    "hat check",
    "personal storage",
  ],
  TOILET: [
    "restroom",
    "bathroom",
    "WC",
    "lavatory",
    "washroom",
    "loo",
    "facilities",
    "comfort room",
  ],
  CHANGING_ROOM: [
    "locker room",
    "dressing room",
    "bathroom",
    "shower room",
    "bath area",
    "change room",
  ],
  CLEANING_ROOM: [
    "janitor room",
    "janitorial closet",
    "cleaner's room",
    "housekeeping room",
    "mop room",
    "cleaning supplies",
  ],
  IT_SUPPORT: [
    "helpdesk",
    "help desk",
    "tech support",
    "IT desk",
    "computer support",
    "technical support",
  ],
  SERVICE_DESK: ["support desk", "customer service", "info desk", "help center", "assistance desk"],
  FACILITY_SUPPORT: [
    "facilities",
    "maintenance",
    "building services",
    "operations room",
    "facilities management",
  ],
  LOADING_DOCK: [
    "delivery area",
    "goods in",
    "goods receiving",
    "unloading area",
    "freight dock",
    "loading bay",
    "dispatch area",
  ],
  WASTE: [
    "trash room",
    "recycling room",
    "garbage room",
    "bin room",
    "sorting room",
    "waste management",
    "rubbish room",
  ],

  // Infrastructure
  ELEVATOR: ["lift", "elevator shaft", "lift shaft", "accessible transport"],
  STAIRS: [
    "stairwell",
    "staircase",
    "steps",
    "fire stairs",
    "emergency stairs",
    "fire exit stairs",
  ],
  VESTIBULE: [
    "anteroom",
    "antechamber",
    "entrance hall",
    "entry room",
    "lobby area",
    "transitional space",
    "waiting area",
  ],
  SHAFT: ["duct shaft", "pipe shaft", "utility shaft", "service shaft", "vertical duct"],
  AIRLOCK: [
    "sluice",
    "clean room entry",
    "decontamination room",
    "pressure chamber",
    "transition chamber",
  ],
  RAMP: ["slope", "access ramp", "wheelchair ramp", "loading ramp", "incline"],
}
