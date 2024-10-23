import { APP_URL } from "../constants";
import { RoomInterface } from "../types";

export const rooms: RoomInterface[] = [
  {
    id: 1,
    name: "Living Room",
    endpoint: APP_URL,
    temperature: 0,
    humidity: 0,
    connected: true,
    thermostat: {
      on: false,
      temperature: 26,
      speed: 1,
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
  //     speed: 3,
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
  //     speed: 1,
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
  //     speed: 2,
  //   }
  // },
]
