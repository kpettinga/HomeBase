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

const Room: React.FC<RoomProps & RoomInterface> = ({ className, active, row, column, id, name, temperature, humidity, thermostat, cpu_temp, memory_used, endpoint }) => {
  
  const updateRoom = useRoomStore(state => state.updateRoom)
  const setActiveRoom = useRoomStore(state => state.setActiveRoom)
  
  const [status, setStatus] = useState('default')
  const [syncStamp, setSyncStamp] = useState('')
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
        setSyncStamp(new Date().toLocaleTimeString())
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
        setSyncStamp(new Date().toLocaleTimeString())
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
        absolute left-0 
        w-full h-auto aspect-square
        overflow-hidden rounded-2xl 
        transition-all duration-500
        ${ active ? 'top-16 bg-[rgba(0,0,0,0.03)] shadow-[inset_0_0_0.25em_0_#00000077]' : 'top-0' }
        `}>
        <Thermostat 
          active={active} 
          thermostat={thermostat} 
          className="absolute inset-0" 
          onSetTemperature={setTemperature}
          />
      </div>
      
      <div className={`absolute bottom-4 left-4 right-4 flex flex-col transition-all duration-500`}>
        
        <div className={`flex items-end ${ !temperature || !humidity ? 'animate-pulse' : ''}`}>
          <span className="relative font-extralight leading-[0.7] text-7xl">
            { temperature || '0' }&deg; 
          </span>
          <span className={`relative flex items-end text-xs font-bold leading-[0.7]`}>
            <svg className="size-[0.6rem]" viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 12.2704C0 15.9873 2.86827 19 6.40309 19C9.93909 19 13 15.9873 13 12.2704C13 8.55475 6.40309 0 6.40309 0C6.40309 0 0 8.55475 0 12.2704Z" fill="black"/>
            </svg>
            <span>{ humidity || '0' }%</span>
          </span>
          <div className="flex flex-col gap-1 ml-auto text-right">
            <span className="text-xs leading-none"><strong className="font-bold">cpu:</strong> {cpu_temp}&deg;</span>
            <span className="text-xs leading-none"><strong className="font-bold">mem:</strong> {memory_used}%</span>
            <span className="text-xs leading-none"><strong className="font-bold">updated:</strong> {syncStamp || 'syncing'}</span>
          </div>
        </div>

        <div className={`
          flex gap-4 transition-all duration-500
          ${ active ? 'opacity-100 h-16 mt-4' : 'opacity-0 h-0 mt-0 pointer-events-none translate-y-full' }
          `}>
          <button className="button button-outline w-1/2 h-16">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077 1.41-.513m14.095-5.13 1.41-.513M5.106 17.785l1.15-.964m11.49-9.642 1.149-.964M7.501 19.795l.75-1.3m7.5-12.99.75-1.3m-6.063 16.658.26-1.477m2.605-14.772.26-1.477m0 17.726-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205 12 12m6.894 5.785-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
            </svg>
            <span>Settings</span>
          </button>
          <PowerToggle
            on={thermostat.on}
            onTap={() => setPower(!thermostat.on)}
            className={`
              
              transition-all duration-500
              ${ active ? 'opacity-100' : 'opacity-0 pointer-events-none' }
            `}
            />
        </div>

        <div className={`
          flex gap-4 transition-all duration-500
          ${ active ? 'opacity-100 h-16' : 'opacity-0 h-0 pointer-events-none translate-y-full' }
          `}>
          <button 
            className={`button button-outline w-full h-16 mt-4`}
            onClick={() => setActiveRoom(null)}
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>

      </div>

    </div>
  )
}

export default Room