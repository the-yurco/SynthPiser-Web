import React, { useState, useEffect } from 'react';
import { Sound } from '../pages/MainPage';

interface Preset {
  name: string;
  sounds: Sound[];
}

interface PresetsDropdownProps {
  handlePresetSelect: (sounds: (Sound)[]) => void;
  socket: WebSocket | null;
  buttonPins: number[];
  assignedSounds: (Sound | null)[];
}

const PresetsDropdown: React.FC<PresetsDropdownProps> = ({ handlePresetSelect, socket, buttonPins, assignedSounds }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<Preset>({ name: 'No Preset', sounds: [] });
  const [pianoSounds, setPianoSounds] = useState<Sound[]>([]);

  const presets: Preset[] = [
    { name: 'No Preset', sounds: [] },
    { name: 'Piano Notes', sounds: pianoSounds },
    { name: 'Guitar Chords', sounds: [] },
  ];

  const handlePresetClick = async (preset: Preset) => {
    let soundsToSet: Sound[] = [];
    if (preset.name === 'No Preset') {
      
      soundsToSet = Array(16).fill(null);
    } else if (preset.name === 'Piano Notes') {

      try {
        const apiKey = 'Aj9x06vq60VC37YLo9psCPwzvEIyTu0eBQfphtoz';
        const packId = '4409';
        const packResponse = await fetch(`https://freesound.org/apiv2/packs/${packId}/sounds/?token=${apiKey}`);
        const packData = await packResponse.json();
    
        const soundRequests = packData.results.map(async (sound: { id: number }) => {
          const soundResponse = await fetch(`https://freesound.org/apiv2/sounds/${sound.id}/?token=${apiKey}`);
          const soundData = await soundResponse.json();
          return {
            id: soundData.id,
            name: soundData.name,
            preview: soundData.previews['preview-hq-mp3']
          };
        });
    
        const soundObjects = await Promise.all(soundRequests);
    
        setPianoSounds(soundObjects);
      } catch (error) {
        console.error('Error fetching piano sounds from the pack:', error);
      }
    } else {

      soundsToSet = preset.sounds;
    }

    soundsToSet = soundsToSet.concat(Array(Math.max(16 - soundsToSet.length, 0)).fill(null));
    handlePresetSelect(soundsToSet as (Sound)[]);
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
              .filter((preset) => preset.name !== selectedPreset.name)
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