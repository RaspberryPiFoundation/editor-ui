import { TextInput } from "@raspberrypifoundation/design-system-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import PasswordField from "../PasswordField/PasswordField";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { createNewStudent } from "../../redux/reducers/schoolReducers";
import { useDispatch, useSelector } from "react-redux";

const CreateSingleStudent = () => {
  const school = useSelector((state) => state.school);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const [student, setStudent] = useState({});
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const onChange = (e) => {
    const { name, value } = e.target;
    setStudent((student) => ({ ...student, [name]: value }));
  };

  const createStudent = () => {
    dispatch(createNewStudent({ student, schoolId: school.id, accessToken }));
  };

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
        onChange={onChange}
      />
      <TextInput
        label={t("membersPage.createSingleStudent.username")}
        hint={t("membersPage.createSingleStudent.usernameHint")}
        id="username"
        name="username"
        fullWidth={true}
        onChange={onChange}
      />
      <PasswordField
        label={t("membersPage.createSingleStudent.password")}
        hint={t("membersPage.createSingleStudent.passwordHint")}
        name="password"
        id="password"
        onChange={onChange}
      />
      <DesignSystemButton text="Create student" onClick={createStudent} />
    </>
  );
};

export default CreateSingleStudent;
