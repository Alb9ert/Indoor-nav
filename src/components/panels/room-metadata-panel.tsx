import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"

import { Panel } from "#/components/panels/panel"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { RoomTypeBadge } from "#/components/ui/room-type-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { useMap } from "#/lib/map-context"
import { ROOM_TYPES } from "#/lib/room-types"
import {
  createRoomData,
  deleteRoomData,
  getAllRoomsData,
  updateRoomMetadataData,
} from "#/server/room.functions"

import type { RoomType } from "#/generated/prisma/enums"
import type { PersistedRoom } from "#/server/room.server"
import type { ReactNode } from "react"

// ────────────────────────────────────────────────────────────────────────────
// Shared layout helpers + form fields used by Create + Edit.
// ────────────────────────────────────────────────────────────────────────────

interface FormValues {
  roomNumber: string
  displayName: string | undefined
  type: RoomType
}

const requiredString = (label: string) => (value: string) =>
  value.trim() === "" ? `${label} is required` : undefined

const PanelTitle = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="p-4 pr-14">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
  </div>
)

interface FieldWrapperProps {
  htmlFor: string
  label: string
  error?: string
  children: ReactNode
}

const FieldWrapper = ({ htmlFor, label, error, children }: FieldWrapperProps) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
    {error !== undefined && <p className="text-xs text-destructive">{error}</p>}
  </div>
)

const MutationErrorMessage = ({ error, fallback }: { error: unknown; fallback: string }) => {
  const message = error instanceof Error ? error.message : fallback
  return (
    <p className="rounded-lg border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
      {message}
    </p>
  )
}

interface RoomNumberFieldProps {
  id: string
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
}

const RoomNumberField = ({
  id,
  value,
  error,
  onChange,
  onBlur,
  invalid,
}: RoomNumberFieldProps) => (
  <FieldWrapper htmlFor={id} label="Room number" error={error}>
    <Input
      id={id}
      className="bg-background text-black focus:ring-offset-2"
      placeholder="2.01"
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      onBlur={onBlur}
      aria-invalid={invalid}
    />
  </FieldWrapper>
)

interface DisplayNameFieldProps {
  id: string
  value: string | undefined
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
  invalid: boolean
}

const DisplayNameField = ({
  id,
  value,
  error,
  onChange,
  onBlur,
  invalid,
}: DisplayNameFieldProps) => (
  <FieldWrapper htmlFor={id} label="Display name (optional)" error={error}>
    <Input
      id={id}
      className="bg-background text-black focus:ring-offset-2"
      placeholder="Project Lab"
      value={value}
      onChange={(e) => {
        onChange(e.target.value)
      }}
      onBlur={onBlur}
      aria-invalid={invalid}
    />
  </FieldWrapper>
)

interface RoomTypeFieldProps {
  id: string
  value: RoomType
  onChange: (value: RoomType) => void
}

const RoomTypeField = ({ id, value, onChange }: RoomTypeFieldProps) => (
  <FieldWrapper htmlFor={id} label="Room type">
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v)
      }}
    >
      <SelectTrigger className="w-full bg-background text-black">
        <SelectValue>
          {(v) =>
            typeof v === "string" && v !== "" ? <RoomTypeBadge type={v as RoomType} /> : null
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-background text-black">
        {ROOM_TYPES.map((t) => (
          <SelectItem className="focus:bg-sidebar-primary/40 cursor-pointer" key={t} value={t}>
            <RoomTypeBadge type={t} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FieldWrapper>
)

// ────────────────────────────────────────────────────────────────────────────
// Create form — Phase 5 flow.
// ────────────────────────────────────────────────────────────────────────────

const RoomCreatePanel = () => {
  const { drawing, currentFloor } = useMap()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (currentFloor === null) {
        throw new Error("No floor selected")
      }
      const vertices = drawing.vertices.map((v) => ({ x: v.x, z: v.z }))
      return await createRoomData({
        data: { ...values, floor: currentFloor, vertices },
      })
    },
    onSuccess: () => {
      drawing.reset()
      form.reset()
      void queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })

  const form = useForm({
    defaultValues: {
      roomNumber: "",
      displayName: "",
      type: "DEFAULT" as RoomType,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  const handleClose = () => {
    drawing.reset()
    form.reset()
    mutation.reset()
  }

  const handleRevert = () => {
    drawing.reopen()
    mutation.reset()
  }

  const header = (
    <PanelTitle
      title="Save room"
      subtitle={`Floor ${String(currentFloor ?? "-")} · ${String(drawing.vertices.length)} vertices`}
    />
  )

  const footer = (
    <div className="flex flex-col gap-2 p-4">
      <form.Subscribe selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}>
        {({ canSubmit, isSubmitting }) => {
          const busy = isSubmitting || mutation.isPending
          return (
            <Button
              className="hover:bg-slate-300"
              variant="outline"
              type="submit"
              disabled={!canSubmit || busy}
            >
              {busy ? "Saving…" : "Save"}
            </Button>
          )
        }}
      </form.Subscribe>
      <Button type="button" variant="destructive" onClick={handleRevert}>
        Revert to drawing
      </Button>
    </div>
  )

  const body = (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <form.Field
        name="roomNumber"
        validators={{ onChange: ({ value }) => requiredString("Room number")(value) }}
      >
        {(field) => (
          <RoomNumberField
            id={field.name}
            value={field.state.value}
            error={field.state.meta.errors[0]}
            invalid={field.state.meta.errors.length > 0}
            onChange={(v) => {
              field.handleChange(v)
              mutation.reset()
            }}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="displayName">
        {(field) => (
          <DisplayNameField
            id={field.name}
            value={field.state.value}
            error={field.state.meta.errors[0]}
            invalid={field.state.meta.errors.length > 0}
            onChange={(v) => {
              field.handleChange(v)
              mutation.reset()
            }}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <RoomTypeField id={field.name} value={field.state.value} onChange={field.handleChange} />
        )}
      </form.Field>

      {mutation.isError && (
        <MutationErrorMessage error={mutation.error} fallback="Failed to save" />
      )}
    </div>
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Panel open onClose={handleClose} header={header} footer={footer}>
        {body}
      </Panel>
    </form>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Edit form — Phase 7. Auto-populates from the cached room, supports save +
// delete (with inline confirm), and stays in edit mode after success so the
// admin can move on to another room.
// ────────────────────────────────────────────────────────────────────────────

const RoomEditPanel = ({ room }: { room: PersistedRoom }) => {
  const { setEditingRoomId } = useMap()
  const queryClient = useQueryClient()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await updateRoomMetadataData({
        data: { id: room.id, ...values },
      })
    },
    onSuccess: () => {
      setEditingRoomId(null)
      void queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteRoomData({ data: { id: room.id } })
    },
    onSuccess: () => {
      setEditingRoomId(null)
      setConfirmingDelete(false)
      void queryClient.invalidateQueries({ queryKey: ["rooms"] })
    },
  })

  const form = useForm({
    defaultValues: {
      roomNumber: room.roomNumber,
      displayName: room.displayName,
      type: room.type,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync(value)
    },
  })

  const handleClose = () => {
    setEditingRoomId(null)
    setConfirmingDelete(false)
    updateMutation.reset()
    deleteMutation.reset()
  }

  const resetMutationsOnEdit = () => {
    updateMutation.reset()
    deleteMutation.reset()
  }

  const isBusy = updateMutation.isPending || deleteMutation.isPending

  const header = (
    <PanelTitle
      title="Edit room"
      subtitle={`Floor ${String(room.floor)} · ${String(room.vertices.length)} vertices`}
    />
  )

  const footer = (
    <div className="flex flex-col gap-2 p-4">
      {confirmingDelete ? (
        <>
          <p className="text-xs text-destructive">
            Delete room {room.roomNumber}? This cannot be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={() => {
              deleteMutation.mutate()
            }}
          >
            {deleteMutation.isPending ? "Deleting…" : "Confirm delete"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmingDelete(false)
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <>
          <form.Subscribe
            selector={(s) => ({ canSubmit: s.canSubmit, isSubmitting: s.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => {
              const busy = isSubmitting || isBusy
              return (
                <Button
                  className="hover:bg-slate-300"
                  variant="outline"
                  type="submit"
                  disabled={!canSubmit || busy}
                >
                  {busy ? "Saving…" : "Save changes"}
                </Button>
              )
            }}
          </form.Subscribe>
          <Button
            type="button"
            variant="destructive"
            disabled={isBusy}
            onClick={() => {
              setConfirmingDelete(true)
            }}
          >
            <Trash2 className="size-4" />
            Delete room
          </Button>
        </>
      )}
    </div>
  )

  const body = (
    <div className="flex flex-col gap-4 px-4 pb-4">
      <form.Field
        name="roomNumber"
        validators={{ onChange: ({ value }) => requiredString("Room number")(value) }}
      >
        {(field) => (
          <RoomNumberField
            id={field.name}
            value={field.state.value}
            error={field.state.meta.errors[0]}
            invalid={field.state.meta.errors.length > 0}
            onChange={(v) => {
              field.handleChange(v)
              resetMutationsOnEdit()
            }}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="displayName">
        {(field) => (
          <DisplayNameField
            id={field.name}
            value={field.state.value}
            error={field.state.meta.errors[0]}
            invalid={field.state.meta.errors.length > 0}
            onChange={(v) => {
              field.handleChange(v)
              resetMutationsOnEdit()
            }}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <RoomTypeField id={field.name} value={field.state.value} onChange={field.handleChange} />
        )}
      </form.Field>

      {updateMutation.isError && (
        <MutationErrorMessage error={updateMutation.error} fallback="Failed to save changes" />
      )}
      {deleteMutation.isError && (
        <MutationErrorMessage error={deleteMutation.error} fallback="Failed to delete room" />
      )}
    </div>
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <Panel open onClose={handleClose} header={header} footer={footer}>
        {body}
      </Panel>
    </form>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Top-level dispatcher — picks Create vs Edit based on context state.
// ────────────────────────────────────────────────────────────────────────────

export const RoomMetadataPanel = () => {
  const { drawing, editingRoomId } = useMap()

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getAllRoomsData(),
    enabled: editingRoomId !== null,
  })
  const editingRoom = editingRoomId ? (rooms.find((r) => r.id === editingRoomId) ?? null) : null

  if (editingRoom) return <RoomEditPanel key={editingRoom.id} room={editingRoom} />
  if (drawing.closed) return <RoomCreatePanel />
  return null
}
