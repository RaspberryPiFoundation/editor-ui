import React from "react";
import DroppableTabList from "./DroppableTabList";
import { render, screen } from "@testing-library/react";
import { DragDropContext } from "@hello-pangea/dnd";

beforeEach(() => {
  render(
    <DragDropContext>
      <DroppableTabList index={0}>hello</DroppableTabList>
    </DragDropContext>,
  );
});

test("Renders", () => {
  expect(screen.queryByText("hello")).toBeInTheDocument();
});
