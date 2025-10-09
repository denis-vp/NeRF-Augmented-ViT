import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageInput from "../ImageInput";
import { ThemeProvider, createTheme } from "@mui/material/styles";

global.URL.createObjectURL = vi.fn(() => "blob:mock-url");

const renderWithTheme = (ui: React.ReactNode) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const mockFile = new File(["test"], "test.png", { type: "image/png" });

describe("ImageInput", () => {
  let onImageChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onImageChange = vi.fn();
  });

  it("renders default dropzone text when no image is present", () => {
    renderWithTheme(<ImageInput onImageChange={onImageChange} />);
    expect(screen.getByText("Drop Image Here")).toBeInTheDocument();
  });

  it("renders image and filename when props are given", () => {
    renderWithTheme(
      <ImageInput
        imageUrl="https://example.com/image.png"
        fileName="image.png"
        onImageChange={onImageChange}
      />
    );
    expect(screen.getByAltText("Input")).toHaveAttribute("src", "https://example.com/image.png");
    expect(screen.getByText("image.png")).toBeInTheDocument();
  });

  it("calls onImageChange when file is selected via input", () => {
    const { container } = renderWithTheme(<ImageInput onImageChange={onImageChange} />);
    const input = container.querySelector('input[type="file"]')!;

    fireEvent.change(input, {
      target: { files: [mockFile] },
    });

    expect(onImageChange).toHaveBeenCalledWith(mockFile, "blob:mock-url");
  });

  it("calls onImageChange when image is dropped", () => {
    const { container } = renderWithTheme(<ImageInput onImageChange={onImageChange} />);
    const dropTarget = container.querySelector(".MuiPaper-root")!;

    fireEvent.drop(dropTarget, {
      dataTransfer: {
        files: [mockFile],
      },
    });

    expect(onImageChange).toHaveBeenCalledWith(mockFile, "blob:mock-url");
  });

  it("clicking the container triggers the hidden file input", () => {
    const { container } = renderWithTheme(<ImageInput onImageChange={onImageChange} />);
    const input = container.querySelector('input[type="file"]')!;
    const clickSpy = vi.spyOn(input, "click");

    const wrapper = container.querySelector(".MuiPaper-root")!;
    fireEvent.click(wrapper);

    expect(clickSpy).toHaveBeenCalled();
  });
});
