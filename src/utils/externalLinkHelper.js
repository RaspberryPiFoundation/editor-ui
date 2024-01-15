import { useState } from 'react';

const domain = `https://rpf.io/`;
const rpfDomain = new RegExp(`^${domain}`);
const allowedInternalLinks = [new RegExp(`^#[a-zA-Z0-9]+`)];
const allowedExternalLinks = [rpfDomain];

const useExternalLinkState = () => {
  const [externalLink, setExternalLink] = useState();

  const handleAllowedExternalLink = (linkTo, dispatch, triggerCodeRun) => {
    setExternalLink(linkTo);
    dispatch(triggerCodeRun());
  };

  const handleRegularExternalLink = (linkTo, setPreviewFile, setExternalLink, dispatch, triggerCodeRun) => {
    setExternalLink(null);
    setPreviewFile(`${linkTo}.html`);
    dispatch(triggerCodeRun());
  };

	const handleExternalLinkError = () => {
		dispatch(setError("externalLink"));
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

export { useExternalLinkState, allowedExternalLinks, allowedInternalLinks, matchingRegexes };
