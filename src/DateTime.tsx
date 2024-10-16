import React, { useState, useEffect } from 'react'

interface DateTimeProps {
  className?: string
}
const DateTime: React.FC<DateTimeProps> = ({ className }) => {
  
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getWeekday = (date: Date) => {
    return date.toLocaleString('en-US', { weekday: 'short' })
  }

  const getMonth = (date: Date) => {
    return date.toLocaleString('en-US', { month: 'short' })
  }

  const getDay = (date: Date) => {
    return date.getDate()
  }

  const getHour = (date: Date) => {
    return date.getHours().toString().padStart(2, '0') // 24-hour format
  }

  const getMinute = (date: Date) => {
    return date.getMinutes().toString().padStart(2, '0')
  }
  
  return (
    <span className={`flex gap-2 ${className}`}>
      <span>{ getWeekday(currentTime) }</span>
      <span>{ getMonth(currentTime) }</span>
      <span>{ getDay(currentTime) }</span>
      <span>{ getHour(currentTime) }<span className="transition-all duration-500" style={{ opacity: currentTime.getSeconds() % 2 === 0 ? 1 : 0.5 }}>:</span>{ getMinute(currentTime) }</span>
    </span>
  )
}

export default DateTime