import { useEffect } from "react"
import { useRoomStore } from "~/store/store"
import { RoomInterface } from "~/utils/types"
import DateTime from "~/components/DateTime"
import Room from "~/components/Room"
// import Weather from "~/components/Weather"

/**
 * @param {Date} [date] - Date to calculate the color for, or today if not given
 * @returns {string} - The color as an HSL string
 *
 * Calculates the background color of the app based on the time of day.
 * The color is a gradient from red in the morning to blue in the evening.
 * The gradient is interpolated linearly over the 24 hour period.
 */
function getAppColor(date?: Date) : string {
  const d = date || new Date()
  const decimalMinutes = d.getMinutes() / 60
  const decimalHours = d.getHours() + decimalMinutes
  const hue = Math.floor((decimalHours / 24) * 360)
  return `hsl(${hue.toString()}, 70%, 85%)`
}

function updateAppColor() {
  const appColor = getAppColor()
  document.documentElement.style.backgroundColor = appColor
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  // @ts-expect-error The meta tag should always exist
  if ( metaThemeColor ) metaThemeColor.content = appColor
  return appColor
}

const App: React.FC = () => {

  const setAppColor = useRoomStore(state => state.setAppColor)
  // const appColor = useRoomStore(state => state.appColor)
  const rooms = useRoomStore( state => state.rooms as RoomInterface[] )
  const activeRoom = useRoomStore( state => state.activeRoom )

  useEffect(() => {    
    const color = updateAppColor()
    setAppColor(color)
    const interval = setInterval(() => {
      updateAppColor()
      setAppColor(color)
    }, 1000 * 60 * 5)
    return () => clearInterval(interval)
  }, [setAppColor])

  return (
    <div className={`flex flex-col relative w-dvh h-dvh`}>
      <nav className="flex flex-col px-6 text-4xl">
        <div className={`
            flex items-center
            overflow-hidden 
            transition-all
            duration-500
            ${ activeRoom ? 'h-0' : 'h-20' } 
          `}>
          <strong className="font-bold text-3xl tracking-tight leading-relaxed">Climate Control</strong>
          <svg className="ml-auto size-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
          </svg>
        </div>
        <DateTime className={`
          overflow-hidden 
          transition-all
          duration-500
          ${ activeRoom ? 'h-0' : 'h-36' } 
          `} />
        {/* <Weather /> */}
      </nav>
      <div className={`flex flex-col justify-end gap-2 relative grow p-6`}>
        { rooms.map((room: RoomInterface, r: number) => (
          <Room key={room.name} 
            row={Math.floor(r/2)} 
            column={r % 2} {...room} 
            active={ activeRoom?.id === room.id } 
            className={`${ activeRoom ? activeRoom.id === room.id ? 'opacity-100 z-10' : 'opacity-0' : 'opacity-100' }`}
            />
        ) ) }
      </div>
    </div>
  )
}

export default App