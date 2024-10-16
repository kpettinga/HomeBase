import { create } from "zustand"
import { rooms } from "./data"
import { RoomInterface } from "../types"

export interface StateInterface {
  activeRoom: RoomInterface | null
  setActiveRoom: (roomId: string|number|null) => void
  rooms: RoomInterface[]
  updateRoom: (roomId: string|number, data: Partial<RoomInterface>) => void
}

export const useRoomStore = create<StateInterface>()(
  (set) => ({
    activeRoom: null,
    setActiveRoom: (roomId: string|number|null) => set({ activeRoom: roomId ? rooms.find((r: RoomInterface) => r.id === roomId) : null }),
    rooms,
    updateRoom: (roomId: string|number, data: Partial<RoomInterface>) => (
      set( state => ({ 
        rooms: state.rooms.map((r: RoomInterface) => r.id === roomId ? {...r, ...data} : r)
      })
    ))
  })
)