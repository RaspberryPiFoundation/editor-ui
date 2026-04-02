# Plan: Migrate All Buttons to RPF Design System

**TL;DR**: The RPF Button supports all needed functionality! However, migration requires resolving theming conflicts first - current style overrides conflict with RPF Button. After theming cleanup with CSS custom properties, simple prop swaps can migrate all 20+ components.

## Problems this solves

### **Current tech debt issues**

- **Multiple button implementations** - 3 different button approaches (custom Button, DesignSystemButton wrapper, plain HTML) create maintenance overhead and inconsistent behaviour
- **Development friction for new components** - Developers implementing new features must navigate multiple button options and conflicts, leading to slower delivery
- **Style conflicts** - Current `.rpf-button` overrides conflict with actual RPF Button implementation, preventing proper design system adoption
- **Inconsistent accessibility** - Custom button implementations may not handle focus, touch targets, and ARIA as comprehensively as RPF Button
- **Mixed responsibilities** - Confirmation/modal logic embedded in button components instead of proper separation of concerns
- **Theming complexity** - Class-based style overrides instead of design system's intended custom property approach
- **Component inefficiency** - Duplicate button logic and styles that could be handled by the design system

### **Benefits of migration**

**For end users:**

- **Better accessibility** - Proper focus management, touch targets, and ARIA compliance built into RPF Button
- **Consistent experience** - Unified button behaviour and styling across the entire editor

**For development team:**

- **Reduced maintenance** - Delete 2 wrapper components + associated SCSS files (~500+ lines of code)
- **Simplified component development** - Single button approach reduces complexities when implementing new features
- **Design system alignment** - Proper usage of RPF design system as intended
- **Cleaner architecture** - Better separation of concerns (UI vs business logic)
- **Faster development** - New button/component features come automatically from design system updates
- **Easier onboarding** - New developers learn one button API instead of multiple custom approaches

## Discovery status

**Current Button landscape**

- Custom Button: 15+ components (RunButton, Modals, Dropdown, Sidebar, etc.)
- DesignSystemButton wrapper: 8+ components (SaveButton, DownloadButton, ProjectName, etc.)
- One custom implementation: OrientationResetButton (plain HTML)

**Key findings**

- **RPF Button is functionally complete** - Supports all required behavioural patterns via existing props
- **Theming strategy required** - Current style overrides conflict with RPF Button, requiring CSS custom property migration first
- **Direct migration approach viable** - No wrapper needed after theming cleanup
- **Architectural improvement opportunity** - Move confirmation logic from buttons to components for cleaner separation
- **Icon strategy defined** - React element icons provide viable migration path despite deprecation
- **Accessibility benefits** - RPF Button handles touch targets, focus, and ARIA properly
- **Codebase simplification** - Remove 2 wrapper components + associated SCSS files

## Component usage breakdown

### **DesignSystemButton usages (8 components)**

| Component         | File Path                                                                                                                                    | Usage Context                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| SaveButton        | [src/components/SaveButton/SaveButton.jsx](src/components/SaveButton/SaveButton.jsx)                                                         | Save project functionality     |
| DownloadButton    | [src/components/DownloadButton/DownloadButton.jsx](src/components/DownloadButton/DownloadButton.jsx)                                         | Download project functionality |
| ProjectName       | [src/components/ProjectName/ProjectName.jsx](src/components/ProjectName/ProjectName.jsx)                                                     | Edit/save project name         |
| ProjectBar        | [src/components/ProjectBar/ProjectBar.jsx](src/components/ProjectBar/ProjectBar.jsx)                                                         | Scratch save button            |
| FilePanel         | [src/components/Menus/Sidebar/FilePanel/FilePanel.jsx](src/components/Menus/Sidebar/FilePanel/FilePanel.jsx)                                 | File management actions        |
| ProjectsPanel     | [src/components/Menus/Sidebar/ProjectsPanel/ProjectsPanel.jsx](src/components/Menus/Sidebar/ProjectsPanel/ProjectsPanel.jsx)                 | Project listing actions        |
| DownloadPanel     | [src/components/Menus/Sidebar/DownloadPanel/DownloadPanel.jsx](src/components/Menus/Sidebar/DownloadPanel/DownloadPanel.jsx)                 | Download panel buttons         |
| InstructionsPanel | [src/components/Menus/Sidebar/InstructionsPanel/InstructionsPanel.jsx](src/components/Menus/Sidebar/InstructionsPanel/InstructionsPanel.jsx) | Instruction navigation         |

### **Button (custom) usages (15 components)**

| Component           | File Path                                                                                                                                                | Usage Context             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| RunButton           | [src/components/RunButton/RunButton.jsx](src/components/RunButton/RunButton.jsx)                                                                         | Run code execution        |
| StopButton          | [src/components/RunButton/StopButton.jsx](src/components/RunButton/StopButton.jsx)                                                                       | Stop code execution       |
| GeneralModal        | [src/components/Modals/GeneralModal.jsx](src/components/Modals/GeneralModal.jsx)                                                                         | Modal action buttons      |
| ErrorModal          | [src/components/Modals/ErrorModal.jsx](src/components/Modals/ErrorModal.jsx)                                                                             | Error modal buttons       |
| NewFileModal        | [src/components/Modals/NewFileModal.jsx](src/components/Modals/NewFileModal.jsx)                                                                         | New file modal buttons    |
| RenameFileModal     | [src/components/Modals/RenameFileModal.jsx](src/components/Modals/RenameFileModal.jsx)                                                                   | Rename modal buttons      |
| Dropdown            | [src/components/Menus/Dropdown/Dropdown.jsx](src/components/Menus/Dropdown/Dropdown.jsx)                                                                 | Dropdown toggle button    |
| SidebarBarOption    | [src/components/Menus/Sidebar/SidebarBarOption.jsx](src/components/Menus/Sidebar/SidebarBarOption.jsx)                                                   | Sidebar navigation        |
| SidebarBar          | [src/components/Menus/Sidebar/SidebarBar.jsx](src/components/Menus/Sidebar/SidebarBar.jsx)                                                               | Sidebar container         |
| ProgressBar         | [src/components/Menus/Sidebar/InstructionsPanel/ProgressBar/ProgressBar.jsx](src/components/Menus/Sidebar/InstructionsPanel/ProgressBar/ProgressBar.jsx) | Step navigation           |
| OutputViewToggle    | [src/components/Editor/Runners/PythonRunner/OutputViewToggle.jsx](src/components/Editor/Runners/PythonRunner/OutputViewToggle.jsx)                       | Split/tabbed view toggle  |
| NewInputPanelButton | [src/components/Editor/NewInputPanelButton/NewInputPanelButton.jsx](src/components/Editor/NewInputPanelButton/NewInputPanelButton.jsx)                   | Add editor panel          |
| EditorInput         | [src/components/Editor/EditorInput/EditorInput.jsx](src/components/Editor/EditorInput/EditorInput.jsx)                                                   | Tab close buttons         |
| ToastCloseButton    | [src/utils/ToastCloseButton.jsx](src/utils/ToastCloseButton.jsx)                                                                                         | Toast notification close  |
| Notifications       | [src/utils/Notifications.js](src/utils/Notifications.js)                                                                                                 | Custom notification close |

## RPF Button capabilities

### **↔️ Direct prop swaps** _(Available in RPF Button)_

| Current Prop                         | RPF Button Prop                     | Notes                               |
| ------------------------------------ | ----------------------------------- | ----------------------------------- |
| `buttonText="Save"`                  | `text="Save"`                       | ✅ Direct swap                      |
| `onClickHandler={fn}`                | `onClick={fn}`                      | ✅ Direct swap                      |
| `ButtonIcon={<Icon />}`              | `icon={<Icon />}`                   | ⚠️ React element icons deprecated\* |
| `buttonImage="/img.png"`             | `icon={<img src="/img.png" />}`     | ⚠️ React element icons deprecated\* |
| `buttonImageAltText="Alt"`           | Use `aria-label` on button          | ✅ Better accessibility             |
| `buttonIconPosition="right"`         | `iconPosition="right"`              | ✅ Direct swap                      |
| `className="btn--primary"`           | `type="primary"`                    | ✅ Direct swap                      |
| `className="btn--secondary"`         | `type="secondary"`                  | ✅ Direct swap                      |
| `className="btn--tertiary"`          | `type="tertiary"`                   | ✅ Direct swap                      |
| `href="/path"`                       | `href="/path" linkComponent={Link}` | ✅ Direct swap (Not used)           |
| `disabled={true}`                    | `disabled={true}`                   | ✅ Direct swap                      |
| `label` (aria-label)                 | `aria-label`                        | ✅ RPF Button supports this         |
| `title`                              | `title`                             | ✅ Direct swap                      |
| `fill={true}` _(DesignSystemButton)_ | `fullWidth={true}`                  | ✅ Direct swap                      |
| `buttonOuter={skinny}`               | `size="small"`                      | ✅ RPF Button handles touch targets |

\*React element icons (both `<Icon />` components and `<img />` tags) are deprecated but currently the only viable option. See Icon Strategy section below for details.

### **🔄 Pattern changes** _(Handle in component, not button)_

| Current Pattern               | New Pattern                         | Notes                 |
| ----------------------------- | ----------------------------------- | --------------------- |
| `confirmText="Are you sure?"` | Handle in `onClick={handleConfirm}` | ✅ Cleaner separation |

## Icon strategy

**Current situation**:

The codebase does not include Material Icons, so RPF Button's preferred string-based icon approach (`icon="icon_name"`) is unavailable.

Material Icons was removed in [PR #1333](https://github.com/RaspberryPiFoundation/editor-ui/pull/1333) because it consumed 80% of bundle size for minimal usage.

The design system Button supports custom React element icons (`icon={<img />}`) but **this is deprecated**:

```jsx
if (React.isValidElement(icon)) {
  console.warn(
    "DEPRECATED: icons as React elements will not be supported in future releases"
  );
}
```

**Example of usage**:

- [Dropdown.jsx](src/components/Menus/Dropdown/Dropdown.jsx) currently uses `buttonImage` prop, and multiple components use `ButtonIcon` React elements.

**Available approaches**:

1. **React element icons** - `icon={<img />}` or `icon={<Icon />}` (deprecated but functional)
2. **Reintroduce Material Icons font** - Simpler migration but reverses bundle optimisation
3. **[material-symbols svg package](https://github.com/marella/material-design-icons/tree/main/svg#readme)** - npm package that could provide tree-shakable icon imports (`import { Save } from 'material-symbols'`) without font loading, potentially offering consistent icons (names and visuals) with minimal bundle impact.

**Recommendation**: Use React element icons for migration, accepting the deprecation warning as a reasonable trade-off for consistent design system usage and improved bundle size.

**Design System recommendation**: Consider suggesting to RPF Design System team that React element icon support should **not** be deprecated, given legitimate needs for custom icons (Google logo, coding language icons, etc.) across our Editor codebases.

## Button theming strategy

### **Current editor theme requirements**

Based on `DesignSystemButton.scss`, the editor currently customises:

1. **Dark/light mode variants**:
   - Different colors for `.--dark` and `.--light` contexts
   - Custom hover/active/disabled states per theme
2. **Text/icon styling**:
   - Different text/icon colors for primary/secondary/tertiary variants
3. **Custom layout**:
   - `flex-direction: row-reverse` for icon positioning
   - Custom spacing and sizing overrides

### **RPF Button's built-in theming API**

The design system Button provides these custom properties:

```scss
// Base button theming
--rpf-button-background-color
--rpf-button-background-color-hover
--rpf-button-background-color-active
--rpf-button-background-color-disabled
--rpf-button-text-color

// Border theming
--rpf-button-border-color
--rpf-button-border-color-hover
--rpf-button-border-color-active
--rpf-button-border-color-disabled

// Danger variant theming
--rpf-button-danger-background-color
--rpf-button-danger-background-color-hover
--rpf-button-danger-background-color-active
--rpf-button-danger-background-color-disabled
--rpf-button-danger-text-color
--rpf-button-danger-border-color (+ variants)

// Layout/sizing
--rpf-button-border-radius
--rpf-button-border-width
--rpf-button-lg-height
--rpf-button-sm-height
--rpf-button-min-target-size
```

### **Theming gaps analysis**

**✅ Covered by existing custom properties:**

- Primary button colors (background, text, border + all states)
- Danger button variant colors
- Button sizing and spacing
- Border radius and width customisation
- Layout options are covered by props

**⚠️ Potential gaps requiring additional custom properties:**

- Secondary/Tertiary variant theming
  - Current: Separate secondary button background/text colors
  - RPF Button: Uses calculated colors based on primary button variables
  - **Gap**: May need `--rpf-button-secondary-*` and `--rpf-button-tertiary-*` custom properties

### **Recommended theming approach**

0. **Set up a clean environment** to work out required style overrides to recreate the editor theme
1. **Use existing RPF custom properties** for primary button theming
2. **Test if calculated secondary/tertiary colors** work for editor theme
3. **If needed, propose additional custom properties** for secondary/tertiary variants:

   ```scss
   // Only if calculated colors insufficient (NEW)
   --rpf-button-secondary-background-color
   --rpf-button-secondary-text-color
   --rpf-button-tertiary-text-color
   // + hover/active/disabled variants
   ```

4. **Create editor theme implementation**:

   ```scss
   :root {
     // Editor-specific theming using existing RPF Button custom properties

     // Note ideally one of these should be a default,
     // meaning only overriding some variables for the other theme.

     .--light {
       // Light mode: different custom property values
       --rpf-button-background-color: var(--rpf-teal-800);
       --rpf-button-background-color-hover: var(--rpf-teal-400);
       --rpf-button-text-color: var(--rpf-white);
     }

     .--dark {
       // Dark mode: just override custom property values
       --rpf-button-background-color: var(--rpf-grey-700);
       --rpf-button-background-color-hover: var(--rpf-grey-600);
       --rpf-button-text-color: var(--rpf-white);
       // Icons inherit text color automatically
     }
   }
   ```

**Design System recommendation**: We could propose secondary/tertiary variant custom properties to the design system, or verify that the calculated colors from primary button variables meet our theming needs?

**Note**: In the meantime, we can continue to override secondary/tertiary button styles at the class level (e.g., `.rpf-button--secondary { color: #{$custom-color}; }`) as a temporary solution while testing or waiting for design system enhancements.

### **Direct Sass to CSS custom property mapping**

Simply map existing color variables to RPF Button's custom properties:

```scss
:root {
  // Current Sass variables
  $rpf-button-background-color: $rpf-teal-800;
  $rpf-button-text-color: $rpf-white;
  $rpf-button-border-radius: $border-radius;

  // Map color variables to RPF Button theming API
  --rpf-button-background-color: var(--rpf-teal-800);
  --rpf-button-text-color: var(--rpf-white);
  --rpf-button-border-radius: var(--border-radius);
}
```

## Navigation pattern analysis _(No changes required)_

All current navigation uses `onClick` handlers with custom events or React Router programmatically. No buttons currently use `href` props for internal navigation.

```jsx
// Current pattern (no changes needed):
<DesignSystemButton
  onClick={navigateToProjectsPage}
  text={t("projectsPanel.yourProjectsButton")}
/>;

const navigateToProjectsPage = () => {
  document.dispatchEvent(navigateToProjectsPageEvent);
};
```

**Note**: RPF Button supports `href` with `linkComponent={Link}` for React Router integration if needed in future, but this capability is not currently used.

## Components requiring component-level changes

**Modal/confirmation pattern updates**:

- [RunButton.jsx](src/components/RunButton/RunButton.jsx), [StopButton.jsx](src/components/RunButton/StopButton.jsx)
  - Move `confirmText` logic to component: `onClick={handleConfirmThenRun}`
  - Use `react-confirm-alert` in component instead of Button prop

## Migration plan

**Phase 0: Theming** _(Foundation for clean migration)_

Before migrating any components, establish proper theming with CSS custom properties instead of class overrides:

1. **Remove current `.rpf-button` class overrides** from `DesignSystemButton.scss`
2. **Create editor theme** using RPF Button's intended custom property API
3. **Assess if additional custom properties are needed** for editor-specific theming requirements

**Phase 1: Direct migrations** _(All components can use direct prop swaps!)_

1. **DesignSystemButton → RPF Button** with prop mapping:

   - `fill={true}` → `fullWidth={true}`
   - Remove `btn` className (handled automatically)

2. **Custom Button → RPF Button** with prop mapping:
   - `buttonText` → `text`
   - `onClickHandler={confirmHandler}` → `onClick={confirmHandler}`
   - `ButtonIcon` → `icon` (⚠️ React element icons deprecated)
   - `buttonImage` → `icon` (⚠️ React element icons deprecated)
   - `buttonIconPosition` → `iconPosition`
   - `buttonOuter={skinny}` → `size="small"`
   - Components: RunButton, StopButton, Modals, Dropdown, Sidebar, etc.

**Phase 2: Handle `confirmText` logic migration in modal components**

- [RunButton.jsx](src/components/RunButton/RunButton.jsx), [StopButton.jsx](src/components/RunButton/StopButton.jsx): Move confirmation logic to component level (`onClick={handleConfirmThenRun}`)
- [GeneralModal.jsx](src/components/Modals/GeneralModal.jsx), [ErrorModal.jsx](src/components/Modals/ErrorModal.jsx), [NewFileModal.jsx](src/components/Modals/NewFileModal.jsx), [RenameFileModal.jsx](src/components/Modals/RenameFileModal.jsx): Remove `confirmText` prop usage, handle confirmation in component
- Check for any other buttons using this pattern

**Phase 3: Cleanup**

1. **Remove wrapper components**: Delete [DesignSystemButton.jsx](src/components/DesignSystemButton/DesignSystemButton.jsx)
2. **Remove custom Button**: Delete [Button.jsx](src/components/Button/Button.jsx)
3. **Update SCSS imports**: Remove `Button.scss` and `DesignSystemButton.scss` imports

## Verification

1. Test all confirmation/modal patterns in updated components
2. Test React element icon conversion (both `buttonImage` and `ButtonIcon` cases)
3. Test `size="small"` in RunnerControls
4. Check theming consistency (RPF Button should handle this automatically)
5. Test dark/light mode theme switching with new custom properties
6. Run existing Cypress tests

## Success metrics

- All tests passing
- Zero functionality lost during migration
- Better separation of concerns (UI vs logic)
- Consistent design system usage across codebase
- Reduced maintenance burden (fewer custom components)
- Improved accessibility compliance
- Clean theming approach using CSS custom properties instead of class overrides
- Icon usage consistency with chosen approach
