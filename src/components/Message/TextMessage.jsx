import { memo } from 'react';
import FormattedText from './FormattedText';
import './TextMessage.css';

const TextMessage = memo(({ message }) => {
  const rawContent = message.message || message.text || '';

  return (
    <>
      {message.title && <div className="yuume-text-message-title">{message.title}</div>}
      <FormattedText text={rawContent} className="yuume-text-message-content" tag="div" />
    </>
  );
});

export default TextMessage;
