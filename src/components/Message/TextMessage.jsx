import React, { memo } from "react";

const TextMessage = memo(({ message }) => {
  const rawContent = message.message || message.text || "";

  // console.log("TextMessage rendering content:", rawContent);

  // 1. Replace URLs with links
  let processed = rawContent.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; font-weight: 500; pointer-events: auto;">$1</a>'
  );

  // 2. Basic Markdown
  processed = processed
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:3px;font-size:0.9em;">$1</code>'
    );

  // 3. Newlines
  processed = processed.replace(/\n/g, "<br/>");

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
