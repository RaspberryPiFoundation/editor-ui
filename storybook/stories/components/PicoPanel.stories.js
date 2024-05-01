import React from "react";
import PicoPanel from "components/Menus/Sidebar/PicoPanel/PicoPanel";
import MockStore from "../../store/MockStore";

export default {
  title: "PicoPanel",
  component: PicoPanel,
};

const DefaultTemplate = () => {
  return (
    <MockStore
      initialState={{
        picoConnected: true,
      }}
    >
      <PicoPanel />
    </MockStore>
  );
};

export const Default = DefaultTemplate.bind();
Default.args = {};
Default.parameters = { controls: {} };
