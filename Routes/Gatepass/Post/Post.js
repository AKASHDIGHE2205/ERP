import express, { text } from "express";
import db from "../../db.js";
const router = express.Router();

//VIew all gatepass for post screen
router.get("/getpostdata", (req, res) => {
  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];

  // SQL query to retrieve data for the current date, including records where gp_type is 'P'
  const sql = `
    SELECT 
      CONCAT(b.first_name, ' ', b.middle_name, ' ', b.last_name) AS emp_name,
      a.gp_date,
      a.gp_no,
      a.gp_type,
      IF(a.gp_type = 'P', NULL, c1.loc_name) AS from_loc_name,
      IF(a.gp_type = 'P', NULL, c2.loc_name) AS to_loc_name
    FROM 
      gp_hd AS a
    JOIN 
      employees AS b ON a.emp_id = b.emp_id  
    LEFT JOIN 
      mst_loc AS c1 ON a.from_loc_id = c1.loc_id
    LEFT JOIN 
      mst_loc AS c2 ON a.to_loc_id = c2.loc_id
    WHERE 
      a.gp_date = ?
  `;

  // Execute the query with the current date as a parameter
  db.query(sql, [currentDate], (err, results) => {
    if (err) {
      console.error("Error retrieving data from database", err);
      return res.status(500).json({ error: "Error retrieving data from database", details: err });
    }
    return res.status(200).json(results);
  });
});

//VIew all gatepass for post screen
router.get("/getspeemp/:gp_no", (req, res) => {
  const { gp_no } = req.params;
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  const sql = `SELECT 
                CONCAT(b.first_name, ' ', b.middle_name, ' ', b.last_name) AS emp_name,
                a.gp_date,
                a.gp_no,
                a.gp_type,
                a.reason, 
                IF(a.gp_type = 'P', NULL, c1.loc_name) AS from_loc_name,
                IF(a.gp_type = 'P', NULL, c2.loc_name) AS to_loc_name,
                IF(a.gp_type = 'P', NULL, d1.dept_name) AS from_dept_name, 
                IF(a.gp_type = 'P', NULL, d2.dept_name) AS to_dept_name
              FROM 
                gp_hd AS a
              JOIN 
                employees AS b ON a.emp_id = b.emp_id  
              LEFT JOIN 
                mst_loc AS c1 ON a.from_loc_id = c1.loc_id
              LEFT JOIN 
                mst_loc AS c2 ON a.to_loc_id = c2.loc_id
              LEFT JOIN 
                mst_dept AS d1 ON a.from_dept_id = d1.dept_id
              LEFT JOIN 
                mst_dept AS d2 ON a.to_dept_id = d2.dept_id
              WHERE 
                a.gp_no = ? AND a.gp_date = ?`;

  db.query(sql, [gp_no, currentDate], (err, results) => {
    if (err) {
      console.error("Error retrieving data from database", err);
      return res.status(500).json({ error: "Error retrieving data from database", details: err });
    }

    return res.status(200).json(results);
  });
});

//Api for post the gatepass
router.post("/postgpass", (req, res) => {
  const { post, gp_no } = req.body;
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

  const sql = `UPDATE gp_hd SET post = ? WHERE gp_no = ? AND gp_date = ?`;

  db.query(sql, [post, gp_no, currentDate], (err, results) => {
    if (err) {
      console.error("Error in posting the gatepass", err);
      return res.status(500).json({ error: "Error in posting the gatepass", details: err });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Gatepass not found for the given gp_no and gp_date" });
    }
    if (results.affectedRows > 0) {
      return res.status(400).json({ test: "This getpass already posted...!" });
    }
    return res.status(200).json({ message: "Gatepass posted successfully...!" });
  });
});

export default router;