// // ReadAloudButton.tsx

import React, { useState } from 'react';
import { readAloud } from '../api/readaloud'; // Adjust path as per your project structure
import { ReadAloud28Filled } from '@fluentui/react-icons';
import { Button } from "@fluentui/react-components";


interface Props {
    textToRead: string;
}

const ReadAloudButton: React.FC<Props> = ({ textToRead }) => {
    const [isReading, setIsReading] = useState<boolean>(false);

    const handleReadAloud = async () => {
        try {
            setIsReading(true);
            await readAloud(textToRead);
        } catch (error) {
            console.error('Error reading aloud:', error);
        } finally {
            setIsReading(false);
        }
    };



    return (

        <Button icon={<ReadAloud28Filled primaryFill="#004D44"/>}
        title="Read Aloud"
        onClick={handleReadAloud}
        disabled={isReading}
        />
    );

    
};

export default ReadAloudButton;

// import React, { useState, useRef } from "react";
// import { Button, Tooltip } from "@fluentui/react-components";
// import { Play24Regular, Stop24Regular } from "@fluentui/react-icons";
// import { getSynthesizedSpeechUrl } from '../api/AzureSpeechService'; // Adjust the import path as needed

// interface ReadAloudButtonProps {
//     text: string;
// }

// const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text }) => {
//     const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
//     const audioRef = useRef<HTMLAudioElement | null>(null);

//     const handlePlay = async () => {
//         if (isReadingAloud) return; // Prevent multiple play actions

//         try {
//             const url = await getSynthesizedSpeechUrl(text);
//             if (audioRef.current) {
//                 audioRef.current.pause();
//                 audioRef.current.currentTime = 0;
//                 audioRef.current.src = ''; // Clear the current audio source
//             }

//             const newAudio = new Audio(url);
//             audioRef.current = newAudio;

//             newAudio.addEventListener("ended", handleStop);
//             newAudio.addEventListener("play", () => setIsReadingAloud(true));
//             newAudio.addEventListener("pause", () => setIsReadingAloud(false));

//             newAudio.play().catch(() => {
//                 // Handle play promise rejection
//                 setIsReadingAloud(false);
//             });
//         } catch (error) {
//             console.error("Error in handlePlay:", error);
//             setIsReadingAloud(false);
//         }
//     };

//     const handleStop = () => {
//         if (audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.currentTime = 0;
//             audioRef.current.src = ''; // Clear the current audio source
//         }
//         setIsReadingAloud(false);
//     };

//     return (
//         <div>
//             <Tooltip content="Read Aloud" relationship="label">
//                 <Button
//                     icon={<Play24Regular />}
//                     onClick={handlePlay}
//                     disabled={isReadingAloud} // Disable play button while reading aloud
//                 />
//             </Tooltip>
//             <Tooltip content="Stop Reading" relationship="label">
//                 <Button
//                     icon={<Stop24Regular />}
//                     onClick={handleStop}
//                     disabled={!isReadingAloud} // Enable stop button only when reading aloud
//                 />
//             </Tooltip>
//         </div>
//     );
// };

// export default ReadAloudButton;







