const { findUserByUsername, createSession, deleteSession } = require("./sessionController");
const getHash = require("../utils/getHash");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 5);

const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await findUserByUsername(req.db, username);
  if (!user || user.password !== getHash(password)) {
    return res.redirect("/?authError=true");
  }
  const sessionId = await createSession(req.db, user._id);
  res.cookie("sessionId", sessionId, { httpOnly: true }).redirect("/");
};

const signUp = async (req, res) => {
  const { username, password } = req.body;

  await req.db.collection("users").insertOne({
    user_id: Number(nanoid()),
    username: username,
    password: getHash(password),
  });

  res.redirect(307, "/login");
  res.status(200);
};

const logout = async (req, res) => {
  if (!req.user) {
    return res.redirect("/");
  }
  await deleteSession(req.db, req.sessionId);
  res.clearCookie("sessionId").redirect("/");
};

module.exports = {
  login,
  signUp,
  logout,
};
