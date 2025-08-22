import { useEffect, useRef, useState, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom";
import Room from "./Room";

function Landing() {
  const nameRef = useRef<HTMLInputElement>(null);
  const [joined, setJoined] = useState(false)
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getCam = async ()=>{
    const streams = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    const videoTracks = streams.getVideoTracks()[0]
    const audioTracks = streams.getAudioTracks()[0]
    setLocalAudioTrack(audioTracks)
    setlocalVideoTrack(videoTracks)
    if (!videoRef.current) {
      return
    }
    videoRef.current.srcObject = new MediaStream([videoTracks]) 

  }
  useEffect(()=>{
    if (videoRef && videoRef.current) {
      getCam();
    }
  },[])



  if (!joined) {
    return (
    <div>
      <video autoPlay ref={videoRef}></video>
      <input ref={nameRef} type="text" />

      <button onClick={()=>{
        setJoined(true)
      }}>Join Room</button>
    </div>
    )  
  }
  return (
    <Room name={nameRef.current?.value!} localAudioTrack={localAudioTrack!} localVideoTrack={localVideoTrack!} />
  )
}

export default Landing