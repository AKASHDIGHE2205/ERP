import express from 'express';
import db from '../db.js';
const router = express.Router();

//APi to booking meet
router.post("/bookmeet", async (req, res) => {
  const { meet_date, meet_hall, rows, user_name, location } = req.body;
  // console.log(meet_date, meet_hall, rows, user_name, location);
  const sql = `INSERT INTO meet_book (meet_date, meet_hall, meet_time, user_name, meet_detail, location) VALUES (?,?,?,?,?,?)`;
  try {

    for (const entry of rows) {
      const { time, details } = entry;

      await new Promise((resolve, reject) => {
        db.query(sql, [meet_date, meet_hall, time, user_name, details, location], (err, results) => {
          if (err) {
            console.error("Error booking hall: ", err);
            reject(err);
          }
          else {
            resolve(results);
          }
        });
      });
    }
    // console.log("Hall Booking Success...!");
    res.status(200).json({ message: "Hall Booking Success...!" });

  } catch (err) {
    // console.error("Error booking hall");
    res.status(500).json({ error: "Error booking hall" });
  }
});

//Api to view todays all meeting schedule
router.get("/viewmeet", (req, res) => {

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];

  const sql = `SELECT meet_date, meet_hall,  user_name, location ,meet_time,meet_detail  FROM meet_book WHERE meet_date = ?`;

  db.query(sql, [formattedDate], (err, results) => {
    if (err) {
      console.error("Error retrieving data from database: ", err);
      return res.status(500).json({ error: "Error retrieving data from database" });
    }
    return res.status(200).json(results);
  });
});

export default router;