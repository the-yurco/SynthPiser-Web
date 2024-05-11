import React, { useState, useEffect, useRef } from 'react';
import {
	FaPlay,
	FaPause,
	FaStop,
	FaRedo,
	FaCircle,
	FaSquare,
	FaReply
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
	const replayRef = useRef<boolean>(false);

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
					return prevValue + 10; // Increase by 10 milliseconds
				});
			}, 10); // Update every 10 milliseconds
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

	const handleReplay = () => {
		if (recordedButtons.length > 0) {
			setIsPlaying(true);
			setTimerValue(0);
			setAxisPosition(0);
			replayRef.current = true;
		}
	};

	useEffect(() => {
		if (socket) {
			socket.onmessage = (event) => {
				console.log('Received message:', event.data);
				const data = JSON.parse(event.data);
				if (data.type === 'button_click' && data.pin) {
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
					setAxisPosition((recordedButtons[index] / 10000) * 100); // Update axis position
					index++;
				} else {
					clearInterval(interval);
					setIsPlaying(false);
					if (replayRef.current) {
						replayRef.current = false;
						setTimeout(() => {
							togglePlayPause();
						}, 500);
					}
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
				<button onClick={handleReplay}>
					<FaReply /> Replay
				</button>
			</div>
		</div>
	);
};

export default BeatControls;
