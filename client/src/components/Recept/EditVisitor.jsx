import React, { useState, useEffect } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./VisitorF.css";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";

const EditVisitor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const visitorData = location.state?.visitor;
  const {
    ContactPerson_ContactNo,
    ContactPerson_Email,
    ContactPerson_Id,
    ContactPerson_NIC,
    ContactPerson_Name,
  } = visitorData;

  const { Date_From, Date_To, Time_From, Time_To } = visitorData?.Visits[0];
  console.log(visitorData.Visits[0]);
  const dateTo = new Date(Date_To).toISOString().split("T")[0];
  const dateFrom = new Date(Date_From).toISOString().split("T")[0];
  const vToday = new Date();
  vToday.setHours(0, 0, 0, 0);

  // State for dynamic data
  const [csrfToken, setCsrfToken] = useState("");
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Validation Schema
  const validationSchema = Yup.object().shape({
    factory: Yup.number().required("Select a factory"),
    department: Yup.number().required("Select a department"),
    cName: Yup.string()
      .min(3, "Name should have at least 3 characters")
      .max(254, "Name should have less than 254 characters")
      .required("Name required"),
    cNIC: Yup.string()
      .matches(/^(\d{9}[vV]|\d{12})$/, "Invalid NIC format")
      .required("NIC required"),
    cMobileNo: Yup.string()
      .matches(/^0\d{9}$/, "Invalid mobile number")
      .required("Mobile number required"),
    cEmail: Yup.string().email("Invalid email"),
    dateFrom: Yup.date()
      .required("Date required")
      .min(vToday, "Date cannot be in past"),
    dateTo: Yup.date()
      .required("Date required")
      .min(Yup.ref("dateFrom"), "End date cannot be before start date"),
    fTimeFrom: Yup.string().required("Time from required"),
    fTimeTo: Yup.string().required("Time to required"),
    vehicles: Yup.array().of(
      Yup.object().shape({
        Vehicle_Type: Yup.string()
          .min(3, "Vehicle type must be at least 3 characters")
          .required("Vehicle type required"),
        Vehicle_No: Yup.string().required("Vehicle number required"),
      })
    ),
    visitors: Yup.array().of(
      Yup.object().shape({
        Visitor_Name: Yup.string()
          .min(3, "Name must be at least 3 characters")
          .required("Visitor name required"),
        Visitor_NIC: Yup.string()
          .matches(/^(\d{9}[vV]|\d{12})$/, "Invalid NIC format")
          .required("Visitor NIC required"),
      })
    ),
  });

  // Formik initialization
  const formik = useFormik({
    initialValues: {
      factory: "",
      department: "",
      cId: ContactPerson_Id,
      cName: ContactPerson_Name || "",
      cNIC: ContactPerson_NIC || "",
      cMobileNo: ContactPerson_ContactNo || "",
      cEmail: ContactPerson_Email || "",
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
      fTimeFrom: Time_From || "",
      fTimeTo: Time_To || "",
      vehicles: visitorData?.Vehicles || [],
      visitors: visitorData?.Visitors || [],
    },
    validationSchema,
    onSubmit: (values) => handleUpdate(values),
    enableReinitialize: true,
  });

  // Data fetching functions
  const getFactories = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/department/getAll-Factories`,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );
      if (response) setFactories(response.data.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchDepartments = async (factoryId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/department/getDep/${factoryId}`
      );
      if (response) setDepartments(response.data);
    } catch (error) {
      console.error(`Error fetching departments: ${error}`);
    }
  };

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getCSRFToken`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setCsrfToken(response.data.csrfToken);
        }
      } catch (error) {
        console.error(`Error fetching CSRF token: ${error}`);
      }
    };
    getCsrf();
    getFactories();
  }, []);

  // Handler functions
  const handleDepartmentChange = (e) => {
    formik.handleChange(e);
    if (e.target.name === "factory") {
      fetchDepartments(e.target.value);
    }
  };

  const handleVehicleChanges = (index, e) => {
    const { name, value } = e.target;
    const updatedVehicles = [...formik.values.vehicles];
    updatedVehicles[index][name] = value;
    formik.setFieldValue("vehicles", updatedVehicles);
  };

  const handleVehiclePlus = () => {
    formik.setFieldValue("vehicles", [
      ...formik.values.vehicles,
      { Vehicle_Type: "", Vehicle_No: "" },
    ]);
  };

  const removeVehicle = (e, index) => {
    e.preventDefault();
    const updatedVehicles = formik.values.vehicles.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("vehicles", updatedVehicles);
  };

  const handleVisitorChanges = (index, e) => {
    const { name, value } = e.target;
    const updatedVisitors = [...formik.values.visitors];
    updatedVisitors[index][name] = value;
    formik.setFieldValue("visitors", updatedVisitors);
  };

  const handleVisitorsPlus = () => {
    formik.setFieldValue("visitors", [
      ...formik.values.visitors,
      { Visitor_Name: "", Visitor_NIC: "" },
    ]);
  };

  const removeVisitor = (e, index) => {
    e.preventDefault();
    const updatedVisitors = formik.values.visitors.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue("visitors", updatedVisitors);
  };

  const handleUpdate = async (values) => {
    try {
      setIsLoading(true);
      const formData = {
        contactPerson: {
          cId: values.cId,
          cName: values.cName,
          cNIC: values.cNIC,
          cMobileNo: values.cMobileNo,
          cEmail: values.cEmail,
        },
        visitingDateTime: {
          dateFrom: values.dateFrom,
          dateTo: values.dateTo,
          fTimeFrom: values.fTimeFrom,
          fTimeTo: values.fTimeTo,
        },
        vehicleDetails: values.vehicles,
        visitorDetails: values.visitors,
        departmentDetails: {
          factory: values.factory,
          department: values.department,
        },
      };

      const response = await axios.post(
        `${apiUrl}/visitor/updatevisit-reception`,
        formData,
        {
          headers: { "X-CSRF-Token": csrfToken },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        swal
          .fire({
            title: "Success!",
            text: "Visit updated successfully",
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          })
          .then(() => {
            navigate(-1); // Go back to previous page
          });
      }
    } catch (error) {
      let errorMessage = "An error occurred during update";
      if (error.response) {
        if (error.response.data.errors) {
          errorMessage = error.response.data.errors
            .map((err) => err.msg)
            .join(", ");
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      }
      swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="visitor-container">
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <form onSubmit={formik.handleSubmit}>
        <h1 className="vTitle">Edit Visitor Registration</h1>

        {/* Factory and Department Selection */}
        <div className="vFactoryDepartment">
          <div>
            <label>
              Visiting Factory <span className="text-red-600">*</span>
            </label>
            <select
              name="factory"
              className="vInput"
              onChange={handleDepartmentChange}
              onBlur={formik.handleBlur}
              value={formik.values.factory}
            >
              <option value="">Select Factory</option>
              {factories.map((factory) => (
                <option key={factory.Factory_Id} value={factory.Factory_Id}>
                  {factory.Factory_Name}
                </option>
              ))}
            </select>
            {formik.touched.factory && formik.errors.factory && (
              <p className="error">{formik.errors.factory}</p>
            )}
          </div>

          <div>
            <label>
              Visiting Department <span className="text-red-600">*</span>
            </label>
            <select
              name="department"
              className="vInput"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.department}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.Department_Id} value={dept.Department_Id}>
                  {dept.Department_Name}
                </option>
              ))}
            </select>
            {formik.touched.department && formik.errors.department && (
              <p className="error">{formik.errors.department}</p>
            )}
          </div>
        </div>

        {/* Contact Person and Date/Time Sections */}
        <div className="contactDateTimeDiv flex">
          {/* Contact Person Details */}
          <div className="contactDiv vsub-div">
            <div className="top subTpk">Contact Persons Details</div>
            <div className="bottom">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label>
                        Contact Person <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cName"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.cName}
                      />
                      {formik.touched.cName && formik.errors.cName && (
                        <p className="error">{formik.errors.cName}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>
                        NIC Number <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cNIC"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.cNIC}
                      />
                      {formik.touched.cNIC && formik.errors.cNIC && (
                        <p className="error">{formik.errors.cNIC}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>
                        Mobile No <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cMobileNo"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.cMobileNo}
                      />
                      {formik.touched.cMobileNo && formik.errors.cMobileNo && (
                        <p className="error">{formik.errors.cMobileNo}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Email</label>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="vInput"
                        name="cEmail"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.cEmail}
                      />
                      {formik.touched.cEmail && formik.errors.cEmail && (
                        <p className="error">{formik.errors.cEmail}</p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visiting Date & Time */}
          <div className="contactDiv vsub-div">
            <div className="top subTpk">Visiting Date & Time</div>
            <div className="bottom">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label>
                        From <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="date"
                        name="dateFrom"
                        className="vInput w-full mb-1"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.dateFrom}
                      />
                      {formik.touched.dateFrom && formik.errors.dateFrom && (
                        <p className="error">{formik.errors.dateFrom}</p>
                      )}
                      <div className="text-left flex">
                        <input
                          type="time"
                          name="fTimeFrom"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fTimeFrom}
                        />
                        <span className="ml-6 mr-6">To</span>
                        <input
                          type="time"
                          name="fTimeTo"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.fTimeTo}
                        />
                      </div>
                      {formik.touched.fTimeFrom && formik.errors.fTimeFrom && (
                        <p className="error">{formik.errors.fTimeFrom}</p>
                      )}
                      {formik.touched.fTimeTo && formik.errors.fTimeTo && (
                        <p className="error">{formik.errors.fTimeTo}</p>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>
                        To <span className="text-red-600">*</span>
                      </label>
                    </td>
                    <td>
                      <input
                        type="date"
                        className="vInput w-full mb-1"
                        name="dateTo"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.dateTo}
                      />
                      {formik.touched.dateTo && formik.errors.dateTo && (
                        <p className="error">{formik.errors.dateTo}</p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vehicle and Visitor Details Sections */}
        <div className="contactDateTimeDiv flex">
          {/* Vehicle Details */}
          <div className="contactDiv vsub-div">
            <div className="top subTpk">Vehicle Details</div>
            <div className="bottom">
              <table className="tblVehicles">
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Vehicle No</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.vehicles.map((vehicle, index) => (
                    <tr key={index} className="trVehicle">
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          name="Vehicle_Type"
                          value={vehicle.Vehicle_Type}
                          onChange={(e) => handleVehicleChanges(index, e)}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.vehicles?.[index]?.Vehicle_Type &&
                          formik.errors.vehicles?.[index]?.Vehicle_Type && (
                            <p className="error">
                              {formik.errors.vehicles[index].Vehicle_Type}
                            </p>
                          )}
                      </td>
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          name="Vehicle_No"
                          value={vehicle.Vehicle_No}
                          onChange={(e) => handleVehicleChanges(index, e)}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.vehicles?.[index]?.Vehicle_No &&
                          formik.errors.vehicles?.[index]?.Vehicle_No && (
                            <p className="error">
                              {formik.errors.vehicles[index].Vehicle_No}
                            </p>
                          )}
                      </td>
                      <td style={{ border: "0" }}>
                        <FaPlusCircle
                          className="vf-icon hover:text-green-600"
                          onClick={handleVehiclePlus}
                        />
                        <MdDelete
                          onClick={(e) => removeVehicle(e, index)}
                          className="vf-icon hover:text-red-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visitor Details */}
          <div className="contactDiv vsub-div">
            <div className="top subTpk">Visitor Details</div>
            <div className="bottom">
              <table className="tblVehicles w-full">
                <thead>
                  <tr>
                    <th>Visitor Name</th>
                    <th>NIC</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.visitors.map((visitor, index) => (
                    <tr key={index}>
                      <td className="tdVehicle">
                        <input
                          type="text"
                          className="vTblInput"
                          name="Visitor_Name"
                          value={visitor.Visitor_Name}
                          onChange={(e) => handleVisitorChanges(index, e)}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.visitors?.[index]?.Visitor_Name &&
                          formik.errors.visitors?.[index]?.Visitor_Name && (
                            <p className="error">
                              {formik.errors.visitors[index].Visitor_Name}
                            </p>
                          )}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="vTblInput"
                          name="Visitor_NIC"
                          value={visitor.Visitor_NIC}
                          onChange={(e) => handleVisitorChanges(index, e)}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.visitors?.[index]?.Visitor_NIC &&
                          formik.errors.visitors?.[index]?.Visitor_NIC && (
                            <p className="error">
                              {formik.errors.visitors[index].Visitor_NIC}
                            </p>
                          )}
                      </td>
                      <td style={{ border: "0", width: "1%" }}>
                        <FaPlusCircle
                          className="vf-icon hover:text-green-600"
                          onClick={handleVisitorsPlus}
                        />
                        <MdDelete
                          onClick={(e) => removeVisitor(e, index)}
                          className="vf-icon hover:text-red-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mt-12 text-center guidLine">
          <input
            type="checkbox"
            id="guidelines"
            checked={!disableSubmitButton}
            onChange={() => setDisableSubmitButton(!disableSubmitButton)}
          />
          <label htmlFor="guidelines">
            I agree to all the guidelines provided by the company
          </label>
        </div>

        {disableSubmitButton && (
          <p className="error text-center">
            You must accept our terms & conditions
          </p>
        )}

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={
              disableSubmitButton || !formik.isValid || formik.isSubmitting
            }
            className="mr-5 mt-4 vBtn"
          >
            {formik.isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVisitor;
