import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as i18nCountries from "i18n-iso-countries";

const EducationIndex = () => {
  const { i18n } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const language = i18n.language;
    const languageFile = require(`i18n-iso-countries/langs/${language}.json`);

    i18nCountries.registerLocale(languageFile);

    const object = i18nCountries.getNames(language, { select: "official" });
    const entries = Object.entries(object);

    entries.sort((a, b) => a[1].localeCompare(b[1]));
    setCountries(entries);
  }, [i18n]);

  const handleFormChange = (key) => (event) => {
    const value = event.target.value;
    setFormData((state) => ({ ...state, [key]: value }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
  };

  return (
    <>
      <h1>Create a school</h1>

      <form onSubmit={handleFormSubmit}>
        <label>Name:</label>
        <input
          required
          name="name"
          type="text"
          value={formData.name || ""}
          onChange={handleFormChange("name")}
        />
        <br />

        <label>Address Line 1:</label>
        <input
          required
          name="address_line_1"
          type="text"
          value={formData.address_line_1 || ""}
          onChange={handleFormChange("address_line_1")}
        />
        <br />

        <label>Address Line 2:</label>
        <input
          name="address_line_2"
          type="text"
          value={formData.address_line_2 || ""}
          onChange={handleFormChange("address_line_2")}
        />
        <br />

        <label>City:</label>
        <input
          required
          name="municipality"
          type="text"
          value={formData.municipality || ""}
          onChange={handleFormChange("municipality")}
        />
        <br />

        <label>County:</label>
        <input
          name="administrative_area"
          type="text"
          value={formData.administrative_area || ""}
          onChange={handleFormChange("administrative_area")}
        />
        <br />

        <label>Post Code:</label>
        <input
          name="postal_code"
          type="text"
          value={formData.postal_code || ""}
          onChange={handleFormChange("postal_code")}
        />
        <br />

        <label>Country:</label>
        <select
          required
          name="country_code"
          value={formData.country_code || ""}
          onChange={handleFormChange("country_code")}
        >
          <option value="" disabled>
            Select a country
          </option>

          {countries.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <br />

        <input type="submit" value="Submit" />
      </form>
    </>
  );
};

export default EducationIndex;
