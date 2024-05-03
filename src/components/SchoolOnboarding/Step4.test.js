import { render, screen, fireEvent } from "@testing-library/react";
import Step4 from "./Step4";

describe("When localStorage is empty", () => {
  beforeEach(() => {
    render(
      <Step4 stepIsValid={jest.fn} showInvalidFields={false} apiErrors={{}} />,
    );
  });

  test("it renders", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step4.title"),
    ).toBeInTheDocument();
  });

  test("the name is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolName"),
    ).toHaveValue("");
  });

  test("the website is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolWebsite"),
    ).toHaveValue("");
  });

  test("the first line of address is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolAddress1"),
    ).toHaveValue("");
  });

  test("the second line of address is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolAddress2"),
    ).toHaveValue("");
  });

  test("the city is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolCity"),
    ).toHaveValue("");
  });

  test("the state is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolState"),
    ).toHaveValue("");
  });

  test("the postcode is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolPostcode"),
    ).toHaveValue("");
  });

  test("the country is blank", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolCountry"),
    ).toHaveValue("");
  });

  test("the URN field isn't visible by default", () => {
    expect(
      screen.queryByLabelText("schoolOnboarding.steps.step4.schoolUrn"),
    ).not.toBeInTheDocument();
  });

  test("the URN is blank and visible when the country is set to GB", () => {
    let inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolCountry",
    );
    fireEvent.change(inputElement, { target: { value: "GB" } });
    expect(
      screen.getByLabelText(/schoolOnboarding.steps.step4.schoolUrn/),
    ).toHaveValue("");
  });

  test("typing a name updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolName",
    );
    fireEvent.change(inputElement, {
      target: { value: "Raspberry Pi School of Drama" },
    });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4.name,
    ).toBe("Raspberry Pi School of Drama");
  });

  test("typing a website updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolWebsite",
    );
    fireEvent.change(inputElement, {
      target: { value: "https://www.schoolofdrama.org" },
    });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4.website,
    ).toBe("https://www.schoolofdrama.org");
  });

  test("typing the first line of address updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolAddress1",
    );
    fireEvent.change(inputElement, { target: { value: "123 Drama Street" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4
        .address_line_1,
    ).toBe("123 Drama Street");
  });

  test("typing the second line of address updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolAddress2",
    );
    fireEvent.change(inputElement, { target: { value: "Dramaville" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4
        .address_line_2,
    ).toBe("Dramaville");
  });

  test("typing the city updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolCity",
    );
    fireEvent.change(inputElement, { target: { value: "Drama City" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4.municipality,
    ).toBe("Drama City");
  });

  test("typing the state updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolState",
    );
    fireEvent.change(inputElement, { target: { value: "Dramashire" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4
        .administrative_area,
    ).toBe("Dramashire");
  });

  test("typing the postcode updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolPostcode",
    );
    fireEvent.change(inputElement, { target: { value: "DR1 4MA" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4.postal_code,
    ).toBe("DR1 4MA");
  });

  test("typing the country updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolCountry",
    );
    fireEvent.change(inputElement, { target: { value: "GB" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4.country_code,
    ).toBe("GB");
  });

  test("typing the URN updates localStorage", () => {
    let inputElement = screen.getByLabelText(
      "schoolOnboarding.steps.step4.schoolCountry",
    );
    fireEvent.change(inputElement, { target: { value: "GB" } });
    inputElement = screen.getByLabelText(
      /schoolOnboarding.steps.step4.schoolUrn/,
    );
    fireEvent.change(inputElement, { target: { value: "dr4m45ch001" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_4.reference,
    ).toBe("dr4m45ch001");
  });
});

describe("When previous data is in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        step_4: {
          name: "Raspberry Pi School of Drama",
          website: "https://www.schoolofdrama.org",
          address_line_1: "123 Drama Street",
          address_line_2: "Dramaville",
          municipality: "Drama City",
          administrative_area: "Dramashire",
          postal_code: "DR1 4MA",
          country_code: "GB",
          reference: "dr4m45ch001",
        },
      }),
    );
    render(
      <Step4 stepIsValid={jest.fn} showInvalidFields={false} apiErrors={{}} />,
    );
  });

  test("the name is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolName"),
    ).toHaveValue("Raspberry Pi School of Drama");
  });

  test("the website is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolWebsite"),
    ).toHaveValue("https://www.schoolofdrama.org");
  });

  test("the first line of address is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolAddress1"),
    ).toHaveValue("123 Drama Street");
  });

  test("the second line of address is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolAddress2"),
    ).toHaveValue("Dramaville");
  });

  test("the city is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolCity"),
    ).toHaveValue("Drama City");
  });

  test("the state is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolState"),
    ).toHaveValue("Dramashire");
  });

  test("the postcode is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolPostcode"),
    ).toHaveValue("DR1 4MA");
  });

  test("the country is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step4.schoolCountry"),
    ).toHaveValue("GB");
  });

  test("the URN is populated correctly", () => {
    expect(
      screen.getByLabelText(/schoolOnboarding.steps.step4.schoolUrn/),
    ).toHaveValue("dr4m45ch001");
  });
});

describe("When errors are provided", () => {
  beforeEach(() => {
    render(
      <Step4 stepIsValid={jest.fn} showInvalidFields={true} apiErrors={{}} />,
    );
  });

  test("the error message shows", () => {
    expect(
      screen.queryByText(
        "schoolOnboarding.steps.step4.validation.errors.message",
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        "schoolOnboarding.steps.step4.validation.errors.schoolName",
      ),
    ).toBeInTheDocument();
  });
});

describe("When an api validation is returned", () => {
  beforeEach(() => {
    render(
      <Step4
        stepIsValid={jest.fn}
        showInvalidFields={true}
        apiErrors={{
          website: "must be a valid URL",
        }}
      />,
    );
  });

  test("the validation message shows", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step4.schoolWebsite"),
    ).toBeInTheDocument();
  });
});

describe("When a general api error is returned", () => {
  beforeEach(() => {
    render(
      <Step4
        stepIsValid={jest.fn}
        showInvalidFields={true}
        apiErrors={{
          401: ["You must be logged in to create a school."],
        }}
      />,
    );
  });

  test("the error message shows", () => {
    expect(
      screen.queryByText("401 You must be logged in to create a school."),
    ).toBeInTheDocument();
  });
});

describe("When a country other than GB data is in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        step_4: {
          name: "Raspberry Pi School of Drama",
          website: "https://www.schoolofdrama.org",
          address_line_1: "123 Drama Street",
          address_line_2: "Dramaville",
          municipality: "Drama City",
          administrative_area: "Dramashire",
          postal_code: "DR1 4MA",
          country_code: "US",
          reference: "dr4m45ch001",
        },
      }),
    );
    render(
      <Step4 stepIsValid={jest.fn} showInvalidFields={true} apiErrors={{}} />,
    );
  });

  test("the URN is not visible", () => {
    expect(
      screen.queryByLabelText(/schoolOnboarding.steps.step4.schoolUrn/),
    ).not.toBeInTheDocument();
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
