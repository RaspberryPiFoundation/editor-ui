import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/SchoolOnboarding.scss";
import LogoLM from "../LogoLM/LogoLM";
import MultiStepForm from "./MultistepForm";
import { useSelector } from "react-redux";
import { login } from "../../utils/login";
import { useLocation } from "react-router-dom";
import useSchool from "../../hooks/useSchool";
import SchoolBeingVerified from "./SchoolBeingVerified";
import SchoolAlreadyExists from "./SchoolAlreadyExists";

const SchoolOnboarding = () => {
  const isLoadingUser = useSelector((state) => state.auth.isLoadingUser);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const school = useSelector((state) => state.school);
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    if (!isLoadingUser && !accessToken) {
      login({ location });
    }
  });

  useSchool({ accessToken });

  return (
    user && (
      <div
        className="school-onboarding-wrapper"
        data-testid="school-onboarding"
      >
        <LogoLM />
        {school.id ? (
          school.verified_at ? (
            <SchoolAlreadyExists />
          ) : (
            <SchoolBeingVerified />
          )
        ) : (
          school.loading === false && <MultiStepForm />
        )}
      </div>
    )
  );
};

export default SchoolOnboarding;
