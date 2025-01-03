import { APP_URL } from "~/utils/constants";
import { RoomInterface } from "~/utils/types";

export const rooms: RoomInterface[] = [
  {
    id: 1,
    name: "Living Room",
    endpoint: `${APP_URL}/living-room`,
    temperature: 0,
    humidity: 0,
    connected: true,
    cpu_temp: 0,
    memory_used: 0,
    thermostat: {
      on: false,
      temperature: 26,
    }
  },
  // {
  //   id: 2,
  //   name: "Master Bedroom",
  //   endpoint: "",
  //   temperature: 32,
  //   humidity: 76,
  //   connected: true,
  //   thermostat: {
  //     on: true,
  //     temperature: 24,
  //   }
  // },
  // {
  //   id: 3,
  //   name: "Malcolm's Room",
  //   endpoint: "",
  //   temperature: 31,
  //   humidity: 83,
  //   connected: true,
  //   thermostat: {
  //     on: true,
  //     temperature: 24,
  //   }
  // },
  // {
  //   id: 4,
  //   name: "Girl's Room",
  //   endpoint: "",
  //   temperature: 27,
  //   humidity: 75,
  //   connected: true,
  //   thermostat: {
  //     on: false,
  //     temperature: 24,
  //   }
  // },
]
