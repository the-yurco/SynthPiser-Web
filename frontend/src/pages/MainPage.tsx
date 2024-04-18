import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';

interface Sound {
	id: number;
	name: string;
	bitrate: string;
	images: {
		waveform_m: string;
		spectral_l: string;
	};
	previews: {
		'preview-hq-mp3': string;
	};
	tags: string[] | undefined;
}

const MainPage = () => {
	const [sounds, setSounds] = useState<Sound[]>([]);
	const [query, setQuery] = useState<string>('Drums');
	const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
	const [assignedSounds, setAssignedSounds] = useState<(Sound | null)[]>(
		Array(16).fill(null)
	);
	const [leftSliderValue, setLeftSliderValue] = useState<number>(0);
	const [rightSliderValue, setRightSliderValue] = useState<number>(0);
	const [timerRunning, setTimerRunning] = useState<boolean>(false);
	const [timerValue, setTimerValue] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const timerRef = useRef<number | null>(null);

	const socket = useRef<WebSocket | null>(null);

	useEffect(() => {
		// Initialize the WebSocket connection
		socket.current = new WebSocket('ws://192.168.0.201:8765');

		socket.current.onopen = () => {
			console.log('WebSocket connection established.');
		};

		socket.current.onmessage = (event: any) => {
			console.log('Received message:', event.data);
		};

		socket.current.onclose = () => {
			console.log('WebSocket connection closed.');
		};

		// Clean up WebSocket connection when component unmounts
		return () => {
			if (socket.current) {
				socket.current.close();
			}
		};
	}, []);

	useEffect(() => {
		fetchSounds(query);
	}, [query]);

	const fetchSounds = async (searchQuery: string) => {
		try {
			const apiKey = 'Aj9x06vq60VC37YLo9psCPwzvEIyTu0eBQfphtoz';
			const queryParams = new URLSearchParams({
				query: searchQuery,
				fields: 'id,name,bitrate,images,previews,tags',
				token: apiKey
			});
			const response = await fetch(
				`https://freesound.org/apiv2/search/text/?${queryParams}`
			);
			const data = await response.json();
			const randomPianoSounds = data.results.slice(0, 16);
			setSounds(randomPianoSounds);
			console.log(randomPianoSounds);
		} catch (error) {
			console.error('Error fetching sounds:', error);
		}
	};

	const handleSoundSelect = (sound: Sound) => {
		setSelectedSound(sound);
		const audio = new Audio(sound.previews['preview-hq-mp3']);
		audio.play();
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchSounds(query);
	};

	const buttonPins = [
		5, 6, 13, 19, 26, 16, 20, 21, 4 , 17, 27, 22 ,24 ,25 ,23, 18
	];

	const handleButtonSoundClick = (sound: Sound, index: number) => {
		const newAssignedSounds = [...assignedSounds];
		newAssignedSounds[index] = sound;
		const audio = sound.previews['preview-hq-mp3'];
		setAssignedSounds(newAssignedSounds);

		// Send the selected sound to the backend
		if (sound && socket.current) {
			const pin = buttonPins[index];
			console.log('Sending sound to backend:', { pin, sound });
			socket.current.send(JSON.stringify({ type: 'assign_sound', pin, sound }));
		}
		setSelectedSound(null);
	};

	const handleResetSounds = () => {
		setAssignedSounds(Array(16).fill(null));
		setSelectedSound(null);
	};

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying);
		if (!timerRunning) {
			setTimerValue(0);
			setTimerRunning(true);
			timerRef.current = window.setInterval(() => {
				setTimerValue((prevValue) => {
					if (prevValue >= 10) {
						setTimerRunning(false);
						window.clearInterval(timerRef.current!);
						return 0;
					}
					return prevValue + 1;
				});
			}, 1000);
		} else {
			setTimerRunning(false);
			window.clearInterval(timerRef.current!);
		}
	};

	const resetAudio = () => {
		setSelectedSound(null);
	};

	const playPauseButton =
		timerValue > 10 ? <FaPlay /> : isPlaying ? <FaPause /> : <FaPlay />;

	return (
		<div className="main-page">
			<div className="content">
				<div className="logo">
					<h1>SynthPiser</h1>
				</div>
				<form onSubmit={handleSearch}>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search"
						className="search-bar"
					/>
				</form>
				<div className="sounds-wrapper">
					<div className="slider">
						<label htmlFor="left-slider">Reverb</label>
						<input
							type="range"
							id="left-slider"
							min="-20"
							max="20"
							value={leftSliderValue}
							onChange={(e) => setLeftSliderValue(parseInt(e.target.value))}
						/>
						<span>{leftSliderValue}</span>
					</div>
					<div className="sounds">
						{sounds.map((sound, index) => (
							<button
								key={sound.id}
								className={`sound-button ${
									selectedSound === sound ? 'selected' : ''
								}`}
								onClick={() => handleSoundSelect(sound)}
							>
								<img
									src={sound.images.waveform_m}
									alt=""
									height={75}
									width={75}
								/>
								{/* <p>{sound.name}</p> */}
							</button>
						))}
					</div>
					<div className="slider">
						<label htmlFor="right-slider">Distortion</label>
						<input
							type="range"
							id="right-slider"
							min="-20"
							max="20"
							value={rightSliderValue}
							onChange={(e) => setRightSliderValue(parseInt(e.target.value))}
						/>
						<span>{rightSliderValue}</span>
					</div>
				</div>

				<div className="beat-controls">
					<div className="visualizer">
						<div className="timer-wrapper">
							<div className="timer">{timerValue}</div>
						</div>
						<div
							className="timer-line"
							style={{ width: `${timerValue * 10}%` }}
						/>
					</div>
					<div className="beat-buttons">
						<button onClick={togglePlayPause}>{playPauseButton}</button>
						<button onClick={resetAudio}>
							<FaRedo />
						</button>
					</div>
				</div>
				<button className="reset-button" onClick={handleResetSounds}>
					Reset
				</button>
				<div className="embedded-keyboard">
					{assignedSounds.map((sound, index) => (
						<button
							key={index}
							className={`embedded-key ${
								sound ? 'assigned' : selectedSound ? ' empty' : 'empty'
							} `}
							onClick={() =>
								selectedSound && handleButtonSoundClick(selectedSound, index)
							}
						>
							<div></div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default MainPage;