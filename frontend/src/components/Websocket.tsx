import { useEffect } from 'react';

const WebSocketComponent = () => {
    useEffect(() => {
        const socket = new WebSocket('ws://raspberry_pi_ip_address:8765');

        socket.onopen = () => {
            console.log('WebSocket connection established.');
        };

        socket.onmessage = (event) => {
            console.log('Received message:', event.data);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };

        // Clean up WebSocket connection when component unmounts
        return () => {
            socket.close();
        };
    }, []);

    return (
        <div>WebSocket Component</div>
    );
};

export default WebSocketComponent;