const audio = new Audio();

export const playAudio = (audioSrc: string): void => {
    audio.src = audioSrc;
    audio.play();
};

export const stopAudio = (): void => {
    audio.pause();
    audio.currentTime = 0; // Reset the audio to the beginning
};