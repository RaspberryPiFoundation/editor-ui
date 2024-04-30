import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadSchool } from "../redux/reducers/schoolReducers";

const useSchool = ({ id, accessToken }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSchool({ id, accessToken }));
  }, [id, accessToken, dispatch]);
};

export default useSchool;
