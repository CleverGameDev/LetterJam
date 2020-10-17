import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import './App.css';
import logo from './logo.svg';
// TODO: For the moment, I've directly copied the files under shared/, since create-react-app has a (reasonable) restriction on importing anything outside of src/
import { E, EType } from "./shared/events";

function App() {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameState, setGameState] = useState({});


  // establish socket connection
  useEffect(() => {
    // TODO: this
    const socket = io('http://localhost:3000')
    // @ts-ignore
    setSocket(socket);
  }, []);

  // subscribe to the socket event
  useEffect(() => {
    if (socket === null) return;

    // @ts-ignore
    socket.on('connect', () => {
      // @ts-ignore
      setSocketConnected(socket.connected);
      // @ts-ignore
      console.log(socket.id);
      // @ts-ignore
      console.log(socket.handshake);
    });

    // @ts-ignore
    socket.on('disconnect', () => {
      // @ts-ignore
      setSocketConnected(socket.connected);
    });

    // @ts-ignore
    socket.on(E.SyncGameState, (data: EType[E.SyncGameState]) => {
      setGameState(data)
    });
  }, [socket]);

  // manage socket connection
  const handleSocketConnection = () => {
    if (socketConnected) {
    // @ts-ignore
      socket.disconnect();
    } else {
    // @ts-ignore
      socket.connect();
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      <div>
        <b>Connection status:</b> {socketConnected ? 'Connected' : 'Disconnected'}
      </div>
      <input
        type="button"
        style={{ marginTop: 10 }}
        value={socketConnected ? 'Disconnect' : 'Connect'}
        onClick={handleSocketConnection} />
      </header>
    </div>
  );
}

export default App;
