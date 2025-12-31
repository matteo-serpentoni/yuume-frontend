import { memo } from "react";
import { processMessage } from "../../utils/messageHelpers";

const TextMessage = memo(({ message }) => {
  const rawContent = message.message || message.text || "";

  const processed = processMessage(rawContent);

  return (
    <>
      {message.title && (
        <div
          style={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
          }}
        >
          {message.title}
        </div>
      )}
      <div
        style={{ lineHeight: 1.6, wordBreak: "break-word" }}
        dangerouslySetInnerHTML={{ __html: processed }}
      />
    </>
  );
});

export default TextMessage;
