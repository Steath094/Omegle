import express from "express"
import { Server, Socket } from "socket.io"
import { UserManager } from "./managers/UserManager.js";

const app = express();
const io = new Server({
    cors: {
        origin: "*"
    }
})

app.use(express.json());

const userManager = new UserManager();
io.on("connection",(socket: Socket)=>{
    console.log("new user Joined");
    userManager.addUser("random",socket)


    socket.on("disconnect",()=>{
        userManager.removeUser(socket.id);
    })
})


app.listen(3000,()=>{
    console.log(`App Listening on Port 3000`);
})
io.listen(8080);