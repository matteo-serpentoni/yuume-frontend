import React, { memo } from 'react';
import './SmartBadges.css';

/**
 * SmartBadges — Renders adaptive per-product badge pills.
 *
 * Badge types:
 *  - constraint: user-requested filter (color, size, spec)
 *  - spec: category-relevant specification
 *
 * Badge statuses:
 *  - MATCH: constraint/spec confirmed
 *  - MISMATCH: different value found
 *  - NOT_FOUND: no data available
 */
const BadgeIcons = {
  skin_type: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
    </svg>
  ),
  nickel_free: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ingredient: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  generic: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const SmartBadges = memo(({ badges = [] }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="yuume-smart-badges-bars">
      {badges.map((badge, i) => {
        const statusClass = badge.status?.toLowerCase() || 'match';
        const Icon = BadgeIcons[badge.key] || BadgeIcons.generic;

        // For constraint badges, show ✓ or ✗ based on status
        const isConstraint = badge.type === 'constraint';
        const statusIcon = statusClass === 'match' ? '✓' : statusClass === 'mismatch' ? '✗' : null;

        return (
          <div
            key={i}
            className={`yuume-smart-badge-bar ${statusClass} ${badge.key || ''}`}
            title={`${badge.label}: ${badge.value}`}
          >
            {isConstraint && statusIcon && (
              <div className="badge-icon-container">
                <span className="badge-status-icon">{statusIcon}</span>
              </div>
            )}
            <div className="badge-text">
              <span className="badge-label">{badge.label}:</span>
              <span className="badge-value">{badge.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default SmartBadges;
