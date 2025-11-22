import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the title", () => {
    render(<App />);
    const titleImage = screen.getByAltText("Zora's Beat Battle");
    expect(titleImage).toBeInTheDocument();
  });

  it("renders the drop the beat button", () => {
    render(<App />);
    const button = screen.getByAltText(/Start Recording/i); // Matches "Start Recording" or "Stop Recording"
    expect(button).toBeInTheDocument();
  });
});
