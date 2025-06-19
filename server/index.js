const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const db = require("./models");
require("dotenv").config();

const server = express();

// Middleware setup
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
};
server.use(cors(corsOptions));

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
server.use(csrfProtection);

// Routes
const userRoutes = require("./Routes/UserRoutes.js");
server.use("/user", userRoutes);

const departmentRoutes = require("./Routes/DepartmentRoutes.js");
server.use("/department", departmentRoutes);

const visitorRoutes = require("./Routes/VisitorRoutes.js");
server.use("/visitor", visitorRoutes);

const userCategories = require("./Routes/UserCategoryRoutes.js");
server.use("/userCategory", userCategories);

// CSRF token route
server.get("/getCSRFToken", (req, res) => {
  console.log("CSRF token requested");
  res.json({ csrfToken: req.csrfToken() });
});

// Start server
const port = process.env.PORT || 4000;
db.sequelize.sync().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
});
