import axios from "axios";
import React, { useEffect, useState } from "react";
import swal from "sweetalert2";
import { FaEdit, FaSearch, FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaDeleteLeft, FaTicket } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { FaFilter } from "react-icons/fa6";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";

const AManageUsers = () => {
  const [csrfToken, setCsrfToken] = useState(); // Initially, csrfToken is undefined
  const [userList, setUserList] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [displayPassword, setDisaplayPassword] = useState(false);
  const [factories, setFactories] = useState();
  const [selectedFactory, setSelectedFactory] = useState();
  const [searchKey, setSearchKey] = useState();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const users = await axios.get(`${apiUrl}/user/get-all-users`, {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      if (users.status === 200) {
        setUserList(users.data.UserList);
      } else {
        setIsLoading(false);
        alert("error occured");
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  //getting all factories
  const getFactories = async () => {
    // alert("getting factories");
    try {
      // alert(csrfToken);
      // alert("sending factory request");
      const response = await axios.get(
        `${apiUrl}/department/getAll-Factories`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
          withCredentials: true,
        }
      );
      if (response) {
        setFactories(response.data.data);
        // const facto = factories;
        // console.log("facto  ", facto);
      } else {
        alert("response failed");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    // The async function should be inside the useEffect
    const fetchCsrfToken = async () => {
      try {
        const csrf = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });

        if (csrf.status === 200) {
          setCsrfToken(csrf.data.csrfToken); // Set the csrf token using the setter function
        }
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };
    fetchCsrfToken(); // Call the async function inside useEffect
    getFactories();
    fetchUsers();
  }, []); // Empty dependency array to ensure this effect runs once when the component mounts

  const navigate = useNavigate();

  const navigateTo = (visitor, e) => {
    e.preventDefault();
    navigate("/edit-users", { state: { visitors: visitor } });
    // console.log("navigate to: ", visitor);
  };
  // console.log(userList);

  // Delete user function
  const handleDelete = async (visitorId) => {
    try {
      const result = await swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        setIsLoading(true);
        const response = await axios.delete(
          `${apiUrl}/user/delete/${visitorId}`,
          {
            headers: {
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setIsLoading(false);
          swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
          });
          fetchUsers();
          // Navigate back or to another page after deletion
          // navigate(-1); // Go back to previous page
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error during deletion:", error);
      swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Deletion failed",
        icon: "error",
      });
    }
  };

  const addFilter = async (e) => {
    e.preventDefault();
    const { value } = e.target;
    // alert(value);
    if (value) {
      try {
        setSelectedFactory(value);
      } catch (error) {}
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/user/getUsers/` + value, {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsLoading(false);
          setUserList(response.data.data);
        }
        setSelectedFactory(false);
      } catch (error) {
        switch (error.response.status) {
          case 401:
            swal.fire({
              title: "You don't have permission to perform this acction",
              text: "Please loging to the system using login page again",
              icon: "warning",
              confirmButtonAriaLabel: "Ok",
              showCancelButton: false,
            });
            setErrorMessages(
              "You don't have a permission to perform this action, please login again using loging page"
            );
            navigate("/");
            break;

          case 403:
            swal.fire({
              title: "Your session has been expired",
              text: "Your current session has been expired, please login again using your credentials",
              icon: "warning",
              confirmButtonText: "Ok",
              showCancelButton: false,
            });
            navigate("/");
            break;

          default:
        }
        setSelectedFactory(false);
      }
    } else {
      fetchUsers();
    }
  };

  const clearFilters = (e) => {
    setIsLoading(true);
    e.preventDefault();
    setSelectedFactory("");
    fetchUsers();
    setIsLoading(false);
  };

  const handleSearchKey = (e) => {
    const { value } = e.target;
    setSearchKey(value);
    if (value === "") {
      fetchUsers();
    }
  };

  const searchByName = async (e) => {
    e.preventDefault();
    if (searchKey !== "") {
      // alert("sending reqeust");
      try {
        setIsLoading(true);
        const response = await axios.get(`${apiUrl}/user/getUsersByName`, {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
          params: {
            searchKey: searchKey,
          },
        });
        // alert(response.status);
        if (response.status === 200) {
          setIsLoading(false);
          setUserList(response.data.data);
        }
        setSelectedFactory(false);
      } catch (error) {
        alert(error.response.status);
        switch (error.response.status) {
          case 401:
            swal.fire({
              title: "You don't have permission to perform this acction",
              text: "Please loging to the system using login page again",
              icon: "warning",
              confirmButtonAriaLabel: "Ok",
              showCancelButton: false,
            });
            setErrorMessages(
              "You don't have a permission to perform this action, please login again using loging page"
            );
            navigate("/");
            break;

          case 403:
            swal.fire({
              title: "Your session has been expired",
              text: "Your current session has been expired, please login again using your credentials",
              icon: "warning",
              confirmButtonText: "Ok",
              showCancelButton: false,
            });
            navigate("/");
          default:
            break;
        }
        setSelectedFactory(false);
      }
    } else {
      // alert("search key is empty");
      fetchUsers();
    }
  };

  return (
    <div className="w-full px-2 bg-white">
      {isLoading && (
        <div className="text-center w-full h-full">
          <div className="loader-overlay w-full h-full">
            <div className="loader"></div>
          </div>
        </div>
      )}
      <h1 className="text-xl text-center mb-4 mt-2 font-extrabold uppercase tracking-widest text-blue-950">
        Users List
      </h1>
      <div className="w-full">
        <div className="flex  justify-center md:justify-end w-full">
          <div className="">
            <button
              className="p-2 rounded-md mb-4 px-2 mr-4 bg-blue-500 text-white hover:bg-blue-600 flex"
              onClick={() => navigate("/register")}
            >
              <FaUserPlus className="text-lg mr-0 md:mr-1" />
              <p className="text-sm md:text-md">Add New User</p>
            </button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 mb-4 grid-rows-2 ">
          <div className="flex justify-center md:justify-end md:mr-4">
            <fieldset className="flex items-center">
              {/* <div className=""></div> */}
              {/* <label htmlFor="factory" className="whitespace-nowrap">
                Filter By:{" "}
              </label> */}
              <select
                name=""
                id="factory"
                style={{ cursor: "pointer" }}
                className="bg-white border-2 border-zinc-400 rounded-md py-1 px-2"
                onChange={(e) => addFilter(e)}
              >
                <option value="" selected={selectedFactory === ""}>
                  Select Factory
                </option>
                {Array.isArray(factories) &&
                  factories.length > 0 &&
                  factories.map((factory) => {
                    return (
                      <option
                        key={factory.Factory_Id}
                        value={factory.Factory_Id}
                      >
                        {factory.Factory_Name}
                      </option>
                    );
                  })}
              </select>
              {/* <FaFilter className="text-2xl ml-2 text-green-500 hover:text-green-600 cursor-pointer" /> */}
              <FaFilterCircleXmark
                className="text-xl md:text-2xl ml-2 text-red-500 hover:text-red-600 cursor-pointer"
                onClick={(e) => clearFilters(e)}
              />
            </fieldset>
          </div>

          <div className="bg-white rounded-lg mt-4 flex justify-center md:justify-end md:flex-auto ">
            <div className="bg-white h-8 rounded-xl flex space-x-2 md:mr-4">
              <input
                type="text"
                className="bg-white border-2 border-zinc-400 rounded-md py-1 px-2"
                placeholder="Search by user name..."
                name="searchKey"
                onChange={handleSearchKey}
                value={searchKey}
              />
              <FaSearch
                className="text-xl mt-2 cursor-pointer hover:scale-110 duration-150"
                onClick={(e) => searchByName(e)}
              />
            </div>
          </div>
        </div>

        <div className="max-w-screen overflow-x-auto h-80">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-500 text-white" style={{ color: "white" }}>
                <th className="text-left text-white" style={{ border: "0" }}>
                  Id
                </th>
                <th className="text-left text-white" style={{ border: "0" }}>
                  Name
                </th>
                <th className="text-left text-white" style={{ border: "0" }}>
                  Email
                </th>
                <th className="text-left text-white" style={{ border: "0" }}>
                  Category
                </th>
                {/* <th className="text-left " style={{ border: "0" }}>
                Factory
              </th> */}
                <th className="text-left text-white" style={{ border: "0" }}>
                  Department
                </th>
                <th className="md:text-left text-white text-center" style={{ border: "0" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* <tr> */}
              {Array.isArray(userList) && userList.length > 0 ? (
                userList.map((user) => {
                  return (
                    <tr className="odd:bg-blue-100 even:bg-blue-300 text-sm">
                      <td className="text-left text-sm pl-2 py-2 pr-3 text-wrap border-white border">
                        {user.user_Id}
                      </td>
                      <td className="text-left text-sm pl-2 py-2 pr-3 text-wrap border-white border">
                        {user.user_Name}
                      </td>
                      <td className="text-left text-sm pl-2 py-2 pr-3 text-wrap border-white border">
                        {user.user_email}
                      </td>
                      <td className="text-left text-sm pl-2 py-2 pr-3 text-wrap border-white border">
                        {user.user_category}
                      </td>
                      {/* <td className="text-left pb-2 pr-3 text-wrap">
                      {user.factory_Id}
                    </td> */}
                      <td className="text-left text-sm pl-2 pb-2 pr-3 text-wrap border-white border">
                        {user.Department.Department_Name}
                      </td>
                      <td className="flex items-center justify-center text-left pb-2 pr-3 text-wrap w-36">
                        <FaEdit
                          onClick={(e) => navigateTo(user, e)}
                          className="inline mr-2 text-2xl hover:text-blue-500"
                        />
                        <MdDeleteForever
                          onClick={() => handleDelete(user.user_Id)}
                          className="inline text-2xl hover:text-red-500"
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <td colSpan={6}>
                  <p className="text-center mt-2">No users found!</p>
                </td>
              )}
              {/* </tr> */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AManageUsers;
