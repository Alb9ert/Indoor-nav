import { createServerFn } from "@tanstack/react-start"

import { CreateRoomSchema, RoomIdSchema, UpdateRoomMetadataSchema } from "#/types/room"

import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoomWithNodes,
  updateRoomMetadata,
} from "./room.server"

export const createRoomData = createServerFn({ method: "POST" })
  .inputValidator(CreateRoomSchema)
  .handler(async ({ data }) => {
    return await createRoom(data)
  })

export const getAllRoomsData = createServerFn({ method: "GET" }).handler(async () => {
  return await getAllRooms()
})

export const updateRoomMetadataData = createServerFn({ method: "POST" })
  .inputValidator(UpdateRoomMetadataSchema)
  .handler(async ({ data }) => {
    return await updateRoomMetadata(data)
  })

export const deleteRoomData = createServerFn({ method: "POST" })
  .inputValidator(RoomIdSchema)
  .handler(async ({ data }) => {
    return await deleteRoom(data.id)
  })

export const getRoomWithNodesData = createServerFn({ method: "GET" })
  .inputValidator(RoomIdSchema)
  .handler(async ({ data }) => {
    return await getRoomWithNodes(data.id)
  })
