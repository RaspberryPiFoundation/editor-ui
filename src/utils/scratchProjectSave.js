const buildScratchProjectSaveRequest = ({
  apiUrl,
  currentProjectId,
  params = {},
}) => {
  const creatingProject =
    currentProjectId === null || typeof currentProjectId === "undefined";
  const searchParams = new URLSearchParams(
    Object.entries({
      original_id: params.originalId,
      is_copy: params.isCopy,
      is_remix: params.isRemix,
      title: params.title,
    }).filter(([, value]) => value !== undefined),
  );
  const queryString = searchParams.toString();
  const baseUrl = creatingProject
    ? `${apiUrl}/api/scratch/projects/`
    : `${apiUrl}/api/scratch/projects/${currentProjectId}`;

  return {
    creatingProject,
    method: creatingProject ? "post" : "put",
    url: queryString ? `${baseUrl}?${queryString}` : baseUrl,
  };
};

const normalizeScratchProjectSaveResponse = async ({
  response,
  creatingProject,
  currentProjectId,
}) => {
  if (response.status !== 200) {
    throw response.status;
  }

  const body = await response.json();
  return {
    ...body,
    id: creatingProject ? body["content-name"] : currentProjectId,
  };
};

const scratchProjectSave = async ({
  scratchFetchApi,
  apiUrl,
  currentProjectId,
  vmState,
  params,
}) => {
  const { creatingProject, method, url } = buildScratchProjectSaveRequest({
    apiUrl,
    currentProjectId,
    params,
  });
  const response = await scratchFetchApi.scratchFetch(url, {
    method,
    body: vmState,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return normalizeScratchProjectSaveResponse({
    response,
    creatingProject,
    currentProjectId,
  });
};

export default scratchProjectSave;
