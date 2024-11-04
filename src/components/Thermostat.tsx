import React, { useEffect, useRef, useState } from "react"
import { ThermostatInterface } from "~/utils/types"
import { MAJOR_THERMOSTAT_STEP_DEG, MIN_TEMP } from "~/utils/constants"

function degreesToTemp(degree: number) {
  return degree / MAJOR_THERMOSTAT_STEP_DEG + MIN_TEMP
}
function tempToDegrees(temp: number) {
  return (temp - MIN_TEMP) * MAJOR_THERMOSTAT_STEP_DEG
}

interface ThermostatProps {
  className?: string
  active?: boolean,
  thermostat: ThermostatInterface
  onSetTemperature: (temperature: number) => void
}
const Thermostat: React.FC<ThermostatProps> = ({ className, active, thermostat, onSetTemperature }) => {

  const dialTrackRef = useRef<SVGGElement>(null)

  const [touchY, setTouchY] = useState(0)
  const [rotation, setRotation] = useState(tempToDegrees(thermostat.temperature))
  const [moving, setMoving] = useState(false)
  const [roundedDegree, setRoundedDegree] = useState(tempToDegrees(thermostat.temperature))
  const [minorRoundedTemp, setMinorRoundedTemp] = useState(tempToDegrees(thermostat.temperature))
  
  function handleDialTouchStart(e: React.TouchEvent<SVGSVGElement> ) {
    if ( ! active ) return
    setTouchY(e.touches[0].clientY)
  }

  function handleDialTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    if ( ! active ) return
    setMoving(true)
    const deltaY = e.touches[0].clientY - touchY
    const __rotation = rotation + (deltaY * 0.17)
    setRotation( __rotation)
    setTouchY(e.touches[0].clientY)
  }

  function handleDialTouchEnd() {
    if ( ! active ) return
    setMoving(false)
    if ( dialTrackRef.current ) {
      dialTrackRef.current.classList.add('transition-all')
      setTimeout(() => {
        dialTrackRef.current?.classList.remove('transition-all')
      }, 200)
    }
    onSetTemperature(degreesToTemp(roundedDegree))
    setRotation(roundedDegree)
  }

  useEffect(() => {
    const __roundedDegree = Math.round(rotation / 15) * 15
    if (roundedDegree !== __roundedDegree) {
      setRoundedDegree(__roundedDegree)
    }
    
    const __minorRoundedTemp = Math.round(rotation / 3) * 3
    if (minorRoundedTemp !== __minorRoundedTemp) {
      if ( typeof window.navigator.vibrate === 'function' ) {
        window.navigator.vibrate(10)
      }
      setMinorRoundedTemp(__minorRoundedTemp)
    }

  }, [rotation, roundedDegree, minorRoundedTemp])

  return (
    <div className={className}>
     
      <div 
        data-elem="STATUS" 
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          h-24
          flex flex-col justify-between items-center
          text-center font-black text-sm
          transition-all
          ${ active ? 'opacity-0 pointer-events-none' : ( thermostat.on ? 'opacity-100' : 'opacity-30' ) }
        `}
        >
        <span className="relative inline-block">{ thermostat.temperature }<span className="absolute left-full top-0">&deg;</span></span>
        <span>{ thermostat.on ? 'Auto' : "Off" }</span>
      </div>

      <div 
        data-elem="FAN" 
        className={`
          absolute top-1/2 -translate-y-1/2 transition-all duration-500 
          ${ active ? 'left-4 translate-x-0' : 'left-1/2 -translate-x-1/2' }
        `}
        >
        <svg 
          className={`
            transition-all 
            ${active ? 'w-20 h-20' : 'w-12 h-12'} 
            ${thermostat.on ? 'animate-spin-slow' : ''}
          `} 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          >
          <path className="transition-all duration-500" d="M6.82616 37.5623C6.02784 38.1459 4.89961 37.9078 4.40512 37.0514L2.92027 34.4798C2.42579 33.6235 2.7837 32.5275 3.68831 32.128L19.9114 24.9632C20.4901 24.7076 21.1685 24.9292 21.485 25.477C21.8013 26.025 21.654 26.7232 21.1432 27.0965L6.82616 37.5623Z" fill={ thermostat.on ? "black" : "transparent" } stroke={ thermostat.on ? "transparent" : "black" } strokeWidth="1.5"/>
          <path className="transition-all duration-500" d="M44.3116 32.1284C45.2162 32.5279 45.5742 33.6239 45.0797 34.4804L43.5948 37.0519C43.1004 37.9082 41.9721 38.1463 41.1738 37.5628L26.8567 27.097C26.346 26.7237 26.1986 26.0254 26.515 25.4776C26.8314 24.9296 27.5098 24.7081 28.0885 24.9637L44.3116 32.1284Z" fill={ thermostat.on ? "black" : "transparent" } stroke={ thermostat.on ? "transparent" : "black" } strokeWidth="1.5"/>
          <path className="transition-all duration-500" d="M20.8624 2.3827C20.7561 1.39953 21.5264 0.541513 22.5153 0.541513L25.4847 0.541504C26.4736 0.541504 27.2439 1.39952 27.1376 2.38269L25.2318 20.0124C25.1637 20.6414 24.6327 21.1181 24 21.1181C23.3673 21.1181 22.8363 20.6414 22.7683 20.0124L20.8624 2.3827Z" fill={ thermostat.on ? "black" : "transparent" } stroke={ thermostat.on ? "transparent" : "black" } strokeWidth="1.5"/>
          <circle cx="24" cy="24" r="24" stroke="black" strokeWidth="1" strokeOpacity="0"/>
        </svg>
        {/* <strong className="absolute top-1/2 left-full -translate-y-1/2">{thermostat.temperature}</strong> */}
      </div>
          
      <svg 
        data-elem="DIAL"
        viewBox="20 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        onTouchStart={handleDialTouchStart} 
        onTouchMove={handleDialTouchMove} 
        onTouchEnd={handleDialTouchEnd}
        className={`
          absolute top-1/2 -translate-y-1/2
          aspect-square h-auto 
          transition-all duration-500 
          ${ active ? "right-0 w-[240dvw]" : "right-[20%] w-3/5" }
        `}
        >
        {/* <line x1="0" y1="500" x2="1000" y2="500" stroke="black" strokeWidth="1"/>
        <line x1="500" y1="0" x2="500" y2="1000" stroke="black" strokeWidth="1"/> */}
        <circle 
          data-elem="DIAL.TICKS.MINOR" 
          className="transition-all duration-500" 
          cx="500" cy="500" r="430" 
          fill="none" stroke="black" 
          strokeOpacity={ active ? '0.2' : '0'} 
          strokeWidth="140" 
          strokeDasharray="1 21.515"
          />
        <path d={[
          `M`,
          `770 500`,
          `L 770 490`,
          `Q 770 470 790 470`,
          `L 1022 445`,
          `L 1022 555`,
          `L 790 530`,
          `Q 770 530 770 510`,
          `Z`
          ].join(' ')} 
          fill="none"
          stroke="black" 
          strokeWidth="1" 
          className={`transition-all ${ active ? 'opacity-100' : 'opacity-0 translate-x-4' }`}
          />
        <g 
          ref={dialTrackRef}
          className={ !active && thermostat.on ? "animate-spin-ambient" : "" } 
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }} 
          >
          <g className={`translate-x-1/2 translate-y-1/2 ${ active ? 'opacity-100' : 'opacity-0' }`}>
            { [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34].map( (temp, t) => (
              <text key={t}
                x={0} y={0}
                className={`font-black transition-all ${ !moving && thermostat.temperature === temp ? 'text-3xl' : 'text-base' }`}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ transformOrigin: '-345px 0', transform: `translateX(345px) rotate(${t * -15}deg)` }}
                >{temp}&deg;</text>
            ) ) }
          </g>
          <circle 
            data-elem="DIAL.TICKS.MAJOR" 
            className="transition-all duration-500" 
            cx="500" cy="500" r="430" 
            fill="none" stroke="black" 
            strokeOpacity={1} 
            strokeWidth={ active || thermostat.on ? 140 : 80 } 
            strokeDasharray="4 108.6"
            />
        </g>
      </svg>

      {/* <code onClick={() => setRotation(0)} className="absolute top-0 right-0">{roundedDegree}, {rotation.toFixed(2)}</code> */}
    </div>
  )
}

export default Thermostat