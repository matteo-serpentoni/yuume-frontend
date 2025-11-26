import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import WidgetApp from "./WidgetApp";

const rootElement = document.getElementById("root");
const widgetRootElement = document.getElementById("widget-root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} else if (widgetRootElement) {
  const root = ReactDOM.createRoot(widgetRootElement);
  root.render(<WidgetApp />);
}
