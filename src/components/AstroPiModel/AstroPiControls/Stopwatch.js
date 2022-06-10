import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useStopwatch } from 'react-timer-hook';

const Stopwatch = () => {
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const {
    seconds,
    minutes,
    pause,
    reset
  } = useStopwatch({ autoStart: false })

  useEffect(() => {
    codeRunTriggered ? reset() : pause()
  }, [codeRunTriggered])


  return (
    <div>
      <span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
    </div>
  )
}

export default Stopwatch
