import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import FileDropzone from "../FileDropzone/FileDropzone";
import TextWithLink from "../SchoolOnboarding/TextWithLink";
import { Trans, useTranslation } from "react-i18next";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

const STUDENT_REQUIRED_FIELDS = ["name", "username", "temporary_password"];

const UploadMultipleStudents = () => {
  const [csvFile, setCsvFile] = useState();
  const files = csvFile ? [csvFile] : [];
  const [errors, setErrors] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    setErrors([]);
    if (csvFile) {
      Papa.parse(csvFile, {
        complete: (result) => {
          const students = result.data;
          students.forEach((student, index) => {
            const missingFields = STUDENT_REQUIRED_FIELDS.filter(
              (field) => !student[field] || student[field].trim === "",
            );
            if (missingFields.length) {
              const errorMessage = `Student${
                student.name ? ` ${student.name}` : ""
              } on line ${
                index + 2
              } is missing the following fields: ${missingFields.join(", ")}`;
              setErrors((errors) => [...errors, errorMessage]);
            }
          });
        },
        header: true,
      });
    }
  }, [csvFile]);

  return (
    <>
      <h3>{t("membersPage.bulkCreateHeading")}</h3>
      <p>
        <Trans
          i18nKey="membersPage.bulkCreateHint"
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          components={[<a href="/students.csv" download />]}
        />
      </p>
      {errors.map((error) => (
        <ErrorMessage error={error} />
      ))}
      <FileDropzone
        allowedFileTypes={[".csv"]}
        clearFilesText={t("membersPage.removeUpload")}
        clearFiles={() => setCsvFile()}
        files={files}
        maxFiles={1}
        successText={t("membersPage.fileUploaded")}
        onDropAccepted={(files) => setCsvFile(files[0])}
        hintText={
          <TextWithLink
            linkClassName="file-dropzone__link"
            i18nKey="membersPage.csvUploadHint"
            to=""
          />
        }
      />
    </>
  );
};

export default UploadMultipleStudents;
