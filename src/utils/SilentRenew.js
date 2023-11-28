import { useEffect } from "react";
import { connect } from "react-redux";
import { processSilentRenew } from "redux-oidc";

const SilentRenew = () => {
  useEffect(() => {
    console.log("*************************************");
    console.log("silently renewing");
    processSilentRenew();
  }, []);

  return null;
};

export default connect()(SilentRenew);
