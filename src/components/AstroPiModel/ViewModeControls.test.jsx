import { fireEvent, render } from "@testing-library/react";
import ViewModeControls from "./ViewModeControls";

describe("ViewModeControls", () => {
  const renderViewModeControls = (initIs3d = true) => {
    let is3d = initIs3d;
    const setIs3d = () => {
      is3d = !is3d;
    };
    const props = { is3d, setIs3d };
    const container = render(<ViewModeControls {...props} />);
    return { container };
  };

  test("renders", () => {
    const { container } = renderViewModeControls();
    container.getByRole("button", {
      text: "output.senseHat.view.toggleTo2D",
    });
  });

  test("clicking button changes mode", () => {
    const { container } = renderViewModeControls();
    fireEvent.click(
      container.getByRole("button", {
        name: "output.senseHat.view.toggleTo2D",
      }),
    );
    container.getByRole("button", {
      text: "output.senseHat.view.toggleTo3D",
    });
  });
});
