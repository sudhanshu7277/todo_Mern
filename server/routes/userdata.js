const express = require('express');
const router = express.Router();
const UserData = require('../models/UserData');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all user data (user's or all if admin)
router.get('/', auth, async (req, res) => {
  try {
    let userdata;
    if (req.query.all === 'true' && req.user.role === 'admin') {
      userdata = await UserData.find().populate('user', 'username');
    } else {
      userdata = await UserData.find({ user: req.user.id });
    }
    res.json(userdata);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user data
router.post('/', auth, async (req, res) => {
  const userdata = new UserData({
    ...req.body,
    user: req.user.id,
  });
  try {
    const newUserData = await userdata.save();
    res.status(201).json(newUserData);

    // Emit to socket
    const io = req.app.get('io');
    const populatedUserData = await UserData.findById(newUserData._id).populate('user', 'username');

    io.to(`user_${req.user.id}`).emit('userDataCreated', newUserData);
    io.to('admins').emit('userDataCreated', populatedUserData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user data
router.put('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const updatedUserData = await UserData.findOneAndUpdate(filter, req.body, { new: true });
    if (!updatedUserData) return res.status(404).json({ message: 'User data not found' });
    res.json(updatedUserData);

    // Emit to socket
    const io = req.app.get('io');
    const populatedUserData = await UserData.findById(updatedUserData._id).populate('user', 'username');
    const ownerId = updatedUserData.user.toString();

    io.to(`user_${ownerId}`).emit('userDataUpdated', updatedUserData);
    io.to('admins').emit('userDataUpdated', populatedUserData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user data
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    }
    const userdata = await UserData.findOneAndDelete(filter);
    if (!userdata) return res.status(404).json({ message: 'User data not found' });
    res.json({ message: 'User data deleted' });

    // Emit to socket
    const io = req.app.get('io');
    const ownerId = userdata.user.toString();

    io.to(`user_${ownerId}`).emit('userDataDeleted', req.params.id);
    io.to('admins').emit('userDataDeleted', req.params.id);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const UserData = require('../models/UserData');
// const User = require('../models/User');
// const auth = require('../middleware/auth');
// const { Parser } = require('json2csv');

// // Get all user data (user's or all if admin)
// router.get('/', auth, async (req, res) => {
//   try {
//     let userdata;
//     if (req.query.all === 'true' && req.user.role === 'admin') {
//       userdata = await UserData.find().populate('user', 'username');
//     } else {
//       userdata = await UserData.find({ user: req.user.id });
//     }
//     res.json(userdata);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Export user data to CSV
// router.get('/export', auth, async (req, res) => {
//   try {
//     let userdata;
//     if (req.query.all === 'true' && req.user.role === 'admin') {
//       userdata = await UserData.find().populate('user', 'username');
//     } else {
//       userdata = await UserData.find({ user: req.user.id });
//     }

//     // Flatten data for CSV
//     const flattenedData = userdata.map((data) => ({
//       id: data._id,
//       firstName: data.firstName,
//       lastName: data.lastName,
//       age: data.age,
//       email: data.email,
//       phoneNumber: data.phoneNumber,
//       address: data.address,
//       identificationNumber: data.identificationNumber,
//       employments: JSON.stringify(data.employments), // Serialize array to string
//       incomes: JSON.stringify(data.incomes), // Serialize array to string
//       totalIncome: data.totalIncome,
//       username: data.user ? data.user.username : 'N/A', // Populated username
//     }));

//     // Define CSV fields
//     const fields = [
//       { label: 'ID', value: 'id' },
//       { label: 'First Name', value: 'firstName' },
//       { label: 'Last Name', value: 'lastName' },
//       { label: 'Age', value: 'age' },
//       { label: 'Email', value: 'email' },
//       { label: 'Phone Number', value: 'phoneNumber' },
//       { label: 'Address', value: 'address' },
//       { label: 'Identification Number', value: 'identificationNumber' },
//       { label: 'Employments', value: 'employments' },
//       { label: 'Incomes', value: 'incomes' },
//       { label: 'Total Income', value: 'totalIncome' },
//       { label: 'Username', value: 'username' },
//     ];

//     // Create CSV
//     const json2csvParser = new Parser({ fields });
//     const csv = json2csvParser.parse(flattenedData);

//     // Set headers for file download
//     res.header('Content-Type', 'text/csv');
//     res.attachment('user-data.csv');
//     res.send(csv);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Create user data
// router.post('/', auth, async (req, res) => {
//   const userdata = new UserData({
//     ...req.body,
//     user: req.user.id,
//   });
//   try {
//     const newUserData = await userdata.save();
//     res.status(201).json(newUserData);

//     // Emit to socket
//     const io = req.app.get('io');
//     const populatedUserData = await UserData.findById(newUserData._id).populate('user', 'username');

//     io.to(`user_${req.user.id}`).emit('userDataCreated', newUserData);
//     io.to('admins').emit('userDataCreated', populatedUserData);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Update user data
// router.put('/:id', auth, async (req, res) => {
//   try {
//     const filter = { _id: req.params.id };
//     if (req.user.role !== 'admin') {
//       filter.user = req.user.id;
//     }
//     const updatedUserData = await UserData.findOneAndUpdate(filter, req.body, { new: true });
//     if (!updatedUserData) return res.status(404).json({ message: 'User data not found' });
//     res.json(updatedUserData);

//     // Emit to socket
//     const io = req.app.get('io');
//     const populatedUserData = await UserData.findById(updatedUserData._id).populate('user', 'username');
//     const ownerId = updatedUserData.user.toString();

//     io.to(`user_${ownerId}`).emit('userDataUpdated', updatedUserData);
//     io.to('admins').emit('userDataUpdated', populatedUserData);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Delete user data
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const filter = { _id: req.params.id };
//     if (req.user.role !== 'admin') {
//       filter.user = req.user.id;
//     }
//     const userdata = await UserData.findOneAndDelete(filter);
//     if (!userdata) return res.status(404).json({ message: 'User data not found' });
//     res.json({ message: 'User data deleted' });

//     // Emit to socket
//     const io = req.app.get('io');
//     const ownerId = userdata.user.toString();

//     io.to(`user_${ownerId}`).emit('userDataDeleted', req.params.id);
//     io.to('admins').emit('userDataDeleted', req.params.id);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;