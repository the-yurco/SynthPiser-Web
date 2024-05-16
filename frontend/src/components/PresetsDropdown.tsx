import React, { useState, useEffect } from 'react';
import { Sound } from '../pages/MainPage';

interface Preset {
  name: string;
  sounds: Sound[];
}

interface PresetsDropdownProps {
  handlePresetSelect: (sounds: Sound[]) => void;
  socket: WebSocket | null; // Add socket prop
  buttonPins: number[]; // Add buttonPins prop
  assignedSounds: (Sound | null)[]; // Add assignedSounds prop
}

const PresetsDropdown: React.FC<PresetsDropdownProps> = ({ handlePresetSelect, socket, buttonPins, assignedSounds }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset>({ name: 'No Preset', sounds: [] }); // Change to string
  const [pianoSounds, setPianoSounds] = useState<Sound[]>([]);

  useEffect(() => {
    const fetchPianoSounds = async () => {
      try {
        const apiKey = 'Aj9x06vq60VC37YLo9psCPwzvEIyTu0eBQfphtoz';
        const packId = '4409'; // Pack ID from the provided link
        const response = await fetch(`https://freesound.org/apiv2/packs/${packId}/sounds/?token=${apiKey}`);
        const data = await response.json();

        // Extract IDs and names of the piano sounds
        const pianoSoundsData = data.results.filter((sound: { name: string; tags: string[] }) =>
          sound.tags.includes('keyboard') && sound.tags.includes('note')
        );
        const fetchedPianoSounds: Sound[] = pianoSoundsData.map((sound: { id: number; name: string }) => ({
          id: sound.id,
          name: sound.name,
          url: `https://freesound.org/apiv2/sounds/${sound.id}/download/?token=${apiKey}`,
        }));

        // Set piano sounds to the state
        setPianoSounds(fetchedPianoSounds);
      } catch (error) {
        console.error('Error fetching piano sounds from the pack:', error);
      }
    };

    fetchPianoSounds();
  }, []);

  const presets: Preset[] = [
    { name: 'No Preset', sounds: [] }, // Default option with no sounds
    { name: 'Piano Notes', sounds: pianoSounds },
    { name: 'Guitar Chords', sounds: [] }, // Add your sounds here
    // Add more presets as needed
  ];

  const handlePresetClick = (preset: Preset) => {
    let soundsToSet: Sound[] = [];
    if (preset.name === 'No Preset') {
      // Empty out the assignedSounds array
      soundsToSet = Array(16).fill(null);
    } else {
      // Update soundsToSet with the sounds from the preset
      soundsToSet = preset.sounds;
    }
    // Ensure that soundsToSet has 16 elements (fill with null if necessary)
    soundsToSet = soundsToSet.concat(Array(Math.max(16 - soundsToSet.length, 0)).fill(null));
    
    handlePresetSelect(soundsToSet);
    setSelectedPreset(preset);
    setIsOpen(false);
  };
  
  return (
    <div className="presets">
      <div className="presets-dropdown">
        <button className="preset-button" onClick={() => setIsOpen(!isOpen)}>
          {selectedPreset.name}
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            {presets
              .filter((preset) => preset.name !== selectedPreset.name) // Filter out the selected preset
              .map((preset, index) => (
                <button
                  className="preset-button-dropdown"
                  key={index}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresetsDropdown;
