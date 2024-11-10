import { useCallback, useEffect, useState } from "react"
import { useRoomStore } from "~/store/store"
import Thermostat from "~/components/Thermostat"
import {RoomInterface} from "~/utils/types"
import PowerToggle from "~/components/PowerToggle"

interface RoomProps {
  className?: string
  active?: boolean
  row: number
  column: number
}

const Room: React.FC<RoomProps & RoomInterface> = ({ className, active, row, column, id, name, temperature, humidity, thermostat, endpoint }) => {
  
  const updateRoom = useRoomStore(state => state.updateRoom)
  const setActiveRoom = useRoomStore(state => state.setActiveRoom)
  
  const [status, setStatus] = useState('default')
  const [, setSyncStamp] = useState('')
  const [touchStartTime, setTouchStartTime] = useState(0)
  const tapMax = 300

  const style: React.CSSProperties = {
    height: 'auto', //'50%',
    transform: `translate3d(${100 * column}%, ${100 * row}%, 0)`,  
  }
  
  if ( active ) {
    style.height = '100%'
    style.transform = `translate3d(${0}%, ${0}%, 0)` 
  }
  
  function handleTouchStart() {
    if ( active ) {
        return
    }
    setTouchStartTime(new Date().getTime())
  }
  
  function handleTouchEnd() {
    if ( active ) {
      return
    }
    const touchDuration = new Date().getTime() - touchStartTime
    if ( touchDuration < tapMax ) {
      setActiveRoom(id)
      if ( typeof window.navigator.vibrate === 'function' ) {
        window.navigator.vibrate(10)
      }
    }
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
          console.error(error || sensor_error)
          console.log("There was an error getting the room status. Trying again...")
          setTimeout(() => syncStatus(), 1000)
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
      className={`
        relative top-0 left-0
        width-full h-auto rounded-2xl 
        transition-all 
        duration-500 
        overflow-hidden
        ${ active ? 'aspect-auto' : 'aspect-square bg-black/5' }
        ${className || ''}
      `} 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={style}
      >
      
      <div className={`absolute top-4 left-4 right-4 z-10 flex items-center transition-all`}>
        <span className={`transition-all flex items-center font-bold leading-none tracking-tight whitespace-nowrap ${ active ? 'text-3xl' : 'text-lg' }`}>
          {name}
        </span>
        <span className="ml-auto"
          onTouchStart={(e) => { e.stopPropagation() } }
          onTouchEnd={(e) => { e.stopPropagation(); syncStatus() }}
          >
          <svg className={`block size-6 ${ status === 'syncing' ? 'animate-spin' : '' }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </span>
      </div>

      <div className={`
        absolute right-0 left-0 
        overflow-hidden 
        transition-all 
        border-y-2 
        ${ active ? 'top-16 bottom-28 border-black' : 'top-0 bottom-0 border-transparent' }
        `}>
        <Thermostat 
          active={active} 
          thermostat={thermostat} 
          className="absolute inset-0" 
          onSetTemperature={setTemperature}
          />
      </div>

      <div className={`absolute bottom-4 left-4 right-4 flex items-end gap-2 transition-all`}>
        
        <div className={`flex flex-col gap-3 ${ !temperature || !humidity ? 'opacity-30' : ''}`}>
          <span className="relative font-extralight leading-[0.7] text-7xl order-1">
            { temperature || '0' }&deg; 
          </span>
          <span className={`relative flex items-end text-xs font-bold leading-[0.7]`}>
            <svg className="size-[0.6rem]" viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 12.2704C0 15.9873 2.86827 19 6.40309 19C9.93909 19 13 15.9873 13 12.2704C13 8.55475 6.40309 0 6.40309 0C6.40309 0 0 8.55475 0 12.2704Z" fill="black"/>
            </svg>
            <span>{ humidity || '0' }%</span>
          </span>
        </div>

        <PowerToggle
          on={thermostat.on}
          onTap={() => setPower(!thermostat.on)}
          className={`
            ml-auto
            transition-all
            duration-500
            ${ active ? 'opacity-100' : 'opacity-0 pointer-events-none' }
          `}
          />
        
        {/* <div className="flex flex-col gap-1 ml-auto text-right">
          <span className="text-xs leading-none"><strong className="font-bold">cpu:</strong> {cpu_temp}&deg;</span>
          <span className="text-xs leading-none"><strong className="font-bold">mem:</strong> {memory_used}%</span>
          <span className="text-xs leading-none">{syncStamp}</span>
        </div> */}

      </div>

    </div>
  )
}

export default Room