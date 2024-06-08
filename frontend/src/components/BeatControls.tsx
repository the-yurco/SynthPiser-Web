import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaRedo, FaSquare } from 'react-icons/fa';

type Sound = {
  id: number;
  preview: string;
};

type BeatControlsProps = {
  socket: WebSocket | null;
  assignedSounds: { [pin: number]: string | null };
};

const BeatControls = ({ socket, assignedSounds }: BeatControlsProps) => {
  const [timerValue, setTimerValue] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recordedButtons, setRecordedButtons] = useState<{ time: number, pin: number }[]>([]);
  const [axisPosition, setAxisPosition] = useState<number>(0);

  const timerRef = useRef<number | null>(null);
  const audioRefs = useRef<{ [pin: number]: HTMLAudioElement | null }>(
    Object.keys(assignedSounds).reduce((acc, pin) => {
      acc[parseInt(pin)] = null;
      return acc;
    }, {} as { [pin: number]: HTMLAudioElement | null })
  );

  const togglePlayPause = () => {
    console.log(`Toggle Play/Pause: ${!isPlaying ? 'Play' : 'Pause'}`);
    if (!isPlaying) {
      sendMessage('start_recording');
      startTimer();
    } else {
      console.log('sending message : stop_recording');
      sendMessage('stop_recording');
      pauseTimer();
    }
  };

  const sendMessage = (messageType: string) => {
    const message = {
      type: messageType
    };
    if (socket) {
      socket.send(JSON.stringify(message));
    }
  };

  const startTimer = () => {
    console.log('Starting timer...');
    setIsPlaying(true);
    timerRef.current = window.setInterval(() => {
      setTimerValue((prevValue) => {
        const newValue = prevValue + 10;
        if (newValue >= 10000) {
          console.log('Timer reached 10000 ms, stopping timer...');
          pauseTimer();
          setTimerValue(0);
          setAxisPosition(0);
          return 0;
        }
        setAxisPosition(newValue);
        return newValue;
      });
    }, 10);
  };

  const pauseTimer = () => {
    console.log('Pausing timer...');
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopPlayback = () => {
    console.log('Stopping playback...');
    setIsPlaying(false);
    setTimerValue(0);
    setAxisPosition(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sendMessage('stop_recording');
  };

  const resetTimer = () => {
    console.log('Resetting timer...');
    setRecordedButtons([]);
    setTimerValue(0);
    setAxisPosition(0);
  };

  const handleButtonPress = (pin: number) => {
    const currentTime = timerValue;
    console.log(`Button pressed at time: ${currentTime} ms`);
    setRecordedButtons((prevButtons) => [...prevButtons, { time: currentTime, pin }]);
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        console.log('Received message from socket:', event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'button_click' && data.pin) {
          console.log(`Button click received from pin ${data.pin}`);
          handleButtonPress(data.pin);
          socket.send(JSON.stringify({ type: 'button_click', pin: data.pin }));
        }
      };
    }
  }, [socket, timerValue]);

  const formatMilliseconds = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = (ms % 1000).toString().padStart(3, '0');
    return `${seconds}.${milliseconds} s`;
  };

  return (
    <div className="beat-controls">
      <div className="timer-display">
        <span>{formatMilliseconds(timerValue)}</span>
      </div>
      <div className="timer-axis">
        {recordedButtons.map((button, index) => (
          <div
            key={index}
            className="button-indicator"
            style={{ left: `${(button.time / 10000) * 100}%` }}
          ></div>
        ))}
        <div
          className="timer-axis-display"
          style={{ left: `${(axisPosition / 10000) * 100}%` }}
        ></div>
      </div>
      <div className="playback-controls">
        <button onClick={togglePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />} {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={stopPlayback}>
          <FaStop /> Stop
        </button>
        <button onClick={resetTimer}>
          <FaRedo /> Reset
        </button>
      </div>
      {Object.entries(assignedSounds).map(([pin, soundUrl]) => (
        <audio
          key={pin}
          ref={(el) => (audioRefs.current[parseInt(pin)] = el)}
          src={soundUrl || undefined}
          preload="auto"
          onCanPlayThrough={() => console.log(`Audio for pin ${pin} loaded successfully`)}
          onError={(e) => console.error(`Error loading audio for pin ${pin}:`, e)}
        ></audio>
      ))}
    </div>
  );
};

export default BeatControls;