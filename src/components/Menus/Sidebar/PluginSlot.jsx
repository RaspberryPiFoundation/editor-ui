import React from "react";

// Keep part names aligned with host (::part) styles in editor-standalone.
const slotPartName = (slot) => {
  if (slot === "buttons") {
    return "sidebar-plugin-button-container";
  }
  return `sidebar-plugin-${slot}-container`;
};

const PluginSlot = ({ pluginName, slot }) => (
  <div
    part={slotPartName(slot)}
    data-sidebar-plugin={pluginName}
    data-sidebar-plugin-slot={slot}
  />
);

export default PluginSlot;
