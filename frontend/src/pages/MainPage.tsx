import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { DraggableEvent, DraggableData } from 'react-draggable';

interface Sound {
	id: number;
	name: string;
	previews: {
		'preview-hq-mp3': string;
	};
	tags: string[] | undefined;
}

const MainPage = () => {
	const [sounds, setSounds] = useState<Sound[]>([]);
	const [query, setQuery] = useState<string>('Drums');
	const [assignedSounds, setAssignedSounds] = useState<(Sound | null)[]>(
		Array(16).fill(null)
	);

	useEffect(() => {
		fetchSounds(query);
	}, [query]);

	const fetchSounds = async (searchQuery: string) => {
		try {
			const apiKey = 'Aj9x06vq60VC37YLo9psCPwzvEIyTu0eBQfphtoz';
			const queryParams = new URLSearchParams({
				query: searchQuery,
				fields: 'id,name,previews,tags',
				token: apiKey
			});
			const response = await fetch(
				`https://freesound.org/apiv2/search/text/?${queryParams}`
			);
			const data = await response.json();
			const randomPianoSounds = data.results.slice(0, 16);
			setSounds(randomPianoSounds);
		} catch (error) {
			console.error('Error fetching sounds:', error);
		}
	};

	const handleSoundClick = (previewUrl: string) => {
		const audio = new Audio(previewUrl);
		audio.play();
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchSounds(query);
	};

	const handleDragStop = (
		index: number,
		event: MouseEvent | TouchEvent | DraggableEvent,
		data: DraggableData
	) => {
		const sound = sounds[index];
		const buttonIndex = getButtonIndex(data.x, data.y);
		if (buttonIndex !== -1) {
			const newAssignedSounds = [...assignedSounds];
			newAssignedSounds[buttonIndex] = sound;
			setAssignedSounds(newAssignedSounds);
		}
	};

	const getButtonIndex = (x: number, y: number): number => {
		// Logic to determine which button the sound was dropped onto
		// This logic depends on your UI layout, you may need to adjust it accordingly
		// For example, you can use coordinates to determine the button index
		// Here, I'm assuming a simple grid layout with 4 buttons per row
		const row = Math.floor(y / buttonHeight);
		const col = Math.floor(x / buttonWidth);
		const index = row * 4 + col;
		if (index >= 0 && index < 16) {
			return index;
		}
		return -1;
	};

	const handleButtonSoundClick = (sound: Sound | null) => {
		if (sound) {
			const audio = new Audio(sound.previews['preview-hq-mp3']);
			audio.play();
		}
	};

	const buttonWidth = 100; // Adjust this value based on your button width
	const buttonHeight = 50; // Adjust this value based on your button height

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
				<div className="sounds">
					{sounds.map((sound, index) => (
						<Draggable
							key={sound.id}
							onStop={(e, data) => handleDragStop(index, e, data)}
						>
							<button
								className="sound-button"
								onClick={() =>
									handleSoundClick(sound.previews['preview-hq-mp3'])
								}
							>
								<img src="/assets/note.png" alt="" height={20} width={20} />
							</button>
						</Draggable>
					))}
				</div>
				<div className="embedded-keyboard">
					{assignedSounds.map((sound, index) => (
						<button
							key={index}
							className="embedded-key"
							onClick={() => handleButtonSoundClick(sound)}
						>
							<div>{sound ? sound.name : 'Empty'}</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default MainPage;
