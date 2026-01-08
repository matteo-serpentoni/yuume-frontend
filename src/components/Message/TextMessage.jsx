import { memo } from 'react';
import { processMessage } from '../../utils/messageHelpers';
import './TextMessage.css';

const TextMessage = memo(({ message }) => {
  const rawContent = message.message || message.text || '';

  const processed = processMessage(rawContent);

  return (
    <>
      {message.title && <div className="yuume-text-message-title">{message.title}</div>}
      <div className="yuume-text-message-content" dangerouslySetInnerHTML={{ __html: processed }} />
    </>
  );
});

export default TextMessage;
