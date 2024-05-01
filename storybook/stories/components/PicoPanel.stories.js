import React from "react";
import PicoPanel from "components/Menus/Sidebar/PicoPanel/PicoPanel";
import MockStore from "../../store/MockStore";

export default {
  title: "PicoPanel",
  component: PicoPanel,
};

const DefaultTemplate = ({ connected }) => {
  return (
    <MockStore
      initialState={{
        picoConnected: connected,
      }}
    >
      <PicoPanel />
    </MockStore>
  );
};

export const NotConnected = DefaultTemplate.bind();
NotConnected.args = {
  connected: false,
};

export const Connected = DefaultTemplate.bind();
Connected.args = {
  connected: true,
};

// NotConnected.parameters = { controls: {} };
