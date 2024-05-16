import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import FileDropzone from "../FileDropzone/FileDropzone";
import TextWithLink from "../SchoolOnboarding/TextWithLink";
import { Trans, useTranslation } from "react-i18next";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { useDispatch, useSelector } from "react-redux";
import { createNewStudent } from "../../redux/reducers/schoolReducers";

const STUDENT_REQUIRED_FIELDS = ["name", "username", "password"];

const UploadMultipleStudents = () => {
  const school = useSelector((state) => state.school);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const [csvFile, setCsvFile] = useState();
  const files = csvFile ? [csvFile] : [];
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState([]);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    setStudents([]);
    setErrors([]);
    if (csvFile) {
      Papa.parse(csvFile, {
        complete: (result) => {
          const csvStudents = result.data;
          csvStudents.forEach((student, index) => {
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
            } else {
              const filteredStudent = filterStudentData(student);
              setStudents((students) => [...students, filteredStudent]);
            }
          });
        },
        header: true,
      });
    }
  }, [csvFile]);

  const filterStudentData = (student) =>
    Object.fromEntries(
      Object.entries(student).filter(([field]) =>
        STUDENT_REQUIRED_FIELDS.includes(field),
      ),
    );

  const createStudents = () => {
    students.forEach((student) => {
      dispatch(createNewStudent({ student, schoolId: school.id, accessToken }));
    });
  };

  return (
    <>
      <h3>{t("membersPage.createMultipleStudents.title")}</h3>
      <p>
        <Trans
          i18nKey="membersPage.createMultipleStudents.explanation"
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          components={[<a href="/students.csv" download />]}
        />
      </p>
      {errors.map((error, i) => (
        <ErrorMessage key={i} error={error} />
      ))}
      <FileDropzone
        allowedFileTypes={{ "text/csv": [".csv"] }}
        clearFilesText={t("membersPage.createMultipleStudents.removeUpload")}
        clearFiles={() => setCsvFile()}
        files={files}
        maxFiles={1}
        successText={t("membersPage.createMultipleStudents.fileUploaded")}
        onDropAccepted={(files) => {
          setCsvFile(files[0]);
        }}
        hintText={
          <TextWithLink
            linkClassName="file-dropzone__link"
            i18nKey="membersPage.createMultipleStudents.csvUploadHint"
            to=""
          />
        }
      />
      <DesignSystemButton
        text={t("membersPage.createMultipleStudents.createStudents")}
        onClick={createStudents}
        disabled={!csvFile || students.length === 0 || errors.length > 0}
      />
    </>
  );
};

export default UploadMultipleStudents;
