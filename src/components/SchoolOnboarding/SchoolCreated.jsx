import { useTranslation } from "react-i18next";
import TextList from "../TextList/TextList";
import TexListTickIcon from "../../assets/icons/tick-teal.svg";
import TextListImageExample from "../../assets/images/school-created.svg";

const SchoolCreated = () => {
  const { t } = useTranslation();
  return (
    <TextList
      title={t("schoolCreated.title")}
      titleIcon={TexListTickIcon}
      text={t("schoolCreated.text")}
      next={t("schoolCreated.next")}
      imageSrc={TextListImageExample}
      imageAlt=""
      contact={"schoolCreated.contact"}
      listItems={{
        item1:
          "Thank you for providing the all the information needed to set up your school account.",
        item2:
          "We will verify your school. This may take up to 5 working days. You'll receive a confirmation email once it's been verified.",
        item3:
          "Once your school has been verified, you will be able to log in to the Code Editor with your Raspberry Pi Foundation account and access your school dashboard.",
      }}
      exploreProjects={{
        text: t("schoolCreated.exploreProjects.text"),
        url: t("schoolCreated.exploreProjects.url"),
        plausible: t("schoolCreated.exploreProjects.plausible"),
      }}
      editorHome={{
        text: t("schoolCreated.editorHome.text"),
        url: t("schoolCreated.editorHome.url"),
        plausible: t("schoolCreated.editorHome.plausible"),
      }}
    />
  );
};

export default SchoolCreated;
