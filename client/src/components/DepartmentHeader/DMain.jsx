import React, { useState, useEffect } from "react";
import DSidebar from "./DSidebar";
import DContainer from "./DContainer";
import DReport from "./DReport";
import axios from "axios";
import Header from "../../Header";
import DApprovedVisitors from "./DApprovedVisitors";
import UseWindowWidth from "../UseWindowWidth";
import { AnimatePresence, motion } from "framer-motion";

const DMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  console.log("factory id", userFactoryId);
  const [csrfToken, setCsrfToken] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const [userData, setUserData] = useState({
    userName: "",
    userCategory: "",
    userDepartment: "",
  });

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          console.log(response.data.csrfToken);
          const csrf = await response.data.csrfToken;
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };

    const getUserData = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/user/getToken`,
          { withCredentials: true },
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        console.log(response.data.data);
        setUserData(response.data.data);
      } catch (error) {
        alert("Error while getting user data: " + error);
      }
    };

    getCsrf();
    getUserData();
  }, []);

  const [view, setView] = useState("visitor");
  const screenSize = UseWindowWidth();
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 768);

  const handleSidebarClick = (value) => {
    setView(value);
  };

  useEffect(() => {
    if (screenSize < 768) {
      setToggleSidebar(false);
    } else {
      setToggleSidebar(true);
    }
  }, [screenSize]);

  const animationProps = {
    initial: { opacity: 0, x: -500, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 500, scale: 0.9 },
    transition: { duration: 0.2, type: "tween" },
    className: "flex-1",
  };

  return (
    <div className="overflow-x-hidden">
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
      />
      <div className="mainContainer flex overflow-x-hidden">
        {toggleSidebar && <DSidebar handleSidebarClick={handleSidebarClick} />}

        <AnimatePresence mode="wait">
          {view === "visitor" && (
            <motion.div key="visitor" {...animationProps}>
              <DContainer
                userId={userId}
                userName={userName}
                userCategory={userCategory}
                userDepartment={userDepartment}
                userDepartmentId={userDepartmentId}
                userFactoryId={userFactoryId}
                setToggleSidebar={setToggleSidebar}
              />
            </motion.div>
          )}

          {view === "approvedVisitors" && (
            <motion.div key="approvedVisitors" {...animationProps}>
              <DApprovedVisitors
                userId={userId}
                userName={userName}
                userCategory={userCategory}
                userDepartment={userDepartment}
                userDepartmentId={userDepartmentId}
                userFactoryId={userFactoryId}
                setToggleSidebar={setToggleSidebar}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DMain;
