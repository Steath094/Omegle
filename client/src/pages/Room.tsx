import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io, type Socket } from "socket.io-client";

const URL = "https://omegle-bsbe.onrender.com";

function Room({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack;
  localVideoTrack: MediaStreamTrack;
}) {
    //@ts-ignore
  const [searchParams, setSearchParams] = useSearchParams();
  //@ts-ignore
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState(true);
  //@ts-ignore
  const [sendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null);
  //@ts-ignore
  const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null);
  //@ts-ignore
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
  //@ts-ignore
  const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
  //@ts-ignore
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // connect socket
    const socket = io(URL);

    socket.on("send-offer", async ({ roomId }) => {
      setLobby(false);
      const pc = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
      });
      setSendingPc(pc);

      pc.addTrack(localAudioTrack);
      pc.addTrack(localVideoTrack);

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            roomId,
            type: "sender",
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        const sdp = await pc.createOffer();
        //@ts-ignore
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);

      const sdp = await pc.createAnswer();
      //@ts-ignore
      pc.setLocalDescription(sdp);

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);

      setReceivingPc(pc);

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            roomId,
            type: "reciever",
          });
        }
      };

      pc.ontrack = ({ track }) => {
        //@ts-ignore
        remoteVideoRef.current?.srcObject?.addTrack(track);
        remoteVideoRef.current?.play();
      };

      socket.emit("answer", {
        sdp,
        roomId,
      });

      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;
        if (track1.kind == "video") {
          setRemoteAudioTrack(track2);
          setRemoteVideoTrack(track1);
        } else {
          setRemoteAudioTrack(track1);
          setRemoteVideoTrack(track2);
        }
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1);
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track2);
        //@ts-ignore
        remoteVideoRef.current.play();
      }, 3000);
    });
    //@ts-ignore
    socket.on("answer", ({ roomId, sdp }) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(sdp);
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type == "sender") {
        setReceivingPc((pc) => {
          if (pc?.remoteDescription != null) {
            pc?.addIceCandidate(candidate);
          }
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          if (pc?.remoteDescription != null) {
            pc?.addIceCandidate(candidate);
          }
          return pc;
        });
      }
    });

    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      localVideoRef.current.play();
    }
  }, [localVideoRef]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h2 className="text-xl font-semibold mb-4">You are {name}</h2>

      {/* Local Video */}
      <div className="w-[600px] aspect-video bg-black rounded-lg overflow-hidden mb-6">
        <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
      </div>

      {/* Remote Video OR Waiting */}
      <div className="w-[600px] aspect-video bg-black rounded-lg flex items-center justify-center overflow-hidden">
        {lobby ? (
          <p className="text-gray-400 text-lg">Waiting for someone else...</p>
        ) : (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        )}
      </div>
    </div>
  );
}

export default Room;
