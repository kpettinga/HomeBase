export interface ThermostatInterface {
  on: boolean,
  temperature: number,
  speed:number,
}

export interface RoomInterface {
  id: string|number,
  name: string,
  endpoint: string,
  temperature: number,
  humidity: number,
  connected: boolean,
  thermostat: ThermostatInterface
}