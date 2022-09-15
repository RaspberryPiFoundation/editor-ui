import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useStopwatch } from 'react-timer-hook';
import Sk from 'skulpt'

const Stopwatch = () => {
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const {
    seconds,
    minutes,
    isRunning,
    pause,
    reset
  } = useStopwatch({ autoStart: false })
  const [hasLostFocus, setHasLostFocus] = useState(false)

  useEffect(() => {
    window.addEventListener('blur', () => {
      setHasLostFocus(true)
    })
  }, [])

  useEffect(() => {
    if (codeRunTriggered && !isRunning) {
      setHasLostFocus(false)
      reset()
    }
    if (!codeRunTriggered && isRunning){
      pause()
      Sk.sense_hat.mz_criteria.duration = hasLostFocus ? null : minutes * 60 + seconds
    }
  }, [codeRunTriggered, hasLostFocus, minutes, seconds, isRunning, pause, reset])


  return (
    <div className='sense-hat-controls-panel__container sense-hat-controls-panel__container-timer'>
      <label className='sense-hat-controls-panel__control-name' htmlFor='sense_hat_timer'>Timer</label>
      <span className='sense-hat-controls-panel__control-reading sense-hat-controls-panel__control-reading-timer' id='sense_hat_timer'>
        <span>{String(minutes).padStart(2, '0')}</span>:<span>{String(seconds).padStart(2, '0')}</span>
      </span>
    </div>
  )
}

export default Stopwatch
