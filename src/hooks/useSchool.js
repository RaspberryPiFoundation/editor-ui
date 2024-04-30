import { useEffect } from "react";
import { getUserSchool } from "../utils/apiCallHandler";
import { useDispatch } from "react-redux";
import { loadSchool } from "../redux/reducers/schoolReducers";
// import { loadSchool } from "../redux/SchoolSlice";

const useSchool = ({ id, accessToken }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log("dispatching action to load school");
    // async function fetchData() {
    //   try {
    //     console.log("fetching school");
    //     const schools = await getUserSchool(accessToken);
    //     console.log(schools);
    //   } catch (error) {
    //     console.log("no schools");
    //   }
    // }
    // fetchData();
    dispatch({ type: "TEST" });
    dispatch(loadSchool({ id, accessToken }));
  }, [id, accessToken, dispatch]);
};

export default useSchool;
