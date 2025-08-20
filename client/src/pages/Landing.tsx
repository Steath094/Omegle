import { useRef, type MouseEvent } from "react"
import { useNavigate } from "react-router-dom";

function Landing() {
  const nameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const handleRoomJoin = (e:MouseEvent) => {
    e.preventDefault();
    navigate(`/room/?roomName=${nameRef.current?.value}`)
  }
  return (
    <div>
      <input ref={nameRef} type="text" />

      <button onClick={handleRoomJoin}>Join Room</button>
    </div>
  )
}

export default Landing