import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "material-symbols";
import { getSchool } from "../../utils/apiCallHandler";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import LogoutButton from "../Login/LogoutButton";
import "../../assets/stylesheets/SchoolDashboard.scss";

const SchoolDashboard = () => {
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user);
  const userRoles = useSelector(
    (state) => state.auth.user?.profile.roles,
  ).split(",");
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const [school, setSchool] = useState();
  const [apiResponseCode, setApiResponseCode] = useState();

  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const school = await getSchool(identifier, accessToken);
          setSchool(school);
        } catch (error) {
          setApiResponseCode(error.response.status);
        }
      };
      fetchData();
    }
  }, [user, identifier, accessToken]);

  if (!user) return "Not logged in";

  if (apiResponseCode === 403) return "Not authorised";

  if (apiResponseCode === 404) return "School not found";

  if (!school) return "Loading";

  return (
    <div className="school-dashboard__header">
      {(userRoles.includes("school-owner") ||
        userRoles.includes("school-teacher")) && (
        <Link
          className="school-dashboard__header-home-link"
          to={`/${locale}/education`}
        >
          <span class="material-symbols-outlined">chevron_left</span>{" "}
          {t("schoolDashboard.codeEditorHome")}
        </Link>
      )}
      <div className="school-dashboard__header-content">
        <h1 className="school-dashboard__header-title">{school.name}</h1>
        <div className="school-dashboard__header-actions">
          {(userRoles.includes("school-owner") ||
            userRoles.includes("school-teacher")) && (
            <DesignSystemButton
              href={`/${locale}/members`}
              text={t("schoolDashboard.manageMembers")}
              icon="group"
            />
          )}
          {userRoles.includes("school-student") && (
            <LogoutButton type="secondary" user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
