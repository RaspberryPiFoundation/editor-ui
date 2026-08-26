import { useSelector } from "react-redux";

/**
 * Preview mode is active only when `preview` is on and `readOnly` is off.
 * If both are set, `readOnly` wins and this returns false.
 */
export const selectPreviewMode = (state) =>
  Boolean(state.editor?.preview && !state.editor?.readOnly);

export const usePreviewMode = () => useSelector(selectPreviewMode);
