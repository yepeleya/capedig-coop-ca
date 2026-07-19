import { useCallback, useRef, useState } from 'react'

/**
 * Enregistrement vocal via l'API MediaRecorder du navigateur.
 * Retourne l'état d'enregistrement, la durée écoulée, et les actions
 * start/stop/cancel. Le blob final est fourni au callback `onDone`.
 */
export function useVoiceRecorder(onDone) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds]     = useState(0)
  const [erreur, setErreur]       = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const streamRef        = useRef(null)
  const timerRef         = useRef(null)
  const cancelledRef     = useRef(false)

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
    chunksRef.current = []
    setRecording(false)
    setSeconds(0)
  }, [])

  const start = useCallback(async () => {
    setErreur('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setErreur("L'enregistrement audio n'est pas supporté par ce navigateur.")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      cancelledRef.current = false

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm' : 'audio/ogg'
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        cleanup()
        if (!cancelledRef.current && blob.size > 0) onDone?.(blob, mimeType)
      }

      recorder.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setErreur('Impossible d\'accéder au microphone. Vérifiez les autorisations du navigateur.')
    }
  }, [cleanup, onDone])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const cancel = useCallback(() => {
    cancelledRef.current = true
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    } else {
      cleanup()
    }
  }, [cleanup])

  return { recording, seconds, erreur, start, stop, cancel }
}
