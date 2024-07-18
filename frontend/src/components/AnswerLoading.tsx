import { Stack } from "@fluentui/react";
import { animated, useSpring } from "@react-spring/web";
import { TextGrammarLightning24Filled } from "@fluentui/react-icons";

import styles from "./Answer.module.css";

export const AnswerLoading = () => {
    const animatedStyles = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    });

    return (
        <animated.div style={{ ...animatedStyles }}>
            <Stack className={styles.answerContainer} verticalAlign="space-between">
            <TextGrammarLightning24Filled primaryFill={"#004D44"} aria-hidden="true" aria-label="Answer logo" />                <Stack.Item grow>
                    <p className={styles.answerText}>
                        Generating answer
                        <span className={styles.loadingdots} />
                    </p>
                </Stack.Item>
            </Stack>
        </animated.div>
    );
};