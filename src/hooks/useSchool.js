import { useEffect } from "react";
import { getUserSchools } from "../utils/apiCallHandler";
import { useDispatch } from "react-redux";

const useSchool = ({ accessToken, id }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    async function fetchData() {
      try {
        const schools = await getUserSchools(accessToken);
        console.log(schools);
      } catch (error) {
        console.log("no schools");
      }
    }
    fetchData();
  }, [accessToken]);
};

export default useSchool;
