import { useState } from "react"
import { useRoomStore } from "~/store/store"

interface PowerToggleProps {
  className?: string
  on?: boolean
  onTap?: () => void
}
const PowerToggle: React.FC<PowerToggleProps> = ({ 
  className = '', 
  on = false, 
  onTap = () => {} 
}) => {

  const appColor = useRoomStore(state => state.appColor)

  const [touchStartTime, setTouchStartTime] = useState<number>(0)
  const tapMax = 300

  const handleTouchStart = (e: React.TouchEvent) : void => {
    e.stopPropagation()
    setTouchStartTime(new Date().getTime())
  }

  const handleTouchEnd = (e: React.TouchEvent) : void => {
    e.stopPropagation()
    const touchDuration : number = new Date().getTime() - touchStartTime
    if ( touchDuration < tapMax ) {
      onTap()
    }
  }

  return (
    <button className={`
        relative flex gap-14 items-center justify-center
        text-[1rem]
        w-[4.9em] h-[2.65em]
        rounded-full
        shadow-[0_0_0_2px_black]
        ${ on ? 'bg-black' : '' }
        ${className}
      `} 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      >
      <span className={`
        absolute top-[0.25em] left-[0.25em]
        text-[0.75em]
        rounded-full aspect-square w-[3em] h-auto
        transition-transform
        ${ on ? 'text-black' : 'text-white' }
        ${ on ? 'translate-x-full' : '' }
        `}
        style={{ 
          backgroundColor: on ? appColor : 'black',
          color: on ? 'black' : appColor
        }}>
          <strong className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all`}>{ on ? 'On' : 'Off' }</strong>
        </span>
    </button>
  )
}

export default PowerToggle