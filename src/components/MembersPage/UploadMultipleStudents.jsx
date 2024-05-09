import React, { useState } from "react";
import FileDropzone from "../FileDropzone/FileDropzone";
import TextWithLink from "../SchoolOnboarding/TextWithLink";
import { useTranslation } from "react-i18next";

const UploadMultipleStudents = () => {
  const [csvFile, setCsvFile] = useState();
  const { t } = useTranslation();
  return (
    <>
      <FileDropzone
        allowedFileTypes={[".csv"]}
        clearFilesText={t("membersPage.removeUpload")}
        clearFiles={() => setCsvFile()}
        files={csvFile}
        maxFiles={1}
        successText={t("membersPage.fileUploaded")}
        onDropAccepted={setCsvFile}
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
