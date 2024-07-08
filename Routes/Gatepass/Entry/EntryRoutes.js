import express from 'express';
import db from '../../db.js';
import { wsServer } from '../../../app.js';
import WebSocket from 'ws';
const router = express.Router();

// POST API to insert into gp_hd table
router.post('/newgpass', async (req, res) => {
  const { gp_date, emp_id, gp_type, from_loc_id, to_loc_id, from_dept_id, to_dept_id, reason, c_by } = req.body;

  try {
    // Retrieve the maximum gp_no for the current date
    const dateCheckSql = `
      SELECT MAX(gp_no) AS max_gp_no
      FROM gp_hd
      WHERE gp_date = ?
    `;

    db.query(dateCheckSql, [gp_date], (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send({ error: 'An error occurred while retrieving the maximum gp_no.', details: err.message });
      }

      let newGpNo = 1; // Default gp_no if no records found for the current date
      if (rows.length > 0 && rows[0].max_gp_no !== null) {
        newGpNo = rows[0].max_gp_no + 1;
      }

      // Insert the new record with the incremented gp_no
      const insertSql = `
        INSERT INTO gp_hd (gp_date, gp_no, emp_id, gp_type, from_loc_id, to_loc_id, from_dept_id, to_dept_id, reason, gp_status, c_at, c_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'O', CURRENT_TIMESTAMP(), 1)
      `;

      db.query(insertSql,
        [gp_date, newGpNo, emp_id, gp_type, from_loc_id, to_loc_id, from_dept_id, to_dept_id, reason, c_by],
        (err, results) => {
          if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send({ error: 'An error occurred while inserting the new gate pass.', details: err.message });
          }

          // Notify all connected clients
          wsServer.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'NEW_ENTRY' }));
            }
          });

          // Send response after notifying clients
          res.status(201).send({ message: 'New entry created', entryId: results.insertId });
        });
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send({ error: 'An unexpected error occurred.', details: err.message });
  }
});

export default router;
