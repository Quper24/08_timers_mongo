const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 5);
const { ObjectId } = require("mongodb");

const findUserByUsername = async (db, username) => {
  return await db.collection("users").findOne({ username });
};

const findUserBySessionId = async (db, sessionId) => {
  const session = await db.collection("sessions").findOne(
    { sessionId },
    {
      projection: { userId: 1 },
    }
  );

  if (!session) {
    return;
  }

  return await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
};

const createSession = async (db, userId) => {
  const sessionId = nanoid();

  await db.collection("sessions").insertOne({
    userId,
    sessionId,
  });

  return sessionId;
};

const deleteSession = async (db, sessionId) => {
  await db.collection("sessions").deleteOne({ sessionId });
};

module.exports = {
  findUserByUsername,
  findUserBySessionId,
  createSession,
  deleteSession,
};
