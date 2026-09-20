import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ParameterInput from "./ParameterInput";

describe("ParameterInput Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders with correct label and unit", () => {
    render(
      <ParameterInput
        label="Distance"
        value={50}
        min={0}
        max={100}
        step={1}
        unit="km"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Distance")).toBeInTheDocument();
    expect(screen.getByText("km")).toBeInTheDocument();
  });

  it("displays current value in input", () => {
    render(
      <ParameterInput
        label="Test Parameter"
        value={42.5}
        min={0}
        max={100}
        step={0.1}
        onChange={mockOnChange}
        precision={1}
      />
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("42.5");
  });

  it("calls onChange when slider is adjusted", () => {
    render(
      <ParameterInput
        label="Test Parameter"
        value={50}
        min={0}
        max={100}
        step={1}
        onChange={mockOnChange}
      />
    );

    const slider = screen.getByRole("slider") as HTMLInputElement;
    fireEvent.change(slider, { target: { value: "75" } });

    expect(mockOnChange).toHaveBeenCalledWith(75);
  });

  it("calls onChange when input value is changed", () => {
    render(
      <ParameterInput
        label="Test Parameter"
        value={50}
        min={0}
        max={100}
        step={1}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "60" } });

    expect(mockOnChange).toHaveBeenCalledWith(60);
  });

  it("does not accept values outside min/max range", () => {
    render(
      <ParameterInput
        label="Test Parameter"
        value={50}
        min={0}
        max={100}
        step={1}
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "150" } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("respects precision setting", () => {
    const { rerender } = render(
      <ParameterInput
        label="Test Parameter"
        value={3.14159}
        min={0}
        max={10}
        step={0.001}
        onChange={mockOnChange}
        precision={2}
      />
    );

    let input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("3.14");

    rerender(
      <ParameterInput
        label="Test Parameter"
        value={3.14159}
        min={0}
        max={10}
        step={0.001}
        onChange={mockOnChange}
        precision={4}
      />
    );

    input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input.value).toBe("3.1416");
  });
});
