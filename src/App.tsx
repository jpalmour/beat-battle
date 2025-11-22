import "./App.css";
import { TuningMode } from "./components/TuningMode";
import { Game } from "./components/Game";

function App() {
  // Check for tuning mode
  const isTuningMode =
    new URLSearchParams(window.location.search).get("tune") === "true";

  if (isTuningMode) {
    return <TuningMode />;
  }

  return <Game />;
}

export default App;
