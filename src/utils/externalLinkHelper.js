import { useState } from "react";
import { useDispatch } from "react-redux";

import {
  setError,
  setErrorLine,
  setErrorLineNumber,
  triggerCodeRun,
} from "../redux/EditorSlice";

const domain = "https://rpf.io/";
const host = process.env.PUBLIC_URL || "http://localhost:3011";
const rpfDomain = new RegExp(`^${domain}`);
const hostDomain = new RegExp(`^${host}`);
const allowedInternalLinks = [new RegExp(`^#[a-zA-Z0-9]+`)];
const allowedExternalLinks = [rpfDomain, hostDomain];

const useExternalLinkState = (showModal) => {
  const dispatch = useDispatch();
  const [externalLink, setExternalLink] = useState();

  const handleAllowedExternalLink = (linkTo) => {
    setExternalLink(linkTo);
    dispatch(triggerCodeRun());
  };

  const handleRegularExternalLink = (linkTo, setPreviewFile) => {
    setExternalLink(null);
    setPreviewFile(`${linkTo}.html`);
    dispatch(triggerCodeRun());
  };

  const handleExternalLinkError = () => {
    dispatch(setError("externalLink"));
    dispatch(setErrorLine(""));
    dispatch(setErrorLineNumber(null));
    showModal();
  };

  return {
    externalLink,
    setExternalLink,
    handleAllowedExternalLink,
    handleRegularExternalLink,
    handleExternalLinkError,
  };
};

const matchingRegexes = (regexArray, testString) => {
  return regexArray.some((reg) => reg.test(testString));
};

export {
  useExternalLinkState,
  allowedExternalLinks,
  allowedInternalLinks,
  matchingRegexes,
};
