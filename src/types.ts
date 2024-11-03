export interface ThermostatInterface {
  on: boolean,
  temperature: number,
}

export interface RoomInterface {
  id: string|number,
  name: string,
  endpoint: string,
  temperature: number,
  humidity: number,
  connected: boolean,
  cpu_temp: number,
  memory_used: number,
  thermostat: ThermostatInterface
}