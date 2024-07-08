import express from 'express';
import db from '../../db.js';
const router = express.Router();

//APi To Fetch All Society Member For Table view
router.get('/getsocmembers', (req, res) => {

  const sql = `select mem_name,  birth_date, join_date, status, status_date, mem_code 
                 from mst_member `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Error retrieving data from database:", err);
      return res.status(500).json({ error: "Failed to fetch data from database" });
    }
    res.status(200).json(results);
  });
});

//Get Mst Member for modal 
router.get('/getmember', (req, res) => {

  const sql = ` Select  concat( last_name, ' ', first_name , ' ', middle_name) as emp_name, 
                emp_id, birth_date  
                from employees as a, mst_catg as b 
                Where a.status='A' and a.catg_id = b.catg_id and b.catg_name ='Staff' 
                order by 1 `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Error retrieving data from database:", err);
      return res.status(500).json({ error: "Failed to fetch data from database" });
    }
    res.status(200).json(results);
  });
});

//Adding a new member to the society
router.post('/society/newme', (req, res) => {

  const {
    emp_id, emp_name, status, birth_date, join_date, status_date, sr_no,
    nom_name, nom_relat, nom_dob, nom_share, sr_no_bank, bank_name,
    bank_ifsc, bank_branch, bank_acc
  } = req.body;

  const sql1 = `INSERT INTO member_nominee (mem_code, sr_no, nom_name, nom_relat, nom_dob, nom_share) VALUES (?, ?, ?, ?, ?, ?)`;
  const sql2 = `INSERT INTO member_bank (mem_code, sr_no, bank_name, bank_ifsc, bank_branch, bank_acc) VALUES (?, ?, ?, ?, ?, ?)`;
  const sql3 = `INSERT INTO mst_member (mem_code, mem_name, birth_date, join_date, status, status_date, emp_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const mem_code = emp_id;

  // Start transaction
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).send('Transaction error: ' + err);
    }

    // Execute the first query
    db.query(sql1, [mem_code, sr_no, nom_name, nom_relat, nom_dob, nom_share], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send('Error executing query 1: ' + err);
        });
      }

      // Execute the second query
      db.query(sql2, [mem_code, sr_no_bank, bank_name, bank_ifsc, bank_branch, bank_acc], (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send('Error executing query 2: ' + err);
          });
        }

        // Execute the third query
        db.query(sql3, [mem_code, emp_name, birth_date, join_date, status, status_date, emp_id], (err, results) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send('Error executing query 3: ' + err);
            });
          }

          // Commit the transaction
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).send('Error committing transaction: ' + err);
              });
            }
            console.log("New member added...!");
            res.status(200).json({ message: "New member added...!" });
          });
        });
      });
    });
  });
});

//Details of specific Mem ONcclick edit
router.get('/getmem/:id', (req, res) => {

  const { id } = req.params;
  // console.log(id);

  const sql = `SELECT 
                  a.mem_code, 
                  a.mem_name, 
                  a.birth_date, 
                  a.join_date, 
                  a.status, 
                  a.status_date, 
                  a.emp_id,
                  b.sr_no AS nominee_sr_no, 
                  b.nom_name, 
                  b.nom_relat, 
                  b.nom_dob, 
                  b.nom_share,
                  c.sr_no AS bank_sr_no, 
                  c.bank_name, 
                  c.bank_ifsc, 
                  c.bank_branch, 
                  c.bank_acc
                FROM mst_member AS a
                JOIN member_nominee AS b ON a.mem_code = b.mem_code
                JOIN member_bank AS c ON a.mem_code = c.mem_code
                WHERE a.mem_code = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json("Error to fetching data ", err)
    }
    return res.status(200).json(results);
  });
});

//Api to update the society members details
router.put("/UpdateEmp/:emp_id", (req, res) => {
  const { emp_id } = req.params;

  const { status, status_date,
    nom_name, nom_relat, nom_dob, nom_share, bank_name,
    bank_ifsc, bank_branch, bank_acc } = req.body;
  console.log(emp_id);
  console.log(
    " status:-", status,
    " status_date:-", status_date,
    " nom_name:-", nom_name,
    " nom_relat:-", nom_relat,
    " nom_dob:-", nom_dob,
    " nom_share:-", nom_share,
    " bank_name:-", bank_name,
    " bank_ifsc:-", bank_ifsc,
    " bank_branch:-", bank_branch,
    " bank_acc:-", bank_acc
  );

  // Begin transaction
  db.beginTransaction((err) => {
    if (err) {
      console.log("Error starting transaction");
      return res.status(500).json({ error: "Error starting transaction" });
    }

    const sql1 = `UPDATE member_nominee SET nom_name = ?, nom_relat = ?, nom_dob = ?, nom_share = ? WHERE mem_code = ?`;
    db.query(sql1, [nom_name, nom_relat, nom_dob, nom_share, emp_id], (err, results1) => {
      if (err) {
        return db.rollback(() => {
          console.log("Error updating member_nominee table 1", err);
          res.status(500).json({ error: "Error updating member_nominee table", details: err });
        });
      }

      const sql2 = `UPDATE member_bank SET bank_name = ?, bank_ifsc = ?, bank_branch = ?, bank_acc = ? WHERE mem_code = ?`;
      db.query(sql2, [bank_name, bank_ifsc, bank_branch, bank_acc, emp_id], (err, results2) => {
        if (err) {
          return db.rollback(() => {
            console.log("Error updating member_bank table 2", err);
            res.status(500).json({ error: "Error updating member_bank table", details: err });
          });
        }

        const sql3 = `UPDATE mst_member SET status = ?, status_date = ? WHERE mem_code = ?`;
        db.query(sql3, [status, status_date, emp_id], (err, results3) => {
          if (err) {
            return db.rollback(() => {
              console.log("Error updating mst_member table 3", err);
              res.status(500).json({ error: "Error updating mst_member table", details: err });
            });
          }
          // Commit the transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: "Error committing transaction", details: err });
              });
            }

            res.status(200).json({ message: "Employee details updated successfully" });
          });
        });
      });
    });
  });
});

//Api  to view all Groups in table
router.get('/viewgroup', (req, res) => {
  const sql = `SELECT g.group_code, g.group_name, g.main_code, m.group_name AS main_group
FROM mst_group AS g
LEFT JOIN mst_group AS m ON g.main_code = m.group_code`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data from database:", err);
      return res.status(500).json({ error: "Error fetching data from database", details: err });
    }
    return res.status(200).json(results);
  });
});

//Api to add New group
router.post("/newgroup", (req, res) => {
  const { group_name, main_group } = req.body;

  // console.log(group_name, main_group);

  const getMaxCodeSql = `SELECT MAX(group_code) AS max_group_code FROM mst_group`;


  db.query(getMaxCodeSql, (err, results) => {
    if (err) {
      console.error("Error adding group:", err);
      return res.status(500).json({ error: "Error adding group", details: err.message });
    }
    const maxGrpCode = results[0].max_group_code;
    const newGrpCode = maxGrpCode ? maxGrpCode + 1 : 0;

    const sql = `INSERT INTO mst_group ( group_code,group_name, main_code) VALUES (?,?, ?)`;
    db.query(sql, [newGrpCode, group_name, main_group], (err, results) => {
      if (err) {
        console.error("Error adding group:", err);
        return res.status(500).json({ error: "Error adding group", details: err.message });
      }
      return res.status(200).json({ message: "New group added successfully...!" });
    });
  });
});

//Api to view all account
router.get("/accview", (req, res) => {

  const sql = `SELECT a.acc_code, a.account_name,b.group_name
FROM mst_account AS a
JOIN mst_group AS b ON a.group_code = b.group_code;
`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error to retriving data", details: err })
    }
    return res.status(200).json(results);
  })
});

//Api to create new account
router.post("/newacc", (req, res) => {
  const { account_name, group_code } = req.body;

  // First, get the max acc_code
  const getMaxAccCodeSql = `SELECT MAX(acc_code) AS max_acc_code FROM mst_account`;

  db.query(getMaxAccCodeSql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error retrieving data from database", details: err });
    }

    // Calculate new acc_code
    const maxAccCode = results[0].max_acc_code;
    const newAccCode = maxAccCode ? maxAccCode + 1 : 0; // If no records found, start from 1

    // Insert the new account
    const insertSql = `INSERT INTO mst_account (acc_code, account_name, group_code) VALUES (?, ?, ?)`;
    db.query(insertSql, [newAccCode, account_name, group_code], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error inserting data into database", details: err });
      }

      res.status(200).json({ message: "New Account created...!" });
    });
  });
});

//Api to view all schemes
router.get("/schemeview", (req, res) => {
  const sql = `SELECT 
      a.scheme_code,
      a.scheme_name,
      a1.account_name AS loan_ac,
      a2.account_name AS interest
    FROM mst_scheme AS a
    JOIN mst_account AS a1 ON a.loan_acc = a1.acc_code
    JOIN mst_account AS a2 ON a.interest_acc = a2.acc_code`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error to retriving data", details: err })
    }
    return res.status(200).json(results);
  })
});

//Api too add new Schemes
router.post("/newscheme", (req, res) => {
  const { scheme_name, scheme_period, loan_acc, interest_acc, int_rate } = req.body;

  // console.log(scheme_name, scheme_period, loan_acc, interest_acc, int_rate);

  // Determine the first letter of the scheme_name
  const firstLetter = scheme_name.charAt(0).toUpperCase();

  const maxSchemeCodeSql = `SELECT MAX(scheme_code) AS max_code FROM mst_scheme WHERE scheme_code LIKE '${firstLetter}%'  `;

  db.query(maxSchemeCodeSql, (err, rows) => {
    if (err) {
      console.error("Error retrieving max scheme_code:", err);
      return res.status(500).json({ error: "Error retrieving max scheme_code", details: err.message });
    }

    let newSchemeCode;
    if (rows[0].max_code) {
      // Extract the numeric part from the max_code
      const lastNumber = parseInt(rows[0].max_code.substr(1));
      const nextNumber = lastNumber + 1;
      newSchemeCode = `${firstLetter}${nextNumber.toString().padStart(2, '0')}`;
    } else {
      // If no scheme_code exists starting with the firstLetter, start with '01'
      newSchemeCode = `${firstLetter}01`;
    }

    // Insert the new scheme record
    const insertSql = `INSERT INTO mst_scheme (scheme_code, scheme_name, scheme_period, loan_acc, interest_acc, int_rate) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(insertSql, [newSchemeCode, scheme_name, scheme_period, loan_acc, interest_acc, int_rate], (err, results) => {
      if (err) {
        console.error("Error adding scheme:", err);
        return res.status(500).json({ error: "Error adding scheme", details: err.message });
      }
      return res.status(200).json({ message: "New scheme added successfully" });
    });
  });
});

export default router;

