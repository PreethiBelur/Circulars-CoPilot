// // // AzureSpeechService.ts

import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { getSpeechConfig } from './api';

const config = await getSpeechConfig();

const speechConfig = sdk.SpeechConfig.fromSubscription(config.azure_subscription_key, config.azure_region);

export const readAloud = async (text: string) => {
    speechConfig.speechSynthesisVoiceName = "en-IE-EmilyNeural";
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    return new Promise<void>((resolve, reject) => {
        synthesizer.speakTextAsync(
            text,
            result => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    resolve();
                } else {
                    reject(new Error(result.errorDetails));
                }
                synthesizer.close();
            },
            error => {
                synthesizer.close();
                reject(error);
            }
        );
    });
};





