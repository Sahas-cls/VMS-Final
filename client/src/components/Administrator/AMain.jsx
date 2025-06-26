import React, { useEffect, useState } from "react";
import Header from "../../Header";
import UseWindowWidth from "../UseWindowWidth";
import ASidebar from "./ASidebar";
import AManageUsers from "./AManageUsers";
import { AnimatePresence, motion } from "framer-motion";

const AMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [view, setView] = useState("manageUsers");
  const screenSize = UseWindowWidth();
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 700);

  const handleSidebarClick = (value) => {
    setView(value);
  };

  useEffect(() => {
    if (screenSize < 700) {
      setToggleSidebar(false);
    } else {
      setToggleSidebar(true);
    }
  }, [screenSize]);

  const animationProps = {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 300 },
    transition: { duration: 0.3, type: "spring" },
    className: "flex-1",
  };

  return (
    <div className="max-h-screen overflow-y-hidden">
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
      />
      <div className="mainContainer flex" style={{ backgroundColor: "" }}>
        {toggleSidebar && <ASidebar onSidebarClick={handleSidebarClick} />}

        <AnimatePresence mode="wait">
          {view === "manageUsers" && (
            <motion.div key="manageUsers" {...animationProps}>
              <AManageUsers
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

export default AMain;
