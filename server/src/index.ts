import express from "express"
import { Server, Socket } from "socket.io"

const app = express();
const io = new Server()

app.use(express.json());


io.on("connection",(socket: Socket)=>{
    console.log("new user Joined");
})


app.listen(3000,()=>{
    console.log(`App Listening on Port 3000`);
})
io.listen(8080);