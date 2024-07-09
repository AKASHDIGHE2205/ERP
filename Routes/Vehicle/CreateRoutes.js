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

//Api to get all veh requirement
router.get("/viewvehreq", (req, res) => {
  const sql = ` Select a.req_date, a.req_no, a.traveller_name, a.traveller_mobile, a.city_name, a.to_city, 
                         IF(a.req_type = 'O', 'Official', IF(a.req_type = 'S', 'Scheme' , 'Private' )) as req_type,  a.depart_date, a.arrive_ date, a.details ,
                         IF(a.veh_type = 'S', 'Small', IF(a.veh_type = 'B', 'Big', IF(a.veh_type = 'R', 'Rent','VIP'))) as veh_type , 
                         DATE_FORMAT(a.depart_date, '%H:%i') depart_time ,  DATE_FORMAT(a.arrive_date, '%H:%i') arrive_time, a.sanc_status, 
                        c.auth_name 
                from veh_req as a,   authorities as c where  a.auth_id = c.auth_id   and a.trip_status = 'O' `;
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Something went wrong", details: err });
    }
    res.status(200).json(results);
  })
});

export default router;