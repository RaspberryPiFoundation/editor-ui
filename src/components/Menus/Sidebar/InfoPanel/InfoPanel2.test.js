import { render, screen } from "@testing-library/react";
import InfoPanel from "./InfoPanel";
// import { useTranslation } from "react-i18next";

// jest.mock("react-i18next", () => ({
//   useTranslation: jest.fn().mockReturnValue({
//     t: (key) => key,
//   }),
// }));

describe("InfoPanel", () => {
  beforeEach(() => {
    render(<InfoPanel />);
  });

  test("renders the panel heading", () => {
    expect(screen.getByText("infoPanel.info")).toBeInTheDocument();
  });

  test("renders the information text", () => {
    expect(screen.getByText("sidebar.information_text")).toBeInTheDocument();
  });

  test("renders the charity text", () => {
    expect(screen.getByText("sidebar.charity")).toBeInTheDocument();
  });

  test("renders the correct links", () => {
    const links = [
      {
        id: "feedback",
        href: "https://form.raspberrypi.org/f/code-editor-feedback",
      },
      {
        id: "privacy",
        href: "https://www.raspberrypi.org/privacy/child-friendly/",
      },
      { id: "cookies", href: "https://www.raspberrypi.org/cookies/" },
      {
        id: "accessibility",
        href: "https://www.raspberrypi.org/accessibility/",
      },
      { id: "safeguarding", href: "https://www.raspberrypi.org/safeguarding/" },
    ];

    links.forEach((link) => {
      const linkElement = screen.getByText(`sidebar.${link.id}`);
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", link.href);
      expect(linkElement).toHaveAttribute("target", "_blank");
      expect(linkElement).toHaveAttribute("rel", "noreferrer");
    });
  });
});
