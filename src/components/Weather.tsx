import { useEffect, useState } from "react"

interface WeatherProps {
  className?: string
}

const Weather: React.FC<WeatherProps> = ({ className }) => {

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
      flex items-center gap-2 text-xs font-bold transition-all
      ${status === 'loading' ? 'opacity-0 -translate-x-1/2' : 'opacity-100'} 
      ${className}
      `}>
      <svg className="w-6 h-6" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <g id="SVGRepo_iconCarrier">
          <path d="M90.61,306.85A16.07,16.07,0,0,0,104,293.6C116.09,220.17,169.63,176,232,176c57.93,0,96.62,37.75,112.2,77.74a15.84,15.84,0,0,0,12.2,9.87c50,8.15,91.6,41.54,91.6,99.59C448,422.6,399.4,464,340,464H106c-49.5,0-90-24.7-90-79.2C16,336.33,54.67,312.58,90.61,306.85Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32px"></path>
          <path d="M384.8,271.4a80,80,0,1,0-123.55-92" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></path>
          <line x1="464" y1="208" x2="496" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
          <line x1="336" y1="48" x2="336" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
          <line x1="222.86" y1="94.86" x2="245.49" y2="117.49" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
          <line x1="449.14" y1="94.86" x2="426.51" y2="117.49" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></line>
        </g>
      </svg>
      <span className="flex items-center">
        {weather.current.temperature_2m}&deg; 
        <span className="opacity-30 mx-1">|</span> 
        <svg className="mr-1" width={10} height={10} viewBox="0 0 13 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 12.2704C0 15.9873 2.86827 19 6.40309 19C9.93909 19 13 15.9873 13 12.2704C13 8.55475 6.40309 0 6.40309 0C6.40309 0 0 8.55475 0 12.2704Z" fill="currentColor"/>
        </svg>
        {weather.current.relative_humidity_2m}%
      </span>
    </div>
  )
}

export default Weather