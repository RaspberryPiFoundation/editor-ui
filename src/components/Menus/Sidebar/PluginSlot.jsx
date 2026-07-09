import React from "react";

const PluginSlot = ({ pluginName, slot }) => (
  <div
    part={`sidebar-plugin-${slot}-container`}
    data-sidebar-plugin={pluginName}
    data-sidebar-plugin-slot={slot}
  />
);

export default PluginSlot;
