import { useTranslation } from "react-i18next";
import TextList from "../TextList/TextList";
import TextWithBoldSpan from "./TextWithBoldSpan";

const SchoolBeingVerified = () => {
  const { t } = useTranslation();
  return (
    <TextList
      className="school-onboarding-form"
      title={t("schoolBeingVerified.title")}
      text={t("schoolBeingVerified.text")}
      next={t("schoolBeingVerified.next")}
      contact={t("schoolBeingVerified.contact")}
      listItems={{
        item1: t("schoolBeingVerified.listItems.item1"),
        item2: t("schoolBeingVerified.listItems.item2"),
        item3: (
          <TextWithBoldSpan i18nKey="schoolBeingVerified.listItems.item3" />
        ),
      }}
      exploreProjects={{
        text: t("schoolBeingVerified.exploreProjects.text"),
        url: t("schoolBeingVerified.exploreProjects.url"),
        plausible: t("schoolBeingVerified.exploreProjects.plausible"),
      }}
      editorHome={{
        text: t("schoolBeingVerified.editorHome.text"),
        url: t("schoolBeingVerified.editorHome.url"),
        plausible: t("schoolBeingVerified.editorHome.plausible"),
      }}
    />
  );
};

export default SchoolBeingVerified;
