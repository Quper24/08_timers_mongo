require("dotenv").config();

const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const { increaseCount } = require("./controllers/timerController");
const connectToDb = require("./config/mongoDB");

const app = express();
const PORT = process.env.PORT || 3000;

nunjucks.configure("views", {
  autoescape: true,
  express: app,
  tags: {
    blockStart: "[%",
    blockEnd: "%]",
    variableStart: "[[",
    variableEnd: "]]",
    commentStart: "[#",
    commentEnd: "#]",
  },
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDb();
    next();
  } catch (error) {
    next(error);
  }
});

const authRoutes = require("./routes/authRoutes");
const timerRoutes = require("./routes/timerRoutes");
const indexRoutes = require("./routes/indexRoutes");

app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/", timerRoutes);

const init = async () => {
  try {
    increaseCount();

    app.listen(PORT, () => {
      console.log(`  Listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();
