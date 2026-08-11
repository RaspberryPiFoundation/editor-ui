import React from "react";
import { render, screen } from "@testing-library/react";
import DesignSystemButton from "./DesignSystemButton";

describe("DesignSystemButton", () => {
  it("always carries the buttonWrapper scoping hook", () => {
    render(<DesignSystemButton text="Save" />);
    expect(screen.getByRole("button")).toHaveClass("buttonWrapper");
  });

  it("never carries btn, which belongs to the Editor Button alone", () => {
    render(<DesignSystemButton text="Save" />);
    expect(screen.getByRole("button")).not.toHaveClass("btn");
  });

  it("sizes to fit by default and fills when asked", () => {
    const { rerender } = render(<DesignSystemButton text="Save" />);
    expect(screen.getByRole("button")).toHaveClass("rpf-button--fit");

    rerender(<DesignSystemButton text="Save" fill />);
    expect(screen.getByRole("button")).toHaveClass("rpf-button--fill");
  });

  describe("when iconOnly", () => {
    it("makes no width claim, so the design system's square sizing wins", () => {
      render(<DesignSystemButton icon={<svg />} iconOnly />);
      const button = screen.getByRole("button");

      expect(button).toHaveClass("rpf-button--icon-only");
      expect(button).not.toHaveClass("rpf-button--fit");
      expect(button).not.toHaveClass("rpf-button--fill");
    });

    it("makes no width claim even when fill is passed", () => {
      render(<DesignSystemButton icon={<svg />} iconOnly fill />);
      const button = screen.getByRole("button");

      expect(button).not.toHaveClass("rpf-button--fill");
      expect(button).not.toHaveClass("rpf-button--fit");
    });
  });
});
