import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useTranslation } from "react-i18next";
import "../../assets/stylesheets/EducationLandingPage.scss";
import TextImage from "../TextImage/TextImage";
import editorScreenshot from "../../assets/images/editor.png";
import editorOutput from "../../assets/images/output.png";
import classroom from "../../assets/images/classroom.jpg";
import placeholder from "../../assets/images/hero-placeholder.svg";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import Hero from "../Hero/Hero";

const EducationLandingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  // const [cookies] = useCookies(["theme"]);
  const locale = i18n.language;
  // const isDarkMode =
  //   cookies.theme === "dark" ||
  //   (!cookies.theme &&
  //     window.matchMedia("(prefers-color-scheme:dark)").matches);

  const onClickPlausible = (msg) => () => {
    if (window.plausible) {
      window.plausible(msg);
    }
  };

  useEffect(() => {
    if (user) {
      navigate(`/${locale}/projects`);
    }
  }, [user, locale, navigate]);

  return (
    <div className="education-landing-page-wrapper">
      <Hero />
      <TextImage
        title="An IDE designed for learners"
        text="Tailored specifically to young people's needs, our integrated development environment (IDE) helps make learning text-based programming simple and accessible for children aged 9 and up. It’s safe, age-appropriate, and suitable for use in the classroom."
        imageAlt="Editor screenshot"
        imageSrc={editorScreenshot}
      />
      <TextImage
        title="All features, totally free"
        text="Create custom coding projects for your students to work on. Help them code their own games and art using Python, or design websites in HTML/CSS/JavaScript.
        Your students can get creative with code with our wide choice of Python libraries!"
        imageAlt="Editor output"
        imageSrc={editorOutput}
        imagePosition="right"
      />
      <TextImage
        title="Create engaging coding lessons"
        text="Create custom coding projects for your students to work on. Help them code their own games and art using Python, or design websites in HTML/CSS/JavaScript.

        Your students can get creative with code with our wide choice of Python libraries!
        "
        imageAlt="Editor screenshot"
        imageSrc={placeholder}
      />
      <TextImage
        title="Give students personalised feedback"
        text="Easily check your students’ progress, view their coding projects, and share individual, instant feedback with each student to keep them on track."
        imageAlt="Editor output"
        imageSrc={placeholder}
      />
      <TextImage
        title="Simple and easy class managemen"
        text="Like the Editor itself, we’ve kept our educator interface clean, simple, and easy to use following feedback from teachers. Create and manage student accounts easily. You can organise your students into classes and help them reset their passwords quickly."
        imageAlt="Editor output"
        imageSrc={placeholder}
      />
      <TextImage
        title="Safe and private by design"
        text="Accounts for education are designed to be safe for students of all ages. 
        We take safeguarding seriously, with one-way feedback to students, visibility of their work at all times, verified school accounts, and an audit history of communication with students. 
        
        In line with best practice codes protecting children online, we minimise our data capture so that we have just enough to keep students safe."
        imageAlt="Editor output"
        imageSrc={editorOutput}
      />
      <TextImage
        title="What do people say about our Editor?"
        text="“We have used it and love it, the fact that it is both for HTML / CSS and then Python is great as the students have a one-stop shop for IDEs.” – Lee Willis, Head of ICT and Computing, Newcastle High School for Girls

        “The class management and feedback features they're working on at the moment look really promising.” – Pete Dring, Head of Computing, Fulford School"
        imageAlt="Classroom"
        imageSrc={classroom}
      />
      <div className="education-landing-page__get-started">
        <h2 className="school-onboarding__subtitle">
          {t("educationLandingPage.title")}
        </h2>
        <DesignSystemButton
          className="landing-page__button"
          href={`/${locale}/`}
          text={t("educationLandingPage.start")}
          textAlways
          onClick={onClickPlausible("Ecreate your school accout")}
        />
      </div>
    </div>
  );
};

export default EducationLandingPage;
