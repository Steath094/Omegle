import { useEffect, useRef, useState } from "react";
import Room from "./Room";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

function Landing() {
  const nameRef = useRef<HTMLInputElement>(null);
  const [joined, setJoined] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const getCam = async () => {
    try {
      const streams = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = streams.getVideoTracks()[0];
      const audioTrack = streams.getAudioTracks()[0];

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([videoTrack]);
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  useEffect(() => {
    getCam();
  }, []);

  useEffect(() => {
    if (localAudioTrack) {
      localAudioTrack.enabled = micOn;
    }
  }, [micOn, localAudioTrack]);

  useEffect(() => {
    if (localVideoTrack) {
      localVideoTrack.enabled = camOn;
      if (videoRef.current) {
        videoRef.current.srcObject = camOn ? new MediaStream([localVideoTrack]) : null;
      }
    }
  }, [camOn, localVideoTrack]);

  if (!joined) {
    return (
      <div className="h-screen flex bg-white">
        {/* LEFT side */}
        <div className="flex-1 flex items-center justify-center bg-black p-6">
          <div className="relative w-full max-w-3xl h-[420px] bg-[#202124] rounded-xl overflow-hidden shadow-lg">
            <video
              autoPlay
              muted
              ref={videoRef}
              className="w-full h-full object-cover rounded-xl"
            />
            {!camOn && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-lg">
                Camera is off
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 w-full flex justify-center space-x-4">
              <button
                onClick={() => setMicOn((prev) => !prev)}
                className={`w-12 h-12 flex items-center justify-center rounded-full ${
                  micOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600"
                } text-white`}
              >
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={() => setCamOn((prev) => !prev)}
                className={`w-12 h-12 flex items-center justify-center rounded-full ${
                  camOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600"
                } text-white`}
              >
                {camOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT side */}
        <div className="w-[380px] flex flex-col justify-center px-10 space-y-6 border-l">
          <h1 className="text-xl font-medium text-gray-900">Omegle Meet</h1>
          <p className="text-gray-600">Someone is in this call</p>

          <input
            ref={nameRef}
            type="text"
            placeholder="Enter your name"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <div className="flex space-x-3">
            <button
              onClick={() => setJoined(true)}
              className="flex-1 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 font-medium"
            >
              Join now
            </button>
            <button className="flex-1 py-3 border rounded-full text-gray-700 hover:bg-gray-100 font-medium">
              Present
            </button>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p className="text-gray-500">Other options</p>
            <button className="text-blue-600 hover:underline">
              Join and use a phone for audio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Room
      name={nameRef.current?.value!}
      localAudioTrack={localAudioTrack!}
      localVideoTrack={localVideoTrack!}
    />
  );
}

export default Landing;
