require("rootpath")();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const errorHandler = require("middleware/error-handler");
const getUserAgent = require("middleware/user-agent"); //raw agent
const useragent = require("express-useragent");
const app = express();
app.use(express.static(path.join(__dirname, "public")));

//enable cors for test or 3rd party
const corsOptions = {
  origin: "http://localhost:8081",
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

//beautify and flatten request;
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(useragent.express()); //access with

//database init/create
const db = require("models/index");
db.sequelize.sync();
/*force: true will drop the table if it already exists*/
/*db.sequelize.sync({force: true}).then(() => {
   console.log('Drop and Resync Database with { force: true }');
   initial();
  });
*/

// api routes
app.use("/api/auth", require("routes/auth.routes"));
app.use("/api/users", require("routes/user.routes"));
app.use("/api/images", require("routes/image.routes"));
app.use("/api/locations", require("routes/location.routes"));
app.use("/api/reviews", require("routes/review.routes"));
app.use("/api/tours", require("routes/tour.routes"));
app.use("/api/uploads", require("routes/upload.routes"));
app.use("/api/:path", (req, res, next) => {
  res.status(403).send('You don\'t have permission to view this source');
});
app.use("/", require("routes/public.routes"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname,'public/404.html'));
});


// global error handler
app.use(errorHandler);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
