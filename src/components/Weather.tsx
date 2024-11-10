import { useEffect, useState } from "react"

interface WeatherProps {
  className?: string
}

const Weather: React.FC<WeatherProps> = ({ className = '' }) => {

  const [weather, setWeather] = useState({
    current: {
      temperature_2m: 0,
      relative_humidity_2m: 0
    }
  })
  const [status, setStatus] = useState('default')

  function getWeather(){
    setStatus('loading')
    fetch("https://api.open-meteo.com/v1/forecast?latitude=9.004831&longitude=79.579566&current=temperature_2m,relative_humidity_2m&timeformat=unixtime")
      .then(res => res.json())
      .then(data => {
        setWeather(data)
      })
      .finally(() => {
        setStatus('default')
      })
  }

  useEffect(() => {
    getWeather()
    setInterval(() => {
      getWeather()
    }, 1000 * 60 * 30 )
  }, [])

  return (
    <div className={`
      flex flex-col items-end font-extralight transition-all duration-500
      ${status === 'loading' ? 'opacity-0' : 'opacity-100'} 
      ${className}
      `}>
      <span>Currently</span>
      <span>
        {weather.current.temperature_2m}C
      </span>
      <span className="flex items-end">
        <svg className="-translate-y-4 size-4" viewBox="0 -2 13 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12.2704C0 15.9873 2.86827 19 6.40309 19C9.93909 19 13 15.9873 13 12.2704C13 8.55475 6.40309 0 6.40309 0C6.40309 0 0 8.55475 0 12.2704Z" stroke="currentColor" strokeWidth={"3"} fill="none"/>
        </svg>
        {weather.current.relative_humidity_2m}%
      </span>
    </div>
  )
}

export default Weather