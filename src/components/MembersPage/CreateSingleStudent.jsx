import { TextInput } from "@raspberrypifoundation/design-system-react";
import React from "react";
import { useTranslation } from "react-i18next";
import PasswordField from "../PasswordField/PasswordField";

const CreateSingleStudent = () => {
  const { t } = useTranslation();
  return (
    <>
      <h3>{t("membersPage.createSingleStudent.title")}</h3>
      <p>{t("membersPage.createSingleStudent.explanation")}</p>
      <TextInput
        label={t("membersPage.createSingleStudent.name")}
        hint={t("membersPage.createSingleStudent.nameHint")}
        id="name"
        name="name"
        fullWidth={true}
      />
      <TextInput
        label={t("membersPage.createSingleStudent.username")}
        hint={t("membersPage.createSingleStudent.usernameHint")}
        id="username"
        name="username"
        fullWidth={true}
      />
      <PasswordField
        label={t("membersPage.createSingleStudent.password")}
        hint={t("membersPage.createSingleStudent.passwordHint")}
        name="password"
        id="password"
      />
    </>
  );
};

export default CreateSingleStudent;
