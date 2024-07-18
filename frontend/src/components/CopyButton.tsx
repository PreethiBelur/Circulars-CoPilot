import React from "react";
import { Button } from "@fluentui/react-components";
import { Copy24Regular } from "@fluentui/react-icons";

interface CopyButtonProps {
    text: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
            <Button
                title="Copy to Clipboard"
                icon={<Copy24Regular primaryFill="#004D44"/>}
                onClick={handleCopy}
            />
    );
};

export default CopyButton;
