import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"

function Room() {
    const [searchParams, setSearchParams] = useSearchParams()
    const name = searchParams.get('roomName')
    useEffect(() => {
        //logic to init user to the room
        return () => {
            
        };
    }, [name]);
  return (
    <div>
        hi {name}
    </div>
  )
}

export default Room