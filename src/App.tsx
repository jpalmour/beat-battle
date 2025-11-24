import "./App.css";
import { TuningMode } from "./components/TuningMode";
import { Game } from "./components/Game";

function App() {
  const tuneParam = new URLSearchParams(window.location.search).get("tune");
  const tuneMode =
    tuneParam === "manual"
      ? "manual"
      : tuneParam === "auto" || tuneParam === "true" || tuneParam === "1"
        ? "auto"
        : null;

  if (tuneMode) {
    return <TuningMode mode={tuneMode} />;
  }

  return <Game />;
}

export default App;
