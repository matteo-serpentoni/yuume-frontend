import React from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line no-unused-vars -- motion.div used in JSX
import { motion, AnimatePresence } from 'framer-motion';
import './Drawer.css';

/**
 * Generic Ethereal Drawer Component
 *
 * @param {boolean} isOpen - Whether the drawer is visible
 * @param {function} onClose - Function to call when the drawer should close
 * @param {React.ReactNode} children - Main content of the drawer
 * @param {React.ReactNode} footer - Optional footer content
 * @param {string} portalId - The ID of the DOM element to portal into
 */
const Drawer = ({
  isOpen,
  onClose,
  title, // Added title prop
  children,
  footer,
  portalId = 'jarbris-drawer-portal',
}) => {
  const [target, setTarget] = React.useState(null);

  React.useLayoutEffect(() => {
    const el = document.getElementById(portalId);
    if (el) {
      setTarget(el);
    } else {
      setTarget(document.body);
    }
  }, [portalId]);

  if (!target) return null;

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="jarbris-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Clipping Container */}
          <div className="jarbris-drawer-container">
            {/* Drawer Shell */}
            <motion.div
              className="jarbris-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={`jarbris-drawer-header ${title ? 'has-title' : ''}`}>
                <div className="jarbris-drawer-handle" onClick={onClose} />
                {title && <h3 className="jarbris-drawer-title">{title}</h3>}
                <button className="jarbris-drawer-close" onClick={onClose}>
                  ✕
                </button>
              </div>

              <div className="jarbris-drawer-content">{children}</div>

              {footer && <div className="jarbris-drawer-footer">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(drawerContent, target);
};

export default Drawer;
