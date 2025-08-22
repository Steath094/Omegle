import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { io, type Socket } from "socket.io-client";

const URL = "ws://localhost:8080"
function Room({name,localAudioTrack,localVideoTrack}: {name: string,localAudioTrack: MediaStreamTrack,localVideoTrack:MediaStreamTrack}) {
    const [searchParams, setSearchParams] = useSearchParams()
    const [socket,setSocket] = useState<Socket | null>(null);
    const [lobby, setLobby] = useState(true)
    const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream,setRemoteMediaStream] = useState<MediaStream | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        //logic to init user to the room
        const socket = io(URL)
        socket.on("send-offer",async ({roomId})=>{
            setLobby(false)
            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            pc.addTrack(localAudioTrack)
            pc.addTrack(localVideoTrack)
            pc.onicecandidate = (e) =>{
                if (e.candidate) {
                    socket.emit("add-ice-candidate",{
                        candidate: e.candidate,
                        roomId,
                        type : "sender"
                    })
                }
            }
            pc.onnegotiationneeded=async ()=>{
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer",{
                    sdp,
                    roomId
                })
            }
            
        })
        socket.on('offer', async({roomId,sdp:remoteSdp})=>{
            setLobby(false)
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)
            const stream =  new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject= stream;                
            }
            setRemoteMediaStream(stream)
            // trickle ice 
            setReceivingPc(pc);
            pc.onicecandidate = (e) =>{
                if (e.candidate) {
                    socket.emit("add-ice-candidate",{
                        candidate: e.candidate,
                        roomId,
                        type : "reciever"
                    })
                }
            }
            pc.ontrack = ({track,type}) => {
                console.log("track");
                
                if (type === "audio") {
                    // setRemoteAudioTrack(track);
                    //@ts-ignore
                    remoteVideoRef.current.srcObject.addTrack(track)
                } else {
                    //@ts-ignore
                    // setRemoteVideoTrack(track);
                    remoteVideoRef.current.srcObject.addTrack(track)
                }
                remoteVideoRef.current?.play();
            };
            socket.emit("answer",{
                sdp,
                roomId
            })
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;
                if (track1.kind=="video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1);
                }else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2);
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play()
            }, 5000);
        })
        socket.on('answer',({roomId,sdp})=>{
            setLobby(false)
            setSendingPc(pc=>{
                pc?.setRemoteDescription(sdp)
                return pc;
            })

        })
        socket.on("lobby",()=>{
            console.log("lobby");
            
            setLobby(true)
        })
        socket.on("add-ice-candidate",({candidate,type})=>{
            if (type == "sender") {
                setReceivingPc(pc=>{
                    if (pc?.remoteDescription!=null) {
                        pc?.addIceCandidate(candidate)                                                
                    }
                    return pc
                })
            }else{
                setSendingPc(pc=>{
                    if (pc?.remoteDescription!=null) {
                        pc?.addIceCandidate(candidate)                                                
                    }                        
                    return pc
                })
            }
        })
        setSocket(socket)
    }, [name]);
    useEffect(()=>{
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = new MediaStream([localVideoTrack])
            localVideoRef.current.play()
        }
    },[localVideoRef])
    
  return (
    <div>
        hi {name}
        <video width={400} height={400} autoPlay ref={localVideoRef}></video>
        {lobby? "Waiting to connect you to someone": null}
        <video width={400} height={400} autoPlay ref={remoteVideoRef}></video>
    </div>
  )
}

export default Room