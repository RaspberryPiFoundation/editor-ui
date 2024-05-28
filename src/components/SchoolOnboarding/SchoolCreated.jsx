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
        item1: t("schoolCreated.listItems.item1"),
        item2: t("schoolCreated.listItems.item2"),
        item3: t("schoolCreated.listItems.item3"),
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
