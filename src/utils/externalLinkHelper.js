
const domain = `https://rpf.io/`;
const rpfDomain = new RegExp(`^${domain}`);
const allowedInternalLinks = [new RegExp(`^#[a-zA-Z0-9]+`)];
const allowedExternalLinks = [rpfDomain];

const matchingRegexes = (regexArray, testString) => {
  return regexArray.some((reg) => reg.test(testString));
};

export { allowedExternalLinks, allowedInternalLinks, matchingRegexes };
