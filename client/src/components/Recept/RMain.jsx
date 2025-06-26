import React, { useEffect, useState } from "react";
import Header from "../../Header";
import RSidebar from "./RSidebar";
import RConteiner from "./RContainer";
import SuddenVisit from "./SuddenVisit";
import UseWindowWidth from "../UseWindowWidth";
import RDashboard from "./RDashboard";
import { AnimatePresence, motion } from "framer-motion";

const RMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [view, setView] = useState("visitor");

  const handleSidebarClick = (value) => {
    setView(value);
  };

  const [toggleSidebar, setToggleSidebar] = useState(false);
  const screenSize = UseWindowWidth();

  useEffect(() => {
    if (screenSize < 768) {
      setToggleSidebar(false);
    } else {
      setToggleSidebar(true);
    }
    console.log("toggleSidebar:", toggleSidebar);
  }, [screenSize]);

  const animationProps = {
    initial: { opacity: 0, x: -500, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 500, scale: 0.9 },
    transition: { duration: 0.2, type: "tween" },
    className: "flex-1",
  };

  return (
    <div className="overflow-hidden">
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
      />
      <div className="mainContainer flex">
        {toggleSidebar && <RSidebar handleSidebarClick={handleSidebarClick} />}

        <AnimatePresence mode="wait">
          {view === "visitor" && (
            <motion.div key="visitor" {...animationProps}>
              <RConteiner
                handleSidebarClick={handleSidebarClick}
                userId={userId}
                userName={userName}
                userCategory={userCategory}
                userDepartment={userDepartment}
                userDepartmentId={userDepartmentId}
                userFactoryId={userFactoryId}
              />
            </motion.div>
          )}

          {view === "suddenVisit" && (
            <motion.div key="suddenVisit" {...animationProps}>
              <SuddenVisit
                userId={userId}
                userFactoryId={userFactoryId}
                userName={userName}
                userCategory={userCategory}
                userDepartment={userDepartment}
                toggleSidebar={toggleSidebar}
              />
            </motion.div>
          )}

          {view === "getReports" && (
            <motion.div key="getReports" {...animationProps}>
              <RDashboard
                userFactoryId={userFactoryId}
                userName={userName}
                userCategory={userCategory}
                userDepartment={userDepartment}
                toggleSidebar={toggleSidebar}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RMain;
