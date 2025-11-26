import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VoiceTraining } from "./VoiceTraining";

describe("VoiceTraining", () => {
  it("renders the song title", () => {
    render(<VoiceTraining songId="happy-birthday" />);
    const title = screen.getByText("Happy Birthday");
    expect(title).toBeInTheDocument();
  });

  it("renders the grand staff notation", () => {
    render(<VoiceTraining songId="happy-birthday" />);
    const staffContainer = document.querySelector(".music-staff-container");
    expect(staffContainer).toBeInTheDocument();
  });

  it("renders page navigation info", () => {
    render(<VoiceTraining songId="happy-birthday" />);
    // Use getAllByText since "Page 1" appears in multiple places (header and footer)
    const pageElements = screen.getAllByText(/Page 1/);
    expect(pageElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Grand Staff/)).toBeInTheDocument();
  });

  it("renders the drop the beat button", () => {
    render(<VoiceTraining songId="happy-birthday" />);
    const button = screen.getByAltText(/Start Recording/i);
    expect(button).toBeInTheDocument();
  });

  it("falls back to happy birthday for unknown song", () => {
    render(<VoiceTraining songId="unknown-song" />);
    const title = screen.getByText("Happy Birthday");
    expect(title).toBeInTheDocument();
  });
});
