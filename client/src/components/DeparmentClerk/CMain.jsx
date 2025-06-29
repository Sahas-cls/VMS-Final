import React, { useEffect, useState } from "react";
import CSidebar from "./CSidebar";
import CConteiner from "./CConteiner";
import CReport from "./CReport";
import Header from "../../Header";
import CApprovedVisitors from "./CApprovedVisitors";
import UseWindowWidth from "../UseWindowWidth";
import RDashboard from "../Recept/RDashboard";
// import { AnimatePresence, motion } from "framer-motion";

const CMain = ({
  userId,
  userName,
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [view, setView] = useState("visitor");
  const screenSize = UseWindowWidth(); // Get the screen width from the custom hook
  const [toggleSidebar, setToggleSidebar] = useState(screenSize < 768);

  const handleSidebarClick = (value) => {
    setView(value);
  };

  useEffect(() => {
    if (screenSize < 768) {
      setToggleSidebar(false); // Hide sidebar on small screens
    } else {
      setToggleSidebar(true); // Show sidebar on larger screens
    }
    console.log("toggleSidebar:", toggleSidebar);
  }, [screenSize]);

  const animationProps = {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 300 },
    transition: { duration: 0.3, type: "spring" },
    className: "flex-1",
  };

  return (
    <div>
      <Header
        userId={userId}
        userName={userName}
        userCategory={userCategory}
        userDepartment={userDepartment}
        toggleSidebar={toggleSidebar}
        setToggleSidebar={setToggleSidebar}
      />
      <div className={`mainContainer flex`} style={{ backgroundColor: "" }}>
        {toggleSidebar && <CSidebar onSidebarClick={handleSidebarClick} />}

        {view === "visitor" && (
          <CConteiner
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
          />
        )}

        {view === "report" && <CReport />}

        {view === "ApprovedVisitors" && (
          <CApprovedVisitors
            userId={userId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            userDepartmentId={userDepartmentId}
            userFactoryId={userFactoryId}
          />
        )}

        {view === "getReports" && (
          <RDashboard
            userFactoryId={userFactoryId}
            userName={userName}
            userCategory={userCategory}
            userDepartment={userDepartment}
            toggleSidebar={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default CMain;
