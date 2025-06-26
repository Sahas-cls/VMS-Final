import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../Header";
import HSidebar from "./HSidebar";
import HConteiner from "./HContainer";
import HApprovedVisitors from "./HApprovedVisitors";
import UseWindowWidth from "../UseWindowWidth";
import { AnimatePresence, motion } from "framer-motion";

const HMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [csrfToken, setCsrfToken] = useState("");
  const [userData, setUserData] = useState({
    userName: "",
    userCategory: "",
    userDepartment: "",
  });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response) {
          const csrf = await response.data.csrfToken;
          setCsrfToken(csrf);
        }
      } catch (error) {
        alert(`Error while fetching csrf token:- ${error}`);
      }
    };
    getCsrf();

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
    getUserData();
  }, []);

  const [view, setView] = useState("visitor");
  const handleSidebarClick = (value) => {
    setView(value);
  };

  const screenSize = UseWindowWidth();
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 700);

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
      <div className="mainContainer flex duration-150">
        {toggleSidebar && (
          <HSidebar
            onSidebarClick={handleSidebarClick}
            className="duration-150"
          />
        )}

        <AnimatePresence mode="wait">
          {view === "visitor" && (
            <motion.div key="visitor" {...animationProps}>
              <HConteiner
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
              <HApprovedVisitors
                userId={userId}
                userName={userName}
                userCategory={userCategory}
                userDepartment={userDepartment}
                userDepartmentId={userDepartmentId}
                userFactoryId={userFactoryId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HMain;
