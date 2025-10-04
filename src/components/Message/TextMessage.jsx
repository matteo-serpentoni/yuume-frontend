import React from "react";
import MessageChips from "./MessageChips";
import { parseMessageFormat } from "../../utils/messageHelpers";

const TextMessage = ({ message, onChipClick }) => {
    const { content, hasMarkdown, hasHTML } = parseMessageFormat(message.message);

    const renderContent = () => {
        if (hasHTML) {
            return (
                <div
                    style={{ lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            );
        }

        if (hasMarkdown) {
            // Semplice parsing markdown per bold, italic, code
            let parsed = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:2px 4px;border-radius:3px;font-size:0.9em;">$1</code>')
                .replace(/\n/g, '<br/>');

            return (
                <div
                    style={{ lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: parsed }}
                />
            );
        }

        return (
            <div style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {content}
            </div>
        );
    };

    return (
        <>
            {message.title && (
                <div style={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8
                }}>
                    {message.title}
                </div>
            )}

            {renderContent()}

            <MessageChips chips={message.chips} onChipClick={onChipClick} />
        </>
    );
};

export default TextMessage;