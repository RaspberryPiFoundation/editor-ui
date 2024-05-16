import React from "react";
import { useSelector } from "react-redux";
import "material-symbols";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import LogoutButton from "../Login/LogoutButton";
import "../../assets/stylesheets/SchoolDashboard.scss";
import useSchool from "../../hooks/useSchool";
import {
  getUserRoles,
  isSchoolStudent,
  isSchoolOwner,
  isSchoolTeacher,
} from "../../utils/userRoleHelper";

const SchoolDashboard = () => {
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user);
  const userRoles = getUserRoles(user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const school = useSelector((state) => state.school);

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  useSchool({
    id: identifier,
    accessToken,
  });

  if (!user) return "Not logged in";

  if (school.loading) return "Loading";

  if (school.error) return "Error loading school";

  return (
    <div className="school-dashboard__header">
      {(isSchoolOwner(userRoles) || isSchoolTeacher(userRoles)) && (
        <Link
          className="school-dashboard__header-home-link"
          to={`/${locale}/education`}
        >
          <span className="material-symbols-outlined">chevron_left</span>{" "}
          {t("schoolDashboard.codeEditorHome")}
        </Link>
      )}
      <div className="school-dashboard__header-content">
        <h1 className="school-dashboard__header-title">{school.name}</h1>
        <div className="school-dashboard__header-actions">
          {(isSchoolOwner(userRoles) || isSchoolTeacher(userRoles)) && (
            <DesignSystemButton
              href={`/${locale}/members`}
              text={t("schoolDashboard.manageMembers")}
              icon="group"
            />
          )}
          {isSchoolStudent(userRoles) && (
            <LogoutButton type="secondary" user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
