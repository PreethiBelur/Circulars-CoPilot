import { useState, useRef, useEffect } from "react";
import styles from './ChatArea.module.css';
import { ExampleList } from './ExampleList';
import { UserQuestion } from './UserQuestion';
import { AnswerLoading } from './AnswerLoading';
import { UserChatMessage } from './UserChatMessage';
import { Answer } from './Answer';
import { ChatAllMessage, ChatResponse } from '../api/model';
import { askApi, getSpeechConfig } from '../api/api';
import { ClearChatButton } from './ClearChatButton';
import * as speechSdk from 'microsoft-cognitiveservices-speech-sdk';
import ReadAloudButton from "./ReadAloudButton";
import CopyButton from "./CopyButton"; 

const ChatArea = () => {
    const [question, setQuestion] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const lastQuestionRef = useRef<string>("");
    const [answers1, setAnswers1] = useState<ChatAllMessage[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const chatMessageStreamEnd = useRef<HTMLDivElement | null>(null);
    const [streamingCitation, setStreamingCitation] = useState<string[]>([]);


    const [streamingMessage, setStreamingMessage] = useState<string>("");
    //const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);


    //useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "smooth" }), [isStreaming]);
    // useEffect(() => chatMessageStreamEnd.current?.scrollIntoView({ behavior: "auto" }), [isStreaming]);

    useEffect(() => {
        if (chatMessageStreamEnd.current) {
            chatMessageStreamEnd.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [answers1, isStreaming, isLoading, streamingMessage]);

    const onExampleClicked = (example: string) => {
        makeApiRequest(example);
        setQuestion('');
    }

    const makeApiRequest = async (question: string) => {
        lastQuestionRef.current = question;
        setAnswers1([...answers1, { role: 'User', message: question, citations: [] }]);
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const request = { message: question, citations: [] };
            const result : ChatResponse = await askApi(request);
            if (result.message) {
                streamAssistantMessage(result.message, result.citations || []);
            } else {
                streamErrorMessage('Failed to get a response from the chat assistant. Please try again.');
            }
        } catch (error) {
            streamErrorMessage("Failed to get a response from the chat assistant. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };

    const streamAssistantMessage = (message: string, citations? : string[]) => {
        setStreamingMessage("");
        setIsStreaming(true);
        let index = 0;

        const intervalId = setInterval(() => {
            const message_stream = message.split(' ');
            if (index < message_stream.length) {
                setStreamingMessage(prev => prev + ' ' + message_stream[index]);
                index++;
            } else {
                clearInterval(intervalId);
                setIsStreaming(false);
                setAnswers1(prev => [...prev, { role: 'Assistant', message, citations}]);
                console.log(citations);
            }
        }, 80); // Adjust the interval time to control the speed of the simulated typing effect
    };

    const streamErrorMessage = (errorMessage: string) => {
        setStreamingMessage("");
        setIsStreaming(true);
        let index = 0;

        const intervalId = setInterval(() => {
            const message_stream = errorMessage.split(' ');
            if (index < message_stream.length) {
                setStreamingMessage(prev => prev + ' ' + message_stream[index]);
                index++;
            } else {
                clearInterval(intervalId);
                setIsStreaming(false);
                setAnswers1(prev => [...prev, { role: 'Assistant', message: errorMessage, citations: [] }]);
            }
        }, 80); // Adjust the interval time to control the speed of the simulated typing effect
    };

    const startSpeechRecognition = async () => {
        const config = await getSpeechConfig();
        const speechConfig = speechSdk.SpeechConfig.fromSubscription(config.azure_subscription_key, config.azure_region);
        const audioConfig = speechSdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechSdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(result => {
            if (result.reason === speechSdk.ResultReason.RecognizedSpeech) {
                //setQuestion(result.text);
                makeApiRequest(result.text);
            } else {
                console.error("Speech recognition failed: ", result.errorDetails);
            }
        });
    };

    const clearChat = async () => {
        lastQuestionRef.current = "";
        setIsLoading(false);
        setAnswers1([]);
        setQuestion('')
        // const request: ChatResponse = { message: "Clear Chat" };
        // await askApi(request);

    };

    return (
        <div className={styles.container}>
            <div className={styles.commandsContainer}>
                <ClearChatButton className={styles.commandButton} onClick={clearChat} disabled={!lastQuestionRef.current || isLoading} />
            </div>
            <div className={styles.chatRoot}>
                <div className={styles.chatContainer}>
                    {!lastQuestionRef.current ? (
                        <div className={styles.chatEmptyState}>
                            <h1 className={styles.chatEmptyStateTitle}>Chat With Circulars Co-pilot Assistant</h1>
                            <ExampleList onExampleClicked={onExampleClicked} />
                        </div>
                    ) : (
                        <div className={styles.chatMessageStream}>
                            {!isLoading &&
                                answers1.map((answer1, index) => {
                                    if (answer1.role === 'User') {
                                        return (<UserChatMessage key={index} message={answer1.message} />);
                                    } else if (answer1.role === 'Assistant') {
                                        return (<div className={styles.chatMessageGpt}><Answer key={index} answer={answer1}></Answer>
                                        {/* {answer1.citations && answer1.citations.map((citation, citationIndex) => (
                                                    // <a key={citationIndex} href={citation} target="_blank" rel="noopener noreferrer">Citation {citationIndex + 1}</a>
                                                ))} */}

                                        <ReadAloudButton textToRead={answer1.message} /> 
                                        <CopyButton text={answer1.message + answer1.citations} /></div>);
                                    }
                                })
                            }
                            {isStreaming && (
                                <div className={styles.chatMessageGpt}>
                                    <Answer answer={{ role: 'Assistant', message: streamingMessage, citations: [] }} />
                                    <div className={styles.messageActions}>
                                        <ReadAloudButton textToRead={streamingMessage} />
                                        <CopyButton text={streamingMessage} />
                                    </div>
                                </div>
                            )}
                            {isLoading && (
                                <>
                                    <UserChatMessage message={lastQuestionRef.current} />
                                    <div className={styles.chatMessageGptMinWidth}>
                                        <AnswerLoading />
                                        <ReadAloudButton textToRead="Generating response..." />
                                        <CopyButton text="Generating response..." />
                                    </div>
                                </>
                            )}
                             <div ref={chatMessageStreamEnd} />
                        </div>

                    )}
                    <div className={styles.chatInput}>
                        <UserQuestion
                            onSend={question => makeApiRequest(question)}
                            placeholder="Example: Summarise the Digital Services Act?"
                            disabled={isLoading}
                            initQuestion={question}
                            clearOnSend
                            onMicClick={startSpeechRecognition}
                            onClearClick={clearChat}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;























//     //     return(
// //         <div className={styles.chatRoot}>
// //             <div className={styles.chatContainer}>
// //                 {!lastQuestionRef.current ? ( 
// //                     <div className={styles.chatEmptyState}>
// //                             <h3 className={styles.chatEmptyStateTitle}>Chat with Circulars Data</h3>
// //                             <h3 className={styles.chatEmptyStateSubtitle}>Ask anything or try an example</h3>
// //                             {<ExampleList onExampleClicked={onExampleClicked} />}
// //                     </div>
// //                 ) : (
// //                         {isStreaming && 
// //                                    <UserChatMessage message={answer[0]} />
// //                                        <div className={styles.chatMessageGpt}>
// //                                             <Answer
// //                                             isStreaming={false}
// //                                             answer={answer[1]}
// //                                             />
// //                                         </div>
// //                                 </div>       
// //                         ))}
// //                 )}
                        
                        
                        
                        
                        
// //                         <div className={styles.chatInput}>
// //                         <UserQuestion 
// //                             onSend={question => makeApiRequest(question)}
// //                             placeholder="Type a new question (e.g. how to apply for Illness Benefit?)"
// //                             disabled={isLoading}
// //                         />
// //                     </div>
// //                 {/* </div> */}
// //             </div>
// //             <div className={styles.askBottomSection}>
// //             {isLoading && <Spinner label="Generating answer" />}
// //             {!isLoading && answer &&(
// //             <div className={styles.askAnswerContainer}>
// //                         <Answer
// //                             answer={answer}
// //                         />
// //                     </div>
// // )}
// //             </div>
            
// //         </div>
// //     )
// // }

// export default ChatArea;