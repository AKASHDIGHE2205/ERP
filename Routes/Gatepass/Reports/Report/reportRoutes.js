import express from "express";
import db from "../../../db.js";
const router = express.Router();

//APi to generate the report of employee gatepass
// router.post("/gpassreport", (req, res) => {
//   const { start_date, end_date, emp_id, gp_type } = req.body;

//   const empIdFilter = emp_id ? emp_id : '%';
//   const gpTypeFilter = gp_type ? gp_type : '%';

//   const sql = `SELECT 
//                     a.gp_date AS gp_date, 
//                     a.gp_no AS gp_no,
//                     a.reason,
//                     MAX(CASE WHEN b.gp_flag = 'I' THEN DATE_FORMAT(b.gp_time, '%H:%i') END) AS in_time,
//                     MAX(CASE WHEN b.gp_flag = 'O' THEN DATE_FORMAT(b.gp_time, '%H:%i') END) AS out_time,
//                     a.emp_id AS emp_id, 
//                     a.gp_type,
//                     CASE 
//                       WHEN a.gp_type = 'O' THEN 'Official'
//                       WHEN a.gp_type = 'P' THEN 'Private'
//                       WHEN a.gp_type = 'W' THEN 'Without'
//                     END AS gp_type_desc,
//                     CASE 
//                       WHEN a.gp_status = 'O' THEN 'Open'
//                       WHEN a.gp_status = 'C' THEN 'Close'
//                     END AS gp_status,
//                     CONCAT(c.last_name, ' ', c.first_name, ' ', c.middle_name) AS emp_name,
//                     SEC_TO_TIME(TIMESTAMPDIFF(SECOND,MIN(b.gp_time),MAX(b.gp_time))) AS total_time
//                   FROM gp_hd AS a
//                   JOIN gp_dt AS b ON a.gp_date = b.gp_date AND a.gp_no = b.gp_no
//                   JOIN employees AS c ON a.emp_id = c.emp_id
//                   WHERE 
//                     a.gp_type IN ('O', 'P', 'W')
//                     AND a.gp_date BETWEEN ? AND ?
//                     AND (a.emp_id LIKE ? OR ? = '%')
//                     AND (a.gp_type LIKE ? OR ? = '%')
//                   GROUP BY a.gp_date, a.gp_no, a.emp_id, a.gp_type, a.gp_status
//                   ORDER BY a.emp_id, a.gp_date, a.gp_no`;

//   db.query(sql, [start_date, end_date, empIdFilter, empIdFilter, gpTypeFilter, gpTypeFilter], (err, results) => {
//     if (err) {
//       console.error("Error retrieving gate pass report: ", err);
//       res.status(500).json({ error: "Something went wrong while retrieving the gate pass report" });
//       return;
//     }

//     // Format the results to ensure emp_name is sent correctly
//     const formattedResults = results.map((row, index, arr) => {
//       if (index > 0 && row.emp_id === arr[index - 1].emp_id) {
//         // If emp_id is the same as the previous row, set emp_name to empty string
//         return { ...row, emp_name: '' };
//       }
//       return row;
//     });

//     res.status(200).json(formattedResults);
//   });
// });
router.post("/gpassreport", (req, res) => {
  const { start_date, end_date, emp_id, gp_type } = req.body;

  const empIdFilter = emp_id ? emp_id : '%';
  const gpTypeFilter = gp_type ? gp_type : '%';

  const sql = `SELECT 
                    a.gp_date AS gp_date, 
                    a.gp_no AS gp_no,
                    a.reason,
                    MIN(CASE WHEN b.gp_flag = 'I' THEN DATE_FORMAT(b.gp_time, '%H:%i') END) AS in_time,
                    MAX(CASE WHEN b.gp_flag = 'O' THEN DATE_FORMAT(b.gp_time, '%H:%i') END) AS out_time,
                    a.emp_id AS emp_id, 
                    a.gp_type,
                    CASE 
                      WHEN a.gp_type = 'O' THEN 'Official'
                      WHEN a.gp_type = 'P' THEN 'Private'
                      WHEN a.gp_type = 'W' THEN 'Without'
                    END AS gp_type_desc,
                    CASE 
                      WHEN a.gp_status = 'O' THEN 'Open'
                      WHEN a.gp_status = 'C' THEN 'Close'
                    END AS gp_status,
                    CONCAT(c.last_name, ' ', c.first_name, ' ', c.middle_name) AS emp_name,
                    SEC_TO_TIME(TIMESTAMPDIFF(SECOND,MIN(b.gp_time),MAX(b.gp_time))) AS total_time
                  FROM gp_hd AS a
                  JOIN gp_dt AS b ON a.gp_date = b.gp_date AND a.gp_no = b.gp_no
                  JOIN employees AS c ON a.emp_id = c.emp_id
                  WHERE 
                    a.gp_type IN ('O', 'P', 'W')
                    AND a.gp_date BETWEEN ? AND ?
                    AND (a.emp_id LIKE ? OR ? = '%')
                    AND (a.gp_type LIKE ? OR ? = '%')
                  GROUP BY a.gp_date, a.gp_no, a.emp_id, a.gp_type, a.gp_status
                  ORDER BY a.emp_id, a.gp_date, a.gp_no`;

  db.query(sql, [start_date, end_date, empIdFilter, empIdFilter, gpTypeFilter, gpTypeFilter], (err, results) => {
    if (err) {
      console.error("Error retrieving gate pass report: ", err);
      res.status(500).json({ error: "Something went wrong while retrieving the gate pass report" });
      return;
    }

    // Format the results to ensure emp_name is sent correctly
    const formattedResults = results.map((row, index, arr) => {
      if (index > 0 && row.emp_id === arr[index - 1].emp_id) {
        // If emp_id is the same as the previous row, set emp_name to empty string
        return { ...row, emp_name: '' };
      }
      return row;
    });

    res.status(200).json(formattedResults);
  });
});
export default router;
