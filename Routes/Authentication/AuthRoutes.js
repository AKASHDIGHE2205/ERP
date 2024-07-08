import express from "express";
import mysql from "mysql";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from "../db.js"

const router = express.Router();
const SECRET_KEY = 'My_Strong_secret_key';


function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1m' }); // Adjust expiresIn as needed
}

// router.post('/sign-up', (req, res) => {
//   const { phone, firstname, lastname, email, password } = req.body;

//   // Check if email already exists
//   db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
//     if (err) {
//       console.error('Error checking email:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     if (rows.length > 0) {
//       console.log("Email already Exist");
//       return res.status(400).json({ message: 'Email already exists' });
//     }

//     // If email does not exist, create the user
//     db.query('INSERT INTO users ( phone, firstname,lastname, email, password) VALUES (?,?,?,?,?)', [phone, firstname, lastname, email, password], (err, result) => {
//       if (err) {
//         console.error('Error inserting user:', err);
//         return res.status(500).json({ message: 'Internal server error' });
//       }

//       // Generate JWT token for the newly created user
//       const userId = result.insertId;
//       const isAdmin = false;

//       const tokenPayload = { email, userId, isAdmin };
//       const token = generateToken(tokenPayload);

//       res.status(201).json({ message: 'User created successfully', token, userId, isAdmin });
//     });
//   });
// });

// Login route

router.post('/log-in', (req, res) => {
  const { email, password } = req.body;

  // Check if email exists
  db.query('SELECT * FROM users WHERE email_id = ?', [email], async (err, rows) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (rows.length === 0) {
      console.log("Email not found", email);
      return res.status(404).json({ message: 'Email not found' });
    }

    const user = rows[0];

    // Compare provided password with hashed password from database
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log("Incorrect password");
        return res.status(401).json({ message: 'Invalid Credentials' });
      }

      // Password is correct, prepare user data to send back (excluding sensitive info)
      const userData = {
        userId: user.user_id,
        email: user.email_id,
        loc_id: user.loc_id,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.user_role,
        email: user.email_id
      };

      // Check if user is an admin (example based on email domain or specific emails)
      const adminEmails = ['admin@example.com']; // Replace with your admin email(s)
      if (adminEmails.includes(email)) {
        userData.role = 'admin';
      }

      // Generate JWT token for authentication
      const token = jwt.sign(userData, 'your_jwt_secret', { expiresIn: '1h' });

      // console.log(firstName + " " + lastName + "Logged in  successfully...! ");
      return res.status(200).json({
        message: 'Login successful',
        token: token,
        userId: userData.userId,
        role: userData.role,
        loc_id: userData.loc_id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      });

    } catch (error) {
      console.error('Error comparing passwords:', error);
      return res.status(500).json({ message: 'Error comparing passwords' });
    }
  });
});


// theme route

// router.put('/theme', (req, res) => {
//   const { theme, userId } = req.body;

//   // Perform an UPDATE operation to update the theme for the specific user
//   db.query("UPDATE users SET theme = ? WHERE id = ?", [theme, userId], (err, result) => {
//     if (err) {
//       console.error('Error updating theme:', err);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     // Check if any rows were affected by the update
//     if (result.changedRows === 0) {
//       // If no rows were affected, it means the user with the provided ID doesn't exist or the theme was already set to the new value
//       return res.status(404).json({ message: 'User not found or theme already set to the new value' });
//     }

//     // Theme updated successfully
//     res.status(200).json({ message: 'Theme updated successfully', theme });
//   });
// });
  
//Rgister user
{/* router.post('/register', (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validate input fields (add more validations as per your requirements)
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if the user already exists in the database
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (rows.length > 0) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Encrypt the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Error hashing password' });
      }

      // Insert new user into the database
      const insertSql = `INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)`;
      db.query(insertSql, [username, email, hashedPassword, firstName, lastName], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ message: 'Error inserting user into database' });
        }

        console.log('User registered successfully');
        return res.status(201).json({ message: 'User registered successfully' });
      });
    });
  });
});*/}





export default router;





router.post('/sign-up', (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (rows.length > 0) {
      console.log("Email already Exist");
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      // Insert user into database
      db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'User created successfully' });
      });
    });
  });
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  // Check if email exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // If user not found, return error
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Compare provided password with hashed password in the database
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!result) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Generate JWT token
      const token = jwt.sign({ email: email }, SECRET_KEY);

      // Send token to the client
      res.json({ message: 'Login successful', token: token });
    });
  });
});
