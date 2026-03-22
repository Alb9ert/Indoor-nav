import fs from "fs/promises"
import path from "path"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { saveImageToServer } from "./import-floor.server"

const uploadImageSchema = z.object({
  base64: z.string().min(1),
  filename: z.string().min(1),
  floor: z.string().min(1),
})

const getFloorImageSchema = z.object({
  floor: z.string().min(1),
})

export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(uploadImageSchema)
  .handler(async ({ data }) => {
    await saveImageToServer(data.base64, data.filename, data.floor)
  })

export const getFloorImage = createServerFn({ method: "POST" })
  .inputValidator(getFloorImageSchema)
  .handler(async ({ data }) => {
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    try {
      const files = await fs.readdir(uploadDir)
      const existing = files.find((f) => f.startsWith(`floor_${data.floor}_`))
      return { filepath: existing ? `/uploads/${existing}` : null }
    } catch {
      return { filepath: null }
    }
  })