import { useCallback, useEffect, useState } from "react"
import { useRoomStore } from "./store/store"
import Thermostat from "./Thermostat"
import {RoomInterface} from "./types"

interface RoomProps {
  className?: string
  size: 'small' | 'large'
  isActive?: boolean
  row: number
  column: number
}

const Room: React.FC<RoomProps & RoomInterface> = ({ className, size, isActive, row, column, id, name, temperature, humidity, thermostat, endpoint }) => {
  
  const updateRoom = useRoomStore(state => state.updateRoom)
  const setActiveRoom = useRoomStore(state => state.setActiveRoom)
  const [status, setStatus] = useState('default')
  const [timeoutId, setTimeoutId] = useState(0)
  const [, setSyncStamp] = useState('')
  const touchMax = 750

  const style: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 'auto', //'50%',
    aspectRatio: '1 / 1',
    transform: `translate3d(${100 * column}%, ${100 * row}%, 0)`,  
  }
  
  if ( isActive ) {
    style.width = '100%'
    style.height = '100%'
    style.transform = `translate3d(${0}%, ${0}%, 0)` 
  }
  
  function handleTouchStart() {
    if ( isActive ) return
    setStatus('touching')
    setTimeoutId(
      setTimeout(() => {
        setActiveRoom(id)
        navigator.vibrate(10)
      }, touchMax)
    )
  }
  
  function handleTouchEnd() {
    setStatus('default')
    clearTimeout(timeoutId)
  }

  const syncStatus = useCallback(() => {
    setStatus('syncing')
    setSyncStamp(`syncing...`)
    fetch(`${endpoint}/status?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(status => {
        const {
          error, 
          cpu_temp, 
          memory_used, 
          sensor_data: { error: sensor_error, temperature, humidity }, 
          thermostat 
        } = status
        if ( error || sensor_error ) {
          console.warn(error || sensor_error)
          console.warn("There was an error getting the room status. Trying again...")
          // setTimeout(() => syncStatus(), 2000)
          return
        }
        updateRoom(id, { temperature, humidity, cpu_temp, memory_used, thermostat })
        setSyncStamp(new Date().toLocaleString())
      })
      .catch(err => {
        console.error(err)
        // syncStatus()
      })
      .finally(() => {
        setStatus('default')
      })
  }, [endpoint, id, updateRoom])

  function setPower(on: boolean) {
    setStatus('syncing')
    setSyncStamp(`syncing...`)
    const oldOn = thermostat.on
    updateRoom(id, { thermostat : { ...thermostat, on: on } })
    fetch(`${endpoint}/power/${thermostat.temperature}`, {method: 'POST'})
      .then(res => res.json())
      .then(({error}) => {
        if ( error ) {
          setSyncStamp('Response error')
          updateRoom(id, { thermostat : { ...thermostat, on: oldOn } })
          return console.error(error)
        }
        setSyncStamp(new Date().toLocaleString())
      })
      .catch(err => {
        setSyncStamp('Request error')
        updateRoom(id, { thermostat : { ...thermostat, on: oldOn } })
        console.error(err)
      })
      .finally(() => {
        setStatus('default')
      })
  }

  function setTemperature(temperature: number) {
    if ( thermostat.temperature === temperature ) 
        return
    setStatus('syncing')
    setSyncStamp(`syncing...`)
    const oldTemperature = thermostat.temperature
    const oldOn = thermostat.on
    updateRoom(id, { 
      thermostat : { 
        ...thermostat,
        temperature 
      }
    })
    fetch(`${endpoint}/temp/${temperature}`, {method: 'POST'})
      .then(res => res.json())
      .then(({error}) => {
        if ( error ) {
          setSyncStamp('Response error')
          updateRoom(id, { 
            thermostat : { 
              ...thermostat,
              on: oldOn,
              temperature: oldTemperature
            }
          })
          return console.error(error)
        }
        setSyncStamp(new Date().toLocaleString())
      })
      .catch(err => {
        setSyncStamp('Request error')
        updateRoom(id, { 
            thermostat : { 
              ...thermostat,
              on: oldOn,
              temperature: oldTemperature
            }
          })
        console.error(err)
      })
      .finally(() => {
        setStatus('default')
      })
  }

  useEffect(() => {
    syncStatus()
    const intervalId = setInterval(syncStatus, 1000 * 60 * 10)
    return () => clearInterval(intervalId)
  }, [syncStatus])

  return (
    <div 
      className={`relative transition-all duration-500 ${status === 'touching' ? 'bg-black/5' : ''} ${className || ''}`} 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={style}
      >
      
      <div className={`absolute left-6 right-6 z-10 flex items-center transition-all ${ isActive ? 'top-0' : 'top-4' }`}>
        <span className={`transition-all flex items-center font-black leading-none tracking-tight whitespace-nowrap ${ isActive ? 'text-3xl' : 'text-xl' }`}>
          <button 
            className={`
              w-12 h-auto
              -ml-6 mr-2
              py-3 px-2
              bg-black text-white
              flex justify-end 
              transition-all
              ${ isActive ? 'opacity-100 delay-500' : '!w-0 opacity-0 -translate-x-2' }
            `}
            onClick={() => setActiveRoom(null)}
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          {name}
        </span>
        <span className={`
            ml-auto w-3 h-3 rounded-full transition-all
            ${status === 'syncing' ? 'shadow-[inset_0_0_0_3px] animate-ping' : 'shadow-[inset_0_0_0_6px]'}
          `}
          onClick={() => syncStatus()}
        ></span>
      </div>

      <div className={`absolute right-0 left-0 overflow-hidden transition-all border-t-2 border-black ${isActive ? 'top-12 bottom-20 border-b-2' : 'top-0 bottom-0'}`}>
        <Thermostat 
          active={isActive} 
          thermostat={thermostat} 
          className="absolute inset-0" 
          onSetTemperature={setTemperature}
          />
      </div>

      <div className={`absolute bottom-2 left-4 right-4 h-16 flex items-center gap-2 transition-all`}>
        <div className="flex items-end">
          <span className="relative font-black leading-[0.7] text-[55px]">
            {temperature}&deg; 
          </span>
          <span className={`relative flex items-end gap-1 text-base font-black leading-[0.7]`}>
            <svg width={ size === "large" ? "13" : "9" } height={ size === "large" ? "19" : "13" } viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 12.2704C0 15.9873 2.86827 19 6.40309 19C9.93909 19 13 15.9873 13 12.2704C13 8.55475 6.40309 0 6.40309 0C6.40309 0 0 8.55475 0 12.2704Z" fill="black"/>
            </svg>
            <span>{humidity}%</span>
          </span>
        </div>
        <button className={`
            relative flex gap-14 items-center justify-center
            ml-auto w-40 h-14 
            bg-black/10
            rounded-lg
            ${ isActive ? 'opacity-100 transition-all duration-200 delay-500' : 'opacity-0 pointer-events-none translate-x-2' }
          `} 
          onTouchEnd={() => setPower(!thermostat.on)}
          >
          <strong className={`relative z-[1] transition-all ${ thermostat.on ? 'opacity-50' : 'text-white opacity-100' }`}>Off</strong>
          <strong className={`relative z-[1] transition-all ${ thermostat.on ? 'text-white opacity-100' : 'opacity-50' }`}>On</strong>
          <span className={`
            absolute bottom-[2px] left-[2px] 
            bg-black rounded-lg 
            w-[calc(50%-4px)] h-[calc(100%-4px)]
            transition-transform
            ${ thermostat.on ? `translate-x-[calc(100%+4px)]`: 'translate-x-0' }
            `}></span>
        </button>
        {/* <div className="flex flex-col gap-1 ml-auto text-right">
          <span className="text-xs leading-none"><strong className="font-black">cpu:</strong> {cpu_temp}&deg;</span>
          <span className="text-xs leading-none"><strong className="font-black">mem:</strong> {memory_used}%</span>
          <span className="text-xs leading-none">{syncStamp}</span>
        </div> */}
      </div>

    </div>
  )
}

export default Room