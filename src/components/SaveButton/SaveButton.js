import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@RaspberryPiFoundation/design-system-react";
import { SaveIcon } from "../../Icons";
import { syncProject, showLoginToSaveModal } from "../Editor/EditorSlice";
import { isOwner } from "../../utils/projectHelpers";

const SaveButton = ({ className, type = "secondary" }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const loading = useSelector((state) => state.editor.loading);

  const onClickSave = async () => {
    window.plausible("Save button");

    if (isOwner(user, project)) {
      dispatch(
        syncProject("save")({
          project,
          accessToken: user.access_token,
          autosave: false,
        }),
      );
    } else if (user && project.identifier) {
      dispatch(
        syncProject("remix")({ project, accessToken: user.access_token }),
      );
    } else {
      dispatch(showLoginToSaveModal());
    }
  };

  return (
    loading === "success" && (
      <Button
        className={className}
        onClick={onClickSave}
        text={t("header.save")}
        textAlways
        icon={<SaveIcon />}
        type={type}
      />
    )
  );
};

export default SaveButton;
