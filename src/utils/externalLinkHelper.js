
const domain = `https://rpf.io/`;
const rpfDomain = new RegExp(`^${domain}`);
const allowedInternalLinks = [new RegExp(`^#[a-zA-Z0-9]+`)];
const allowedExternalHrefs = [rpfDomain];

const matchingRegexes = (regexArray, testString) => {
  return regexArray.some((reg) => reg.test(testString));
};

export { allowedExternalHrefs, allowedInternalLinks, matchingRegexes };
