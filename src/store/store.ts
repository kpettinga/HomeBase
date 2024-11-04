import { create } from "zustand"
import { rooms } from "./data"
import { RoomInterface } from "~/utils/types"

export interface StateInterface {
  appColor: string
  setAppColor: (color: string) => void
  activeRoom: RoomInterface | null
  setActiveRoom: (roomId: string|number|null) => void
  rooms: RoomInterface[]
  updateRoom: (roomId: string|number, data: Partial<RoomInterface>) => void
}

export const useRoomStore = create<StateInterface>()(
  (set) => ({
    appColor: '#000000',
    setAppColor: (color: string) => set({ appColor: color }),
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