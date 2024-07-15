const { findUserBySessionId } = require("./sessionController");
const connectToDb = require("../config/mongoDB");
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("1234567890", 5);

const getTimers = async (req, res) => {
  try {
    const db = req.db;
    const user = await findUserBySessionId(db, req.cookies["sessionId"]);
    req.user = user;
    const timer = await db
      .collection("timers")
      .find({
        isActive: true,
        user_id: user.user_id,
      })
      .toArray();

    return res.json(timer);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createTimer = async (req, res) => {
  try {
    const { description } = req.body;
    const user = await findUserBySessionId(req.db, req.cookies["sessionId"]);

    const newTimer = {
      start: new Date(Date.now()),
      description: description,
      user_id: user.user_id,
      progress: 0,
      isActive: true,
      id: Number(nanoid()),
    };

    await req.db.collection("timers").insertOne(newTimer);

    return res.json(newTimer);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const stopTimer = async (req, res) => {
  try {
    // const user = await findUserBySessionId(req.db, req.cookies["sessionId"]);

    const oldTimerDB = await req.db.collection("timers").findOne({
      id: Number(req.params["id"]),
    });

    const oldTimer = {
      start: new Date(Date.now() - oldTimerDB.progress),
      end: new Date(Date.now()),
      duration: oldTimerDB.progress,
      isActive: false,
      user_id: oldTimerDB.user_id,
      description: oldTimerDB.description,
      progress: null,
    };

    await req.db.collection("timers").findOneAndUpdate(
      {
        id: Number(req.params["id"]),
      },
      {
        $set: oldTimer,
      }
    );
    res.status(200).json({ ok: "OK" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function increaseCount() {
  try {
    const db = await connectToDb();
    setInterval(async () => {
      await db.collection("timers").updateMany(
        {
          isActive: true,
        },
        {
          $inc: { progress: 1000 },
        },

        {
          returnOriginal: true,
        }
      );
    }, 1000);
  } catch (error) {
    console.log("Failed to increase", error);
    throw error;
  }
}

module.exports = {
  increaseCount,
  getTimers,
  createTimer,
  stopTimer,
};
