import { useForm } from "@tanstack/react-form"
import { UploadCloud, X, AlertTriangle } from "lucide-react"
import { useState, useCallback } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { z } from "zod"

import { uploadImage, getFloorImage } from "#/server/import-floor.functions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

const ACCEPTED_IMAGE_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
}
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

type UploadState = "idle" | "uploading" | "success" | "error"

const ImportFloorForm = () => {
  const [preview, setPreview] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ state: UploadState; message?: string }>({
    state: "idle",
  })
  const [overwrite, setOverwrite] = useState<{ show: boolean; existingImage: string | null }>({
    show: false,
    existingImage: null,
  })

  const formSchema = z.object({
    file: z
      .instanceof(File, { message: "Please upload an image" })
      .refine((f) => f.size <= MAX_FILE_SIZE, "Image must be 10 MB or smaller")
      .refine(
        (f) => Object.keys(ACCEPTED_IMAGE_TYPES).includes(f.type),
        `Only ${Object.values(ACCEPTED_IMAGE_TYPES).flat().join(", ")} files are accepted`,
      ),
    floor: z.string().min(1, "Please select a floor"),
  })

  const form = useForm({
    defaultValues: {
      file: null as File | null,
      floor: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { file, floor } = value
      if (!file || !floor) return

      setUploadStatus({ state: "idle" })

      if (!overwrite.show) {
        try {
          const result = await getFloorImage({ data: { floor } })
          if (result.filepath) {
            setOverwrite({ show: true, existingImage: result.filepath })
            return
          }
        } catch {
          setUploadStatus({
            state: "error",
            message: "Failed to check existing floor plan. Please try again.",
          })
          return
        }
      }

      await doUpload(file, floor)
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const { code } = rejectedFiles[0].errors[0] ?? {}
        if (code === "file-too-large") {
          setUploadStatus({ state: "error", message: "Image must be 10 MB or smaller" })
        } else if (code === "file-invalid-type") {
          setUploadStatus({
            state: "error",
            message: `Only ${Object.values(ACCEPTED_IMAGE_TYPES).flat().join(", ")} files are accepted`,
          })
        }
        return
      }

      if (acceptedFiles.length === 0) return

      const selected = acceptedFiles[0]
      form.setFieldValue("file", selected)
      setUploadStatus({ state: "idle" })
      setOverwrite({ show: false, existingImage: null })
      setPreview(URL.createObjectURL(selected))
    },
    [form],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  })

  const handleRemove = () => {
    form.setFieldValue("file", null)
    setPreview(null)
    setUploadStatus({ state: "idle" })
    setOverwrite({ show: false, existingImage: null })
  }

  const handleFloorChange = (value: string | null) => {
    if (!value) return
    form.setFieldValue("floor", value)
    setUploadStatus({ state: "idle" })
    setOverwrite({ show: false, existingImage: null })
  }

  const doUpload = async (file: File, floor: string) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    try {
      setUploadStatus({ state: "uploading" })
      setOverwrite({ show: false, existingImage: null })
      await uploadImage({ data: { base64, filename: file.name, floor } })
      setUploadStatus({ state: "success" })
    } catch (err) {
      console.error("Upload failed:", err)
      setUploadStatus({ state: "error", message: "Upload failed. Please try again." })
    }
  }

  const isUploading = uploadStatus.state === "uploading"

  return (
    <>
      {lightboxOpen && overwrite.existingImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute -top-4 -right-4 z-10 rounded-full shadow-lg"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={overwrite.existingImage}
              alt="Current floor plan"
              className="rounded-xl w-full max-h-[80vh] object-contain shadow-2xl"
            />
            <p className="text-center text-white/70 text-sm mt-3">
              Floor {form.getFieldValue("floor")} — current floor plan
            </p>
          </div>
        </div>
      )}

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit().catch((err: unknown) => {
                console.error("Form submission error:", err)
              })
            }}
            className="space-y-4"
          >
            {/* Drag & Drop */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl text-center cursor-pointer transition
                ${preview ? "p-3" : "p-6"}
                ${isDragActive ? "border-primary bg-muted" : "border-muted-foreground/30"}`}
            >
              <input {...getInputProps()} />
              <div
                className={`flex items-center gap-2 text-sm text-muted-foreground
                ${preview ? "justify-center flex-row" : "flex-col"}`}
              >
                <UploadCloud className={preview ? "w-4 h-4 shrink-0" : "w-8 h-8"} />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : preview ? (
                  <p className="text-xs">Drop a new image to replace, or click to browse</p>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Drag & drop an image here</p>
                    <p>{Object.values(ACCEPTED_IMAGE_TYPES).flat().join(", ")} · Max 10 MB</p>
                    <p>or click to browse</p>
                  </>
                )}
              </div>
            </div>
            {/* Preview */}
            {preview && (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-xl w-full h-48 object-cover border"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            {/* Floor Selector */}
            <form.Field name="floor">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    placeholder="Enter floor number"
                    value={field.state.value}
                    onChange={(e) => handleFloorChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
            {/* <form.Field name="floor">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="floor">Select Floor</Label>
                  <Select onValueChange={handleFloorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {[-1, 0, 1, 2, 3, 4, 5, 6].map((f) => (
                        <SelectItem key={f} value={f.toString()}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field> */}
            {/* Overwrite Warning */}
            <AlertDialog
              open={overwrite.show && !!overwrite.existingImage}
              onOpenChange={(open) => !open && setOverwrite({ show: false, existingImage: null })}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Overwrite existing floor plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A floor plan already exists for floor {form.getFieldValue("floor")}. This will
                    replace it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {overwrite.existingImage && (
                  <div
                    className="relative group cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                  >
                    <img
                      src={overwrite.existingImage}
                      alt="Existing floor plan"
                      className="rounded-lg w-full h-48 object-cover border transition group-hover:brightness-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setOverwrite({ show: false, existingImage: null })}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isUploading}
                    onClick={async () => {
                      const file = form.getFieldValue("file")
                      const floor = form.getFieldValue("floor")
                      if (file && floor) await doUpload(file, floor)
                    }}
                  >
                    {isUploading ? "Uploading..." : "Yes, overwrite"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {!overwrite.show && (
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            )}
            <form.Subscribe selector={(state) => state.errors}>
              {(errors) =>
                errors.length > 0 && (
                  <p className="text-sm text-red-500 font-bold text-center">{errors[0]}</p>
                )
              }
            </form.Subscribe>
            {uploadStatus.state === "error" && (
              <p className="text-sm text-red-500 font-bold text-center">{uploadStatus.message}</p>
            )}
            {uploadStatus.state === "success" && (
              <p className="text-sm text-green-500 font-bold text-center">
                {`Floor plan was successfully uploaded for floor ${form.getFieldValue("floor")}`}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default ImportFloorForm
