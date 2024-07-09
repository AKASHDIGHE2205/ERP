import express from 'express';
import db from '../../../db.js';
const router = express.Router();

// Middleware to parse JSON bodies
router.use(express.json());

//VIew All Member 
router.get("/employee", (req, res) => {
  const sql = `
    SELECT CONCAT(a.first_name, ' ', a.middle_name, ' ', a.last_name) AS emp_name, 
           a.birth_date, a.join_date, a.gender, a.emp_id, a.off_day, a.status,
           b.dept_name, c.loc_name, d.desg_name, e.catg_name 
    FROM employees AS a
    LEFT JOIN mst_dept AS b ON a.dept_id = b.dept_id
    LEFT JOIN mst_loc AS c ON a.loc_id = c.loc_id
    LEFT  JOIN mst_desg AS d ON a.desg_id = d.desg_id
    LEFT JOIN mst_catg AS e ON a.catg_id = e.catg_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving data from MySQL:", err);
      res.status(500).json({ error: "Failed to retrieve data from the database" });
      return;
    }
    res.status(200).json(results);
  });
});

// Specific Member details
router.get("/empview/:emp_id", async (req, res) => {
  const emp_id = req.params.emp_id;

  // Validate if the application number is a positive integer
  if (!/^\d+$/.test(emp_id) || emp_id <= 0) {
    return res.status(400).json({ error: "Invalid Member Id" });
  }

  const sql = "SELECT a.emp_id, a.first_name, a.middle_name, a.last_name, a.status, a.birth_date, a.off_day, " +
    " a.join_date, a.gender, a.desg_id, b.desg_name, a.catg_id, c.catg_name, a.dept_id, d.dept_name, " +
    " a.loc_id, e.loc_name, a.email_id, a.mobile_no, f.user_role AS userrole, ifsc_code, bank_account, ext_code, " +
    " g.vc_comp_name, a.vc_comp_code " +
    " FROM employees AS a " +
    " INNER JOIN mst_desg AS b ON a.desg_id = b.desg_id " +
    " INNER JOIN mst_catg AS c ON a.catg_id = c.catg_id " +
    " INNER JOIN mst_dept AS d ON a.dept_id = d.dept_id " +
    " INNER JOIN mst_loc AS e ON a.loc_id = e.loc_id " +
    " INNER JOIN users AS f ON f.user_id = a.user_id " +
    " LEFT OUTER JOIN mst_company AS g ON a.vc_comp_code = g.vc_comp_code AND a.ext_code = g.server_name " +
    " WHERE emp_id = ?";

  db.query(sql, [emp_id], (err, results) => {
    if (err) {
      console.log("Error Retrieving Data:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve data from the database" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.status(200).json(results[0]);
  });
});

//Update Member Details
router.put('/empedit/:emp_id', (req, res) => {
  const { emp_id } = req.params;
  const { off_day, userrole, email_id, mobile_no, desg_id, catg_id, status, ifsc_code, bank_account, vc_comp_code, server_name } = req.body;

  const sqloffday = "UPDATE employees SET off_day = ?, email_id = ?, mobile_no = ?, desg_id = ?, catg_id = ?, status = ?, ifsc_code = ?, bank_account = ?, vc_comp_code = ?, ext_no = ? WHERE emp_id = ?";
  db.query(sqloffday, [off_day, email_id, mobile_no, desg_id, catg_id, status, ifsc_code, bank_account, vc_comp_code, server_name, emp_id], (err1, results1) => {
    if (err1) {
      console.error("Error updating employee:", err1);
      return res.status(500).json({ error: "Internal server error" });
    }

    const sqlrole = "UPDATE users SET user_role = ?, email_id = ?, mobile_no = ? WHERE user_id = (SELECT user_id FROM employees WHERE emp_id = ?)";
    db.query(sqlrole, [userrole, email_id, mobile_no, emp_id], (err2, results2) => {
      if (err2) {
        console.error("Error updating user:", err2);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.status(200).json({ message: "Employee updated successfully" });
    });
  });
});

export default router;