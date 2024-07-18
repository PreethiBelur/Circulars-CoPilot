import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { getSpeechConfig } from './api';


let synthesizer: sdk.SpeechSynthesizer | null = null;

export const getSynthesizedSpeechUrl = async (text: string): Promise<string> => {
    if (!synthesizer) {
        const config = await getSpeechConfig(); // Function to fetch your Azure Speech Config
        const speechConfig = sdk.SpeechConfig.fromSubscription(config.azure_subscription_key, config.azure_region);
        speechConfig.speechSynthesisVoiceName = "en-IE-EmilyNeural"; // Irish accent
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    }

    return new Promise<string>((resolve, reject) => {
        synthesizer?.speakTextAsync(
            text,
            (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const blob = new Blob([result.audioData], { type: 'audio/wav' });
                    resolve(URL.createObjectURL(blob));
                } else {
                    reject(new Error(result.errorDetails));
                }
            },
            (error) => {
                reject(error);
            }
        );
    });
};
