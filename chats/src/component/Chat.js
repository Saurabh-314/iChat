import React, { useEffect, useState } from 'react'
import socketIo from "socket.io-client";
import ReactScrollToBottom from "react-scroll-to-bottom";
import { user } from './Join';
import Message from './Message';
import "./Chat.css";


let socket;
const ENDPOINT = "http://localhost:4500/";

const Chat = () => {
    const [id, setId] = useState("");
    const [messages, setMessages] = useState([]);

    const send = () => {
        const message = document.getElementById('chatInput').value;
        socket.emit("message", { message, id });
        document.getElementById('chatInput').value = "";
    }

    console.log("messages", messages);
    useEffect(() => {
        socket = socketIo(ENDPOINT, { transports: ['websocket'] });

        socket.on('connect', () => {
            setId(socket.id);
        })
        console.log("socket", socket);
        socket.emit('joined', { user })

        return () => {
            // socket.emit('disconnected');
            socket.off();
        }

    }, [])

    useEffect(()=>{
        // set message for users/clien/self
        socket.on('welcome', (data) => {
            console.log("welcome",data)
            setMessages([...messages, data]);
            console.log(data.user, data.message);
        })

        // set message for other users
        socket.on('userJoined', (data) => {
            setMessages([...messages, data]);
            console.log('userJoined',data.user+":"+ data.message);
        })

        socket.on('leave', (data) => {
            setMessages([...messages, data]);
            console.log(data.user, data.message)
        })
        socket.on('sendMessage',(data)=>{
            setMessages([...messages,data]);
            console.log("messages ",data.user,data.message,data.id);
        })
        return()=>{
            // socket.emit('disconnected');
            socket.off();
        }
    },[messages])

    return (
        <div className="chatPage">
            <div className="chatContainer">
                <div className="header">
                    <h2>Chat app</h2>
                </div>
                <ReactScrollToBottom className="chatBox">
                    {messages.map((item, i) => <Message user={item.id === id ? '' : item.user} message={item.message} classs={item.id === id ? 'right' : 'left'} key={i} />)}
                </ReactScrollToBottom>
                <div className="inputBox">
                    <input
                        onKeyPress={(event) => event.key === 'Enter' ? send() : null}
                        type="text"
                        id="chatInput"
                        placeholder='type message'
                    />
                    <button onClick={send} className="sendBtn">send</button>
                </div>
            </div>
        </div>
    )
}

export default Chat