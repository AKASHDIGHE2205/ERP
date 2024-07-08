import express from 'express';
import db from '../db.js';
const router = express.Router();

//Api to creating new request
router.post("/newvehreq", (req, res) => {
  const { req_date, traveller_name, traveller_mobile, req_type, city_name, to_city, veh_type, depart_date,
    depart_time, arrive_date, arrive_time, details, auth_id, auth_name, auth_mobile } = req.body;

  const sql = `INSERT INTO veh_req 
                (req_date, req_no, traveller_name, traveller_mobile, req_type, city_name, to_city, veh_type,
                depart_date, arrive_date, details, c_date, c_by , trip_status, auth_id, sanc_status) 
               VALUES (?,?, ?, ?,?,?,?,?, ?,?,?,CURRENT_TIMESTAMP( ),?,'O', ?,'X'`;

  db.query(sql, [req_date, traveller_name, traveller_mobile, req_type, city_name, to_city, veh_type, depart_date,
    depart_time, arrive_date, arrive_time, details, auth_id, auth_name, auth_mobile], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Something Went Wrong ", details: err });
      }
      res.status(200).json({ message: "Request Succesfully send...!" });
    })

});

router.get("/viewvehreq", (req, res) => {
  const sql = `SELECT * FROM veh_req`;
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Something went wrong", details: err });
    }
    res.status(200).json(results);
  })
});

export default router;