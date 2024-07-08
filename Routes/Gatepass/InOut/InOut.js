import express from "express";
import db from "../../db.js";
import { wsServer } from '../../../app.js';
import WebSocket from 'ws';


const router = express.Router();
//Get Gespass details of todays gpass
router.get("/getgpass", (req, res) => {
  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      a.gp_date, 
      a.gp_no, 
      CONCAT(b.last_name, ' ', b.first_name, ' ', b.middle_name) AS emp_name,
      b.emp_id,
      a.from_loc_id AS from_loc_id, 
      d.loc_name AS from_loc_name, 
      c.loc_name AS to_loc_name, 
      'Official' AS gp_type, 
      post AS post_flag
    FROM gp_hd AS a
    JOIN employees AS b ON a.emp_id = b.emp_id
    JOIN mst_loc AS c ON a.to_loc_id = c.loc_id
    JOIN mst_loc AS d ON a.from_loc_id = d.loc_id
    WHERE a.gp_type = 'O' AND a.gp_status = 'O' AND a.gp_date = ?
    
    UNION
    
    SELECT 
      a.gp_date, 
      a.gp_no, 
      CONCAT(b.last_name, ' ', b.first_name, ' ', b.middle_name) AS emp_name,
      b.emp_id,
      a.from_loc_id AS from_loc_id, 
      '' AS from_loc_name, 
      '' AS to_loc_name, 
      'Personal' AS gp_type, 
      post AS post_flag
    FROM gp_hd AS a
    JOIN employees AS b ON a.emp_id = b.emp_id
    WHERE a.gp_type = 'P' AND a.gp_status = 'O' AND a.gp_date = ?
  `;

  db.query(sql, [currentDate, currentDate], (err, results) => {
    if (err) {
      console.error("Error retrieving data from database:", err);
      return res.status(500).json({ error: "Failed to fetch data from database" });
    }
    res.status(200).json(results);
  });
});

//Gate Pass Out Entry
router.post("/gpout", (req, res) => {
  const { gp_date, gp_no, gp_flag, gp_loc } = req.body;

  // console.log("Date:-", gp_date, "Flag:-", gp_flag, "gp_no:-", gp_no, "Loc_id:-", gp_loc);

  // SQL query to get the max sr_no for the given date and gp_no
  const getMaxSrNoSql = `SELECT COALESCE(MAX(sr_no), 0) AS max_sr_no FROM gp_dt WHERE gp_date = ? AND gp_no = ?`;

  db.query(getMaxSrNoSql, [gp_date, gp_no], (err, results) => {
    if (err) {
      console.error("Error retrieving max sr_no: ", err);
      res.status(500).json({
        error: "Something went wrong while retrieving max sr_no from the database",
      });
      return;
    }

    const maxSrNo = results[0].max_sr_no;
    const newSrNo = maxSrNo + 1;
    // console.log(newSrNo);

    // SQL query to insert the new record
    const insertSql = `INSERT 
                          INTO gp_dt (gp_date, gp_no, sr_no, gp_flag, gp_time, gp_loc, btn_out)
                       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, false)`;

    db.query(insertSql, [gp_date, gp_no, newSrNo, gp_flag, gp_loc], (err, result) => {
      if (err) {
        console.error("Error Creating Gatepass: ", err);
        res.status(500).json({
          error: "Error Creating Gatepass",
        });
        return;
      }

      // Update btn_out to true
      const updateBtnOutSql = `UPDATE gp_dt SET btn_out = true WHERE gp_date = ? AND gp_no = ? AND sr_no = ? AND gp_loc = ?`;
      db.query(updateBtnOutSql, [gp_date, gp_no, newSrNo, gp_loc], (updateErr) => {
        if (updateErr) {
          console.error("Error updating btn_out status: ", updateErr);
          res.status(500).json({
            error: "Error updating btn_out status in the database",
          });
          return;
        }
        wsServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ button: 'true' }));
          }
        });

        // console.log("Employee Out...!");
        res.status(200).json({ message: "Gatepass Added...!", btn_out: true, location: gp_loc });
      });
    });
  });
});

//Gate Pass in Entry
router.post("/gpin", (req, res) => {
  const { gp_date, gp_no, gp_flag, gp_loc } = req.body;

  // console.log("Date:-", gp_date, "Flag:-", gp_flag, "gp_no:-", gp_no, "Loc_id:-", gp_loc);

  // SQL query to get the max sr_no for the given date and gp_no
  const getMaxSrNoSql = `SELECT COALESCE(MAX(sr_no), 0) AS max_sr_no FROM gp_dt WHERE gp_date = ? AND gp_no = ?`;

  db.query(getMaxSrNoSql, [gp_date, gp_no], (err, results) => {
    if (err) {
      console.error("Error retrieving max sr_no: ", err);
      res.status(500).json({
        error: "Something went wrong while retrieving max sr_no from the database",
      });
      return;
    }

    const maxSrNo = results[0].max_sr_no;
    const newSrNo = maxSrNo + 1;
    // console.log(newSrNo);

    // SQL query to insert the new record
    const insertSql = `INSERT 
                          INTO gp_dt (gp_date, gp_no, sr_no, gp_flag, gp_time, gp_loc, btn_out)
                       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(), ?, false)`;

    db.query(insertSql, [gp_date, gp_no, newSrNo, gp_flag, gp_loc], (err, result) => {
      if (err) {
        console.error("Error Creating Gatepass: ", err);
        res.status(500).json({
          error: "Error Creating Gatepass",
        });
        return;
      }

      // Update btn_out to true
      const updateBtnInSql = `UPDATE gp_dt SET btn_in = true WHERE gp_date = ? AND gp_no = ? AND sr_no = ? AND gp_loc = ?`;
      db.query(updateBtnInSql, [gp_date, gp_no, newSrNo, gp_loc], (updateErr) => {
        if (updateErr) {
          console.error("Error updating btn_in status: ", updateErr);
          res.status(500).json({
            error: "Error updating btn_in status in the database",
          });
          return;
        }

        // console.log("Employee In...!");
        res.status(200).json({ message: "Gatepass Added...!", btn_in: true, location: gp_loc });
      });
    });
  });
});



























//Gate Pass In Entry
// router.post("/gpin", (req, res) => {
//   const { gp_date, gp_no, gp_flag } = req.body;

//   // SQL query to get the max sr_no for the given date and gp_no
//   const getMaxSrNoSql = `SELECT COALESCE(MAX(sr_no), 0) AS max_sr_no FROM gp_dt WHERE gp_date = ? AND gp_no = ?`;

//   db.query(getMaxSrNoSql, [gp_date, gp_no], (err, results) => {
//     if (err) {
//       console.error("Error retrieving max sr_no: ", err);
//       res.status(500).json({
//         error: "Something went wrong while retrieving max sr_no from the database",
//       });
//       return;
//     }

//     const maxSrNo = results[0].max_sr_no;
//     const newSrNo = maxSrNo + 1;

//     // Ensure sr_no does not exceed 2 for each gp_no on a given date

//     if (newSrNo > 2) {
//       res.status(400).json({
//         message: "This employee already in...!",
//       });
//       return;
//     }

//     // SQL query to insert the new record
//     const insertSql = `INSERT INTO gp_dt (gp_date, gp_no, sr_no, gp_flag, gp_time) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP())`;

//     db.query(insertSql, [gp_date, gp_no, newSrNo, gp_flag], (err, result) => {
//       if (err) {
//         console.error("Error Creating Gatepass: ", err);
//         res.status(500).json({
//           error: "Error Creating Gatepass",
//         });
//         return;
//       }

//       db.query(getTimeEntriesSql, [gp_date, gp_no], (err, timeResults) => {
//         if (err) {
//           console.error("Error retrieving time entries: ", err);
//           res.status(500).json({
//             error: "Error retrieving time entries from the database",
//           });
//           return;
//         }


//         res.status(200).json({ timeDifference: timeDifferenceFormatted });
//         console.log("Employee In...!");

//         // console.log(timeDifferenceFormatted);
//       });
//     });
//   });
// });

export default router;