/**
 * Widget Token Store
 * Stores the widget authentication token received from embed.js via postMessage.
 * All API services import getWidgetToken() to include in X-Widget-Token header.
 */

let _widgetToken = '';

export function setWidgetToken(token) {
  _widgetToken = token || '';
}

export function getWidgetToken() {
  return _widgetToken;
}
