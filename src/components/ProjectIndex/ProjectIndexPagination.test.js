import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ProjectIndexPagination } from "./ProjectIndexPagination";

const fetchMore = jest.fn();
const pageSize = 2;

describe("When pageInfo is missing", () => {
  const paginationData = {
    totalCount: 2,
  };

  beforeEach(() => {
    render(
      <ProjectIndexPagination
        pageSize={pageSize}
        paginationData={paginationData}
        fetchMore={fetchMore}
      />,
    );
  });

  test("It doesn't show the navigation", () => {
    expect(
      screen.queryByTestId("projectIndexPagination"),
    ).not.toBeInTheDocument();
  });
});

describe("When totalCount is missing", () => {
  const paginationData = {
    pageInfo: {},
  };

  beforeEach(() => {
    render(
      <ProjectIndexPagination
        pageSize={pageSize}
        paginationData={paginationData}
        fetchMore={fetchMore}
      />,
    );
  });

  test("It doesn't show the navigation", () => {
    expect(
      screen.queryByTestId("projectIndexPagination"),
    ).not.toBeInTheDocument();
  });
});

describe("When on the first page of projects", () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      startCursor: btoa(1),
      endCursor: btoa(2),
      hasNextPage: true,
      hasPreviousPage: false,
    },
  };
  beforeEach(() => {
    render(
      <ProjectIndexPagination
        pageSize={pageSize}
        paginationData={paginationData}
        fetchMore={fetchMore}
      />,
    );
  });

  test("More buttons shown", () => {
    expect(
      screen.queryByTitle("projectList.pagination.more"),
    ).toBeInTheDocument();
  });
});

describe("When the endCursor is missing", () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false,
    },
  };
  beforeEach(() => {
    render(
      <ProjectIndexPagination
        pageSize={pageSize}
        paginationData={paginationData}
        fetchMore={fetchMore}
      />,
    );
  });

  test("Assume there is more to load", () => {
    expect(
      screen.queryByTitle("projectList.pagination.more"),
    ).toBeInTheDocument();
  });
});

describe("When on a middle page of projects", () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      startCursor: btoa(3),
      endCursor: btoa(4),
      hasNextPage: true,
      hasPreviousPage: true,
    },
  };

  beforeEach(() => {
    render(
      <ProjectIndexPagination
        pageSize={pageSize}
        paginationData={paginationData}
        fetchMore={fetchMore}
      />,
    );
  });

  test("More buttons shown", () => {
    expect(
      screen.queryByTitle("projectList.pagination.more"),
    ).toBeInTheDocument();
  });

  test("Clicking the more button requests next page", () => {
    const nextButton = screen.queryByTitle("projectList.pagination.more");
    fireEvent.click(nextButton);
    expect(fetchMore).toHaveBeenCalledWith({
      variables: { first: pageSize, after: paginationData.pageInfo.endCursor },
    });
  });
});

describe("When on the last page of projects", () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      startCursor: btoa(7),
      endCursor: btoa(7),
      hasNextPage: false,
      hasPreviousPage: true,
    },
  };
  beforeEach(() => {
    render(
      <ProjectIndexPagination
        pageSize={pageSize}
        paginationData={paginationData}
        fetchMore={fetchMore}
      />,
    );
  });

  test("More button not shown", () => {
    expect(
      screen.queryByTitle("projectList.pagination.more"),
    ).not.toBeInTheDocument();
  });
});
