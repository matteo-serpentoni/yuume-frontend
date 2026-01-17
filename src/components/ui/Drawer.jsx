import React from 'react';
import ReactDOM from 'react-dom';
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
  portalId = 'yuume-drawer-portal',
}) => {
  const [target, setTarget] = React.useState(null);

  React.useLayoutEffect(() => {
    const el = document.getElementById(portalId);
    if (el) {
      setTarget(el);
    } else {
      console.warn(`⚠️ [Drawer] Portal target #${portalId} not found, falling back to body`);
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
            className="yuume-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Clipping Container */}
          <div className="yuume-drawer-container">
            {/* Drawer Shell */}
            <motion.div
              className="yuume-drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className={`yuume-drawer-header ${title ? 'has-title' : ''}`}>
                <div className="yuume-drawer-handle" onClick={onClose} />
                {title && <h3 className="yuume-drawer-title">{title}</h3>}
                <button className="yuume-drawer-close" onClick={onClose}>
                  ✕
                </button>
              </div>

              <div className="yuume-drawer-content">{children}</div>

              {footer && <div className="yuume-drawer-footer">{footer}</div>}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(drawerContent, target);
};

export default Drawer;
