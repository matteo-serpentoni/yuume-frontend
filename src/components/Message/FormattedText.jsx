import { memo } from 'react';
import { processMessage } from '../../utils/messageHelpers';

/**
 * FormattedText — low-level primitive for rendering API text with markdown support.
 * Converts markdown (bold, links, etc.) to HTML via processMessage.
 *
 * All components rendering user-facing text from the API should use this
 * instead of calling processMessage + dangerouslySetInnerHTML directly.
 *
 * @param {{ text: string, className: string, tag: string }} props
 */
const FormattedText = memo((props) => {
  if (!props.text) return null;

  const Tag = props.tag || 'span';

  return (
    <Tag
      className={props.className}
      dangerouslySetInnerHTML={{ __html: processMessage(props.text) }}
    />
  );
});

export default FormattedText;
