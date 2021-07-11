import './App.css';
import {useEffect, useMemo, useRef, useState} from "react";
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import Button from '@material-ui/core/Button';
import {TextField} from "@material-ui/core";

const BASE_URL = "http://localhost:8080";

function App()
{
    const stompClient = useRef();
    const [msgs, setMsgs] = useState([]);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if (!stompClient.current)
        {
            console.log("STOMP client resolved to null, connecting...")
            stompClient.current = initializeStompClient()
            connect()
        }
        else if (!stompClient.current.connected)
        {
            console.log("Connection lost, connecting again...")
            connect()
        }
    }, [])

    function connect()
    {
        if (!stompClient.current) return
        stompClient.current.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            stompClient.current.subscribe(`/topic/messages`, message => {
                console.log("Received message: " + JSON.parse(message.body).content);
                setMsgs(prevMsgs => [...prevMsgs, JSON.parse(message.body)]);
            });
        });
    }

    function initializeStompClient()
    {
        const URL = BASE_URL + '/chat';
        console.log("Initializing STOMP client on url: " + URL)
        const socket = new SockJS(URL);
        return Stomp.over(socket);
    }

    function sendMessage()
    {
        console.log("sending message");
        stompClient.current.send(/*BASE_URL +*/ "/ws/message", {}, JSON.stringify({'content': msg}));
    }

    let list = useMemo(() => {
        let msgsList = !msgs ? [] : msgs.map((msg, i) => {
            return <div key={i}> {msg.content}</div>;
        });
        console.log("List for rendering is: " + msgsList)
        return msgsList;
    }, [msgs]);

    return (
        <div className="App">
            <div id={"container"}>
                <div id={"sendMessagePanel"}>
                    <TextField value={msg}
                               label="Message"
                               variant="filled"
                               color="primary"
                               onChange={e => setMsg(e.target.value)}
                    />
                    <Button id={"msgBtn"}
                            onClick={event => sendMessage()}
                            variant="contained"
                            size="small"
                            color="primary">
                        Send message
                    </Button>
                </div>
                    <div id="msgsListDiv">
                    {list}
                </div>
            </div>
        </div>
    );
}

export default App;
