import { useEffect,useState } from "react";
import { Stack, TextField } from "@fluentui/react";
import { Button, Tooltip } from "@fluentui/react-components";
import styles from "./UserQuestion.module.css";
import { Mic28Regular, Send28Filled, Broom28Regular } from "@fluentui/react-icons";


interface Props {
    onSend: (question: string) => void;
    placeholder?: string;
    disabled:boolean
    initQuestion?: string;
    clearOnSend?: boolean;
    onMicClick: () => void;
    onClearClick: () => void;
}
export const UserQuestion = ({onSend, placeholder, disabled, initQuestion,clearOnSend,onMicClick, onClearClick}: Props) => {
    const [question, setQuestion] = useState<string>("");
    const sendQuestionDisabled = disabled || !question.trim()

    useEffect(() => {
        initQuestion && setQuestion(initQuestion);
    }, [initQuestion]);

    const sendQuestion = () => {
        if (disabled || !question.trim()) {
             return;
         }

        onSend(question);

         if (clearOnSend) {
            setQuestion('');
         }
    };

    const onEnterPress = (ev: React.KeyboardEvent<Element>) => {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            sendQuestion();
        }
    };

    const onQuestionChange = (_ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            setQuestion("");
        } else if (newValue.length <= 1000) {
            setQuestion(newValue);
        }
    };



return(
    <Stack horizontal className={styles.trial} tokens={{ childrenGap: 10 }}>
        <TextField 
          className={styles.questionInputTextArea}
          placeholder={placeholder}
          multiline
          borderless
          resizable={false}
          value={question}
          onChange={onQuestionChange}
          onKeyDown={onEnterPress}
          /> 
        <div className={styles.questionInputButtonsContainer}>
                <Button size="large" title="Submit question" icon={<Send28Filled primaryFill="#004D44" />} disabled={sendQuestionDisabled} onClick={sendQuestion}/>
        </div>
        <div className={styles.questionInputButtonsContainer}>
                <Button size="large" title="Ask question" icon={<Mic28Regular primaryFill="#004D44" />} onClick={onMicClick}/>
        </div>
        <div className={styles.questionInputButtonsContainer}>
                    <Button size="large" title="Clear Chat" icon={<Broom28Regular primaryFill="#004D44" />} onClick={onClearClick} />
            </div>

     
    </Stack>
)

}