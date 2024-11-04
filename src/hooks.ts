export const useVibrate = () => {
  if ( typeof window.navigator.vibrate === 'function' ) {
    return window.navigator.vibrate
  } else {
    return (duration: number) : void => { console.log(`Can't vibrate ${duration}ms. Vibration not supported`) }
  }
}