import React, { useState, useEffect, useRef } from 'react';
import {
	FaPlay,
	FaPause,
	FaStop,
	FaRedo,
	FaCircle,
	FaSquare
} from 'react-icons/fa';

type BeatControlsProps = {
	socket: WebSocket | null;
};

const BeatControls = ({ socket }: BeatControlsProps) => {
	const [timerValue, setTimerValue] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [timerRunning, setTimerRunning] = useState<boolean>(false);
	const [recordedButtons, setRecordedButtons] = useState<number[]>([]);
	const [axisPosition, setAxisPosition] = useState<number>(0);

	const timerRef = useRef<number | null>(null);

	// test
	const buttonPins = [3, 7, 11];

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying);
		if (!timerRunning) {
			setTimerValue(0);
			setTimerRunning(true);
			timerRef.current = window.setInterval(() => {
				setTimerValue((prevValue) => {
					if (prevValue >= 10000) {
						setTimerRunning(false);
						window.clearInterval(timerRef.current!);
						return 0;
					}
					return prevValue + 10;
				});
			}, 10);
		} else {
			setTimerRunning(false);
			window.clearInterval(timerRef.current!);
		}
	};

	const stopPlayback = () => {
		setIsPlaying(false);
		setTimerRunning(false);
		setTimerValue(0);
		setAxisPosition(0);
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
	};

	const resetTimer = () => {
		setRecordedButtons([]);
		setTimerValue(0);
		setAxisPosition(0);
	};

	const handleButtonPress = (pin: number) => {
		setRecordedButtons((prevButtons) => [...prevButtons, timerValue]);
	};

	const handleClearRecordedButtons = () => {
		setRecordedButtons([]);
	};

	useEffect(() => {
		if (socket) {
			socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.type === 'assign_sound' && data.pin) {
					setRecordedButtons((prevButtons) => [...prevButtons, timerValue]);
				}
			};
		}
	}, [socket, timerValue]);

	useEffect(() => {
		if (isPlaying) {
			let index = 0;
			const interval = setInterval(() => {
				if (index < recordedButtons.length) {
					setTimerValue(recordedButtons[index]);
					setAxisPosition((recordedButtons[index] / 10000) * 100);
					index++;
				} else {
					clearInterval(interval);
					setIsPlaying(false);
				}
			}, 10);
			return () => clearInterval(interval);
		}
	}, [isPlaying, recordedButtons]);

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
				{recordedButtons.map((time, index) => (
					<div
						key={index}
						className="button-indicator"
						style={{ left: `${(time / 10000) * 100}%` }}
					></div>
				))}
				<div
					className="timer-axis-display"
					style={{ left: `${axisPosition}%` }}
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
				<button onClick={handleClearRecordedButtons}>
					<FaSquare /> Clear Recorded
				</button>
			</div>
			<div className="static-buttons">
				{buttonPins.map((pin, index) => (
					<button key={index} onClick={() => handleButtonPress(pin)}>
						Test Button {index + 1}
					</button>
				))}
			</div>
		</div>
	);
};

export default BeatControls;