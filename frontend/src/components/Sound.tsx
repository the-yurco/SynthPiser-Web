import { Sound } from "../pages/MainPage";

interface SoundComponentProps {
    sound: Sound;
    index: number;
    onClick: (sound: Sound, index : number) => void;
    onDragStart: (id: number) => void;
}

const SoundComponent: React.FC<SoundComponentProps> = ({ sound, index, onClick, onDragStart }) => {

    const handleClick = () => {
        onClick(sound,index);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("sound", JSON.stringify(sound));
        onDragStart(sound.id);
    };

    return (
        <div
            className="sound"
            draggable={true}
            onDragStart={handleDragStart}
            onClick = {handleClick}
        >
            <img src={sound.images.waveform_m} alt="" height={75} width={75} />
        </div>
    );
};

export default SoundComponent;