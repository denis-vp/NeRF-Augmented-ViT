import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "../NavBar";
import { ThemeProvider, createTheme } from "@mui/material/styles";

function renderNavBar(mode: "light" | "dark", onToggleMode = vi.fn()) {
  const theme = createTheme({ palette: { mode } });
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <NavBar height="8vh" mode={mode} onToggleMode={onToggleMode} />
      </MemoryRouter>
    </ThemeProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
});

describe("NavBar", () => {
  it("renders title and navigation links", () => {
    renderNavBar("light");

    expect(screen.getByText("NeRF-Augmented ViT Training")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Depth-Anything-V2/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tiny-RoMa/i })).toBeInTheDocument();
  });

  it("renders switch as checked when in dark mode", () => {
    renderNavBar("dark");

    const toggle = screen.getByRole("checkbox", { name: "toggle theme mode" });
    expect(toggle).toBeChecked();
  });

  it("renders switch as unchecked when in light mode", () => {
    renderNavBar("light");

    const toggle = screen.getByRole("checkbox", { name: "toggle theme mode" });
    expect(toggle).not.toBeChecked();
  });

  it("calls onToggleMode when switch is clicked", () => {
    const onToggle = vi.fn();
    renderNavBar("light", onToggle);

    const toggle = screen.getByRole("checkbox", { name: "toggle theme mode" });
    fireEvent.click(toggle);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
