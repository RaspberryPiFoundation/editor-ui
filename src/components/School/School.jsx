import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSchool } from "../../utils/apiCallHandler";
import { useParams } from "react-router-dom";

const School = () => {
  const { identifier } = useParams();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.user?.access_token);
  const [school, setSchool] = useState();
  const [apiResponseCode, setApiResponseCode] = useState();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const school = await getSchool(identifier, accessToken);
          setSchool(school);
        } catch (error) {
          setApiResponseCode(error.response.status);
        }
      };
      fetchData();
    }
  }, [user, identifier, accessToken]);

  if (!user) return "Not logged in";

  if (apiResponseCode === 403) return "Not authorised";

  if (apiResponseCode === 404) return "School not found";

  if (!school) return "Loading";

  return <h1>{school.name}</h1>;
};

export default School;
