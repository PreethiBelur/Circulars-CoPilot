import { ChatAllMessage, ChatResponse } from "../api/model"
import { Stack } from "@fluentui/react";
import styles from "./Answer.module.css";
import { Lightbulb24Regular } from "@fluentui/react-icons";
// import DOMPurify from "dompurify";



// 


interface Props {
    answer: ChatAllMessage; // Use ChatAllMessage here, as it contains all required fields
}

export const Answer = ({ answer }: Props) => {
    const messageContent = answer.message;
    const citations = answer.citations || [];

    const formatCitation = (citation: string): string => {
        return citation.replace(/^\[\d+\]\s*/, ''); // Removes [1], [2], etc. from the beginning of the citation
    };

    // const captureCitationName = (citation :  string): string =>{
    //     return citation.split(',')[0]
    // }

    // const captureCitationlink = (citation :  string): string =>{
    //     return citation.split(',')[1]
    // }


    return (
        <Stack className={styles.answerContainer}>
            <Stack.Item>
                <Lightbulb24Regular primaryFill={"#004D44"} aria-hidden="true" aria-label="Answer logo" />
            </Stack.Item>
            <Stack.Item grow>
                <Stack>
                    <div className={styles.answerText}>
                        <p>{messageContent}</p>
                        {citations.length > 0 && (
                            <div className={styles.citations}>
                                <p>Citations:</p>
                                <ol>
                                    {citations.map((citation, index) => (
                                        <li key={index}>
                                            <a href={formatCitation(citation)} target="_blank" rel="noopener noreferrer">
                                            {formatCitation(citation)}
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </Stack>
            </Stack.Item>
        </Stack>
    );
};