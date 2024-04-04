import React, { useState, useEffect } from 'react';

interface Sound {
	id: number;
	name: string;
	bitrate:string;
	images:{
		'waveform_m':string;
		'spectral_l':string;
	}
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

	const handleButtonSoundClick = (sound: Sound | null, index: number) => {
		if (selectedSound) {
			const newAssignedSounds = [...assignedSounds];
			newAssignedSounds[index] = selectedSound;
			setAssignedSounds(newAssignedSounds);
		}
	};

	const handleResetSounds = () => {
		setAssignedSounds(Array(16).fill(null));
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
				<div className="sounds">
					{sounds.map((sound, index) => (
						<button
							key={sound.id}
							className={`sound-button ${
								selectedSound === sound ? 'selected' : ''
							}`}
							onClick={() => handleSoundSelect(sound)}
						>
							<img src={sound.images.waveform_m} alt="" height={75} width={75} />
							<p>{sound.name}</p>
						</button>
					))}
				</div>
				<button className="reset-button" onClick={handleResetSounds}>
					Reset
				</button>
				<div className="embedded-keyboard">
					{assignedSounds.map((sound, index) => (
						<button
							key={index}
							className={`embedded-key ${sound ? 'assigned' : 'empty'}`}
							onClick={() => handleButtonSoundClick(selectedSound, index)}
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
