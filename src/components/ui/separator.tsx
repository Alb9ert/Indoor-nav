"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "#/lib/utils"

type SeparatorProps = Readonly<SeparatorPrimitive.Props>

function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  const orientationClasses = orientation === "horizontal" ? "h-px" : "w-px self-stretch"

  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn("shrink-0 bg-border", orientationClasses, className)}
      {...props}
    />
  )
}

export { Separator }
