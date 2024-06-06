import React, { useState, useEffect, useRef } from 'react';
import SoundComponent from '../components/Sound';
import BeatControls from '../components/BeatControls';
import PresetsDropdown from '../components/PresetsDropdown';

export interface Sound {
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
	preview: string;
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

	const socket = useRef<WebSocket | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		// Initialize the WebSocket connection
		socket.current = new WebSocket('ws://192.168.0.201:8765');
	
		socket.current.onopen = () => {
			console.log('WebSocket connection established.');
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

	useEffect(() => {
		if (socket.current && socket.current.readyState === WebSocket.OPEN) {
			console.log('Sending reverb value to backend:', leftSliderValue);
			socket.current.send(JSON.stringify({ type: 'reverb', value: leftSliderValue }));
		}
	}, [leftSliderValue]);

	useEffect(() => {
		if (socket.current && socket.current.readyState === WebSocket.OPEN) {
			console.log('Sending distortion value to backend:', rightSliderValue);
			socket.current.send(JSON.stringify({ type: 'distortion', value: rightSliderValue }));
		}
	}, [rightSliderValue]);

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
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}

		setSelectedSound(sound);
		const audio = new Audio(sound.previews['preview-hq-mp3']);
		audioRef.current = audio;
		audio.play();
	};

	const handleStopPreview = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setSelectedSound(null);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchSounds(query);
	};

	const handlePresetSelect = (presetSounds: (Sound | null)[]) => {
		setAssignedSounds(presetSounds);
		console.log(presetSounds);
	  
		const soundsToSend = presetSounds.map((sound, index) => {
			const pin = buttonPins[index];
			return sound ? { pin, sound: sound.preview } : { pin, sound: null };
		});
	
		if (socket.current) {
			socket.current.send(JSON.stringify({ type: 'assign_sounds_batch', sounds: soundsToSend }));
		}
	};	
		
	const buttonPins = [
		5, 6, 13, 19, 26, 16, 20, 21, 4, 17, 27, 22, 24, 25, 23, 18
	];

	const handleButtonSoundClick = (sound: Sound, index: number) => {
		const newAssignedSounds = [...assignedSounds];
		newAssignedSounds[index] = sound;
		const soundPreview = sound.previews['preview-hq-mp3'];
		setAssignedSounds(newAssignedSounds);
	  
		// Send the selected sound to the backend
		if (sound && socket.current) {
		  const pin = buttonPins[index];
		  console.log('Sending sound to backend:', { pin, sound: soundPreview });
		  socket.current.send(JSON.stringify({ type: 'assign_sound', pin, sound: soundPreview }));
		}
		if (audioRef.current) {
		  audioRef.current.pause();
		  audioRef.current.currentTime = 0;
		  setSelectedSound(null);
		}
	  };	  

	  const handleButtonSoundDrop = (
		index: number,
		e: React.DragEvent<HTMLButtonElement>
	  ) => {
		e.preventDefault();
		const soundData = e.dataTransfer.getData('sound');
		const sound = JSON.parse(soundData);
		const newAssignedSounds = [...assignedSounds];
		newAssignedSounds[index] = sound;
		setAssignedSounds(newAssignedSounds);
	  
		// Send the selected sound to the backend
		if (sound && socket.current) {
		  const pin = buttonPins[index];
		  const soundPreview = sound.previews['preview-hq-mp3'];
		  console.log('Sending sound to backend:', { pin, sound: soundPreview });
		  socket.current.send(JSON.stringify({ type: 'assign_sound', pin, sound: soundPreview }));
		}
	  };	  

	const handleButtonSoundDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
		e.preventDefault();
	};

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
							min="0"
							max="100"
							value={leftSliderValue}
							onChange={(e) => setLeftSliderValue(parseInt(e.target.value))}
						/>
						<span>{leftSliderValue}</span>
					</div>
					<div className="preview-menu">
						<button
							className="stop-button reset-button"
							onClick={handleStopPreview}
						>
							Stop Preview
						</button>

						<div className="sounds">
							<div className="presets">
								<PresetsDropdown 
									handlePresetSelect={handlePresetSelect}
									socket={socket.current}
									buttonPins={buttonPins}
									assignedSounds={assignedSounds}
								/>
							</div>
							<div className="sounds-grid">
								{sounds.map((sound, index) => (
									<SoundComponent
										key={sound.id}
										sound={sound}
										index={index}
										onClick={handleSoundSelect}
										onDragStart={() => setSelectedSound(sound)}
										isSelected={selectedSound === sound}
									/>
								))}
							</div>
						</div>
					</div>
					<div className="slider">
						<label htmlFor="right-slider">Distortion</label>
						<input
							type="range"
							id="right-slider"
							min="0"
							max="100"
							value={rightSliderValue}
							onChange={(e) => setRightSliderValue(parseInt(e.target.value))}
						/>
						<span>{rightSliderValue}</span>
					</div>
				</div>

				<BeatControls
					socket={socket.current}
					assignedSounds={assignedSounds.reduce<{ [pin: number]: string | null }>((acc, sound, index) => {
						if (sound) {
						acc[buttonPins[index]] = sound.previews['preview-hq-mp3'];
						}
						return acc;
					}, {})}
				/>

				<div className="embedded-keyboard">
					{assignedSounds.map((sound, index) => (
						<button
							key={index}
							className={`embedded-key ${
								sound ? 'assigned' : selectedSound ? 'glow empty' : 'empty'
							}`}
							onDrop={(e) => handleButtonSoundDrop(index, e)}
							onDragOver={handleButtonSoundDragOver}
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
