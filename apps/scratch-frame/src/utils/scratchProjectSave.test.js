import scratchProjectSave from "./scratchProjectSave";

describe("scratchProjectSave", () => {
  const buildScratchFetchApi = () => ({
    scratchFetch: jest.fn(),
  });

  test("updates an existing project through scratchFetch", async () => {
    const scratchFetchApi = buildScratchFetchApi();
    scratchFetchApi.scratchFetch.mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    const response = await scratchProjectSave({
      scratchFetchApi,
      apiUrl: "https://api.example.com",
      currentProjectId: "project-123",
      vmState: '{"targets":[]}',
      params: { title: "Saved from test" },
    });

    expect(scratchFetchApi.scratchFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/scratch/projects/project-123?title=Saved+from+test",
      {
        method: "put",
        body: '{"targets":[]}',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    expect(response).toEqual({ ok: true, id: "project-123" });
  });

  test("creates a project and returns the created id", async () => {
    const scratchFetchApi = buildScratchFetchApi();
    scratchFetchApi.scratchFetch.mockResolvedValue({
      status: 200,
      json: jest
        .fn()
        .mockResolvedValue({ "content-name": "created-project-id" }),
    });

    const response = await scratchProjectSave({
      scratchFetchApi,
      apiUrl: "https://api.example.com",
      currentProjectId: undefined,
      vmState: '{"targets":[]}',
      params: {
        originalId: "source-project",
        isRemix: 1,
        title: "Created from test",
      },
    });

    expect(scratchFetchApi.scratchFetch).toHaveBeenCalledWith(
      "https://api.example.com/api/scratch/projects/?original_id=source-project&is_remix=1&title=Created+from+test",
      {
        method: "post",
        body: '{"targets":[]}',
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    expect(response).toEqual({
      "content-name": "created-project-id",
      id: "created-project-id",
    });
  });

  test("rejects with the response status when the save fails", async () => {
    const scratchFetchApi = buildScratchFetchApi();
    scratchFetchApi.scratchFetch.mockResolvedValue({
      status: 401,
      json: jest.fn(),
    });

    await expect(
      scratchProjectSave({
        scratchFetchApi,
        apiUrl: "https://api.example.com",
        currentProjectId: "project-123",
        vmState: '{"targets":[]}',
      }),
    ).rejects.toBe(401);
  });
});
