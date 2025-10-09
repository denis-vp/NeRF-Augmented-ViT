import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageOutput from "../ImageOutput";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const renderWithTheme = (ui: React.ReactNode) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("ImageOutput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders placeholder when no image and not loading", () => {
    renderWithTheme(<ImageOutput />);
    expect(screen.getByText("No output image")).toBeInTheDocument();
  });

  it("shows loading spinner when loading is true", () => {
    renderWithTheme(<ImageOutput loading />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders image when imageUrl is provided", () => {
    renderWithTheme(<ImageOutput imageUrl="https://example.com/image.png" />);
    const img = screen.getByAltText("Output") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://example.com/image.png");
  });

  it("shows download button when imageUrl is present and not loading", () => {
    renderWithTheme(<ImageOutput imageUrl="https://example.com/image.png" />);
    expect(
      screen.getByRole("button", { name: /download/i })
    ).toBeInTheDocument();
  });

  it("clicking download button triggers download logic", () => {
    const clickMock = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderWithTheme(<ImageOutput imageUrl="https://example.com/image.png" />);

    const button = screen.getByRole("button", { name: /download/i });
    fireEvent.click(button);

    expect(clickMock).toHaveBeenCalled();

    clickMock.mockRestore();
  });
});
