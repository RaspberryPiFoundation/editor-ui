import React from "react";
import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { ReactComponent as OpenFileIcon } from "../../assets/icons/open_in_new_tab.svg";
import "../../assets/stylesheets/MembersPage.scss";

const MembersPage = () => {
  return (
    <div className="members-page__wrapper">
      <div className="members-page__heading">
        <h2>Pagination</h2>
        <h2>Back to</h2>
        <h1>All members</h1>
        <DesignSystemButton
          className="text-list__button"
          href={"/"}
          text={"Hello"}
          textAlways
          icon={<OpenFileIcon />}
        />
      </div>

      <div className="members-page__members">
        <div className="members-page__members--panel">
          <p>Search for student</p>
          <p>Last online</p>
        </div>

        <ul className="member-list">
          <li className="member">
            <span className="member-info">John Doe</span>
            <button className="member-edit">Edit</button>
          </li>
          <li className="member">
            <span className="member-info">Jane Smith</span>
            <button className="member-edit">Edit</button>
          </li>
          <li className="member">
            <span className="member-info">John Doe</span>
            <button className="member-edit">Edit</button>
          </li>
          <li className="member">
            <span className="member-info">Jane Smith</span>
            <button className="member-edit">Edit</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MembersPage;
