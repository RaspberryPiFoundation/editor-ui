import * as ReactDOM from "react-dom";

import ProjectPanel from "./project_panel";
import styles from "./step_content_styles.module.scss";
// import "./scratchblocks-v3.5.2-min";

const modifyDom = (className) => {
  const stepContent = document.getElementsByClassName(className)[0];

  if (stepContent) {
    removePanels(stepContent);

    wrapContiguousTopLevelElementsInAContainerDiv(stepContent);
    wrapAliceBlueTipBoxes(stepContent);

    /* Python content */
    wrapAdditionalInformationForClubLeaders(stepContent);
    wrapClubLeaderNotes(stepContent);
    wrapUnwantedInfoFromProjectMaterials(stepContent);
    /* -------------- */

    renderScratchBlockSvgsFromTextDefinitions();
    addTaskCompleteFunctionality(stepContent);
    replaceRequirementsWithComponent(stepContent);
    positionCheckboxReflectionSteps(stepContent);
  }
};

const wrapContiguousTopLevelElementsInAContainerDiv = (stepContent) => {
  const topLevelElements = stepContent.children;
  const classesNotToWrap = [
    "u-no-print",
    "u-print-only",
    "c-project-task",
    "survey-container",
  ];

  const toBeWrapped = [];
  const wrapperClass = styles.wrapped_top_level_elements;

  for (let i = 0; i < topLevelElements.length; i += 1) {
    const element = topLevelElements[i];

    if (["u-no-print", "u-print-only"].includes(element.className)) {
      wrapContiguousTopLevelElementsInAContainerDiv(element);
    }

    const shouldWrap =
      !element.className || !classesNotToWrap.includes(element.className);

    if (shouldWrap) {
      toBeWrapped.push(element);
    } else {
      wrapElements(toBeWrapped, wrapperClass, element, stepContent);

      i -= toBeWrapped.length; // We're mutating the collection under iteration.
      toBeWrapped.splice(0, toBeWrapped.length); // Clear the array.
    }
  }

  wrapElements(toBeWrapped, wrapperClass, null, stepContent);
};

const removePanels = (stepContent) => {
  const panelsToRemove = [
    "Additional information for educators",
    "What you will learn",
  ];

  const projectPanels = stepContent.querySelectorAll(".c-project-panel");
  for (const panel of projectPanels) {
    const heading = panel.querySelector(".c-project-panel__heading");
    if (heading && panelsToRemove.includes(heading.textContent.trim())) {
      panel.remove();
    }
  }
};

const wrapAliceBlueTipBoxes = (stepContent) => {
  const wrapperClass = styles.wrapped_tip_box;

  const paragraphsWithStyleAttribute = stepContent.querySelectorAll("p[style]");
  for (const paragraph of paragraphsWithStyleAttribute) {
    const styleValue = paragraph.attributes["style"].value;

    if (styleValue.includes("background-color: aliceblue")) {
      paragraph.removeAttribute("style");

      const wrapper = document.createElement("div");
      wrapper.className = wrapperClass;
      paragraph.parentNode.insertBefore(wrapper, paragraph);
      wrapper.appendChild(paragraph);
    }
  }
};

const wrapElements = (toBeWrapped, wrapperClass, nextElement, stepContent) => {
  if (toBeWrapped.length === 0) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = wrapperClass;

  for (const element of toBeWrapped) {
    wrapper.appendChild(element);
  }

  stepContent.insertBefore(wrapper, nextElement);
};

const renderScratchBlockSvgsFromTextDefinitions = () => {
  if (typeof scratchblocks === "undefined") {
    return;
  }

  // scratchblocks.renderMatching(".language-blocks", { style: "scratch2" });
  // scratchblocks.renderMatching(".language-blocks3", { style: "scratch3" });
};

const addTaskCompleteFunctionality = (stepContent) => {
  const projectTasks = stepContent.querySelectorAll(".c-project-task");

  for (const [index, task] of projectTasks.entries()) {
    const checkboxes = task.querySelectorAll(".c-project-task__checkbox");
    const taskKey = `${window.location.pathname}-task-${index}`;
    const taskIsComplete = !!localStorage.getItem(taskKey);
    for (const checkbox of checkboxes) {
      if (taskIsComplete) {
        checkbox.setAttribute("checked", "checked");
      }
    }
  }
};

const positionCheckboxReflectionSteps = (stepContent) => {
  const projectTasks = stepContent.querySelectorAll(".c-project-task");
  const heading = stepContent.querySelector("#reflection");
  for (const task of projectTasks) {
    if (heading && heading.innerText === "Reflection") {
      let pTags = task.querySelectorAll("p");
      let checkboxes = task.querySelectorAll(".c-project-task__checkbox");
      for (const checkbox of checkboxes) {
        for (const p of pTags) {
          if (window.innerWidth > 600) {
            p.style.marginTop = 0;
            checkbox.style.marginTop = "0.8rem";
          } else {
            p.style.marginTop = "1.25rem";
          }
        }
      }
    }
  }
};

const replaceRequirementsWithComponent = (stepContent) => {
  const projectPanels = stepContent.querySelectorAll(".c-project-panel");

  for (const panel of projectPanels) {
    const toggle = panel.querySelector(".js-project-panel__toggle");
    const content = panel.querySelector(".c-project-panel__content");

    if (!toggle) {
      return;
    }

    let kind = "info";
    if (panel.className && panel.className.includes("hint")) {
      kind = "hint";
    }

    const div = document.createElement("div");
    panel.parentNode.insertBefore(div, panel);
    panel.remove();

    ReactDOM.render(
      <ProjectPanel
        kind={kind}
        title={toggle.innerText}
        content={content.innerHTML}
      />,
      div
    );
  }
};

// Python content
const wrap = (element) => {
  const wrapperClass = styles.wrapped_unwanted_python_content;
  const wrapper = document.createElement("div");
  wrapper.className = wrapperClass;
  element.parentNode.insertBefore(wrapper, element);
  wrapper.appendChild(element);
};

const wrapClubLeaderNotes = (stepContent) => {
  const projectPanels = stepContent.querySelectorAll(".c-project-panel");
  for (const panel of projectPanels) {
    const heading = panel.querySelector(".c-project-panel__heading");
    if (heading && heading.innerText == "Club leader notes") {
      wrap(panel);
    }
  }
};

const wrapAdditionalInformationForClubLeaders = (stepContent) => {
  const heading = stepContent.querySelector(
    "#additional-information-for-club-leaders"
  );
  if (
    heading &&
    heading.innerText == "Additional information for club leaders"
  ) {
    const printProjectInfo = heading.nextElementSibling;
    wrap(heading);
    heading.appendChild(printProjectInfo);
  }
};

const wrapUnwantedInfoFromProjectMaterials = (stepContent) => {
  const projectPanels = stepContent.querySelectorAll(".c-project-panel");
  for (const panel of projectPanels) {
    const heading = panel.querySelector(".c-project-panel__heading");
    if (heading && heading.innerText == "Project materials") {
      const clubLeaderTitle = panel.querySelector("#club-leader-resources");
      const links = Array.from(panel.querySelectorAll("li"));
      links.map((link) => {
        if (!link.innerText.includes("Online")) {
          wrap(link);
        }
      });
      wrap(clubLeaderTitle);
    }
  }
};

export default modifyDom;
