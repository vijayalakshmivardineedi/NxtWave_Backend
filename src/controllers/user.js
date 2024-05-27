const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const { sendEmail } = require('../validator/email');
const NodeCache = require('node-cache');
const emailVerificationCache = new NodeCache();
const saltRounds = 10;
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

function generateVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}


exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already registered" });
    }

    
    const hash_password = await bcrypt.hash(password, 10);

    // Create a new user object using the User model
    const newUser = new User({
      firstName,
      lastName,
      email,
      hash_password,
      role, 
      phone, 
    });

    
    await newUser.save();

    // Send email after cteating account
    sendEmail(email, "Account Creation", `Hi ${firstName},\n WELCOME TO NxtWave \nYour account has been successfully created as a ${role}.`);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if password is correct
    const isPasswordValid = await user.authenticate(password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token based on the user's role
    const token = generateJwtToken(user._id, user.role);

    // Return user information along with token
    return res.status(200).json({
      token,
      user, // Return the entire user object
      message: `Successfully signed in as a ${user.role}`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.signout = (req, res) => {
  res.clearCookie('token');
  res.status(201).json({
    message: 'SignOut successfully...!'
  });
}


// exports.forgotPassword = (req, res) => {
//   console.log("this is user")
//   const to = req.body.email;
//   const subject = 'Forgot Password Verification Code';

//   // Assuming you have a database connection or ORM (e.g., Mongoose, Sequelize) set up
//   // You would query your database to check if the email exists
//   // Here, we'll assume you have a User model for the database
//   User.findOne({ email: to }, (err, user) => {
//     if (err) {
//       // Handle the database error, e.g., log it and return an error response
//       console.error("Database error:", err);
//       res.status(500).send('Internal server error');
//       return;
//     }

//     if (!user) {
//       // If the email doesn't exist in your database, you can return an error response
//       res.status(404).send('Email not found in our database');
//       return;
//     }

//     // If the email exists in your database, generate a verification code
//     const verificationCode = generateVerificationCode();
//     const text = `Your verification code is: ${verificationCode}`;

//     // Log cache storage information
//     console.log(`Storing verification code in cache for email: ${to}`);

//     // Store the verification code in a cache with the user's email
//     emailVerificationCache.set(to, verificationCode, 600);

//     // Log email sending information
//     console.log(`Sending email to: ${to}`);
//     console.log(`Subject: ${subject}`);
//     console.log(`Email content: ${text}`);

//     // Use the sendEmail function to send the verification email
//     sendEmail(to, subject, text);

//     res.send('Verification code sent to your email');
//   });
// };



// // Add a new route for code verification and password reset
// exports.verifyCodeAndResetPassword = (req, res) => {
//   const email = req.body.email;
//   const code = req.body.code;
//   const newPassword = req.body.newPassword;

//   // Check if the provided code matches the one stored in the cache
//   const storedCode = emailVerificationCache.get(email);


//   if (!storedCode || storedCode !== code) {
//     res.status(400).send('Invalid verification code');
//     return;
//   }

//   // Code is valid, reset the user's password
//   User.findOne({ email: email }, (err, user) => {
//     if (err) {
//       // Handle the database error
//       console.error("Database error:", err);
//       res.status(500).send('Internal server error');
//       return;

//     }
//     if (!user) {
//       res.status(404).send('Email not found in our database');
//       return;
//     }

//     // Manually hash and update the user's password for password reset
//     const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

//     // Update the user's hashed password
//     user.hash_password = hashedPassword;

//     // Save the updated user in the database
//     user.save((err) => {
//       if (err) {
//         console.error("Password reset error:", err);
//         res.status(500).send('Error resetting password');
//       } else {
//         // Password reset successful
//         res.send('Password reset successfully');
//       }
//     });
//   });
// };


// exports.getAllUsers = (req, res) => {
//   User.find({}, (err, users) => {
//     if (err) {
//       console.error('Error fetching users:', err);
//       return res.status(500).json({ success: false, message: 'An error occurred while fetching users.' });
//     }
//     if (users.length === 0) {
//       return res.status(404).json({ success: false, message: 'No users found.' });
//     }
//     return res.status(201).json({ success: true, users });
//   });
// };


// exports.getUserByEmail = (req, res) => {
//   const { email } = req.params; // Assuming the email is part of the URL params
//   User.findOne({ email }).exec((error, user) => {
//     if (error) {
//       return res.status(400).json({ error });
//     }
//     if (user) {
//       res.status(201).json({
//         user,
//       });
//     } else {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }
//   });
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     // Extract updated user information from the request body
//     const { firstName, secondName, contactNumber, address } = req.body;

//     // Extract the user ID from the request
//     const userId = req.body.userId; // Assuming the user ID is sent in the request body

//     // Check if the user exists in the database
//     const userExists = await User.exists({ _id: userId });

//     if (!userExists) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);

//     // Update the user's information
//     user.firstName = firstName;
//     user.secondName = secondName;
//     user.contactNumber = contactNumber;
//     user.address = JSON.parse(address); // Parse address string into an array of objects

//     // Save the updated user
//     await user.save();

//     // Return success response
//     return res.status(201).json({ message: 'Profile updated successfully.' });
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     return res.status(500).json({ message: 'Error updating profile.' });
//   }
// };


// exports.uploadOrChangeImage = async (req, res) => {
//   try {
//     // Extract the user ID from the request route parameters
//     const userId = req.params.userId;

//     // Check if the user exists in the database
//     const userExists = await User.exists({ _id: userId });

//     if (!userExists) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Find the user by ID to check if profile picture already exists
//     const user = await User.findById(userId);

//     // Get the current profile picture path, if exists
//     const currentProfilePicture = user.profilePicture;

//     // Set up multer storage for profile picture uploads
//     const storage = multer.diskStorage({
//       destination: function (req, file, cb) {
//         const destinationPath = path.join(__dirname, '../UserImages'); // Destination path for file upload
//         if (!fs.existsSync(destinationPath)) {
//           fs.mkdirSync(destinationPath, { recursive: true });
//         }
//         cb(null, destinationPath);
//       },
//       filename: function (req, file, cb) {
//         cb(null, shortid.generate() + '-' + file.originalname);
//       }
//     });

//     // Initialize multer with the storage options
//     const upload = multer({ storage }).single('profilePicture');

//     // Process the file upload
//     upload(req, res, async (err) => {
//       if (err) {
//         console.error('File upload error:', err);
//         return res.status(500).json({ message: 'Error uploading file.' });
//       }

//       try {
//         // If a profile picture was uploaded, update the profilePicture field
//         if (req.file) {
//           // Modify the file path to save to the database
//           const filePath = '/publicUser/' + req.file.filename; // File path for database
//           user.profilePicture = filePath;

//           // If a previous profile picture exists, delete it from UserImages folder
//           if (currentProfilePicture) {
//             const previousFileName = path.basename(currentProfilePicture);
//             const previousFilePath = path.join(__dirname, '../UserImages', previousFileName);
//             console.log('Deleting previous profile picture file:', previousFilePath);
//             fs.unlinkSync(previousFilePath);
//           }

//           // Save the updated user
//           await user.save();

//           // Return success response
//           return res.status(201).json({ message: 'Profile picture updated successfully.' });
//         } else {
//           return res.status(400).json({ message: 'No image file found in the request.' });
//         }
//       } catch (error) {
//         console.error('Error updating profile picture:', error);
//         return res.status(500).json({ message: 'Error updating profile picture.' });
//       }
//     });
//   } catch (error) {
//     console.error('Error checking user existence:', error);
//     return res.status(500).json({ message: 'Error checking user existence.' });
//   }
// };

// exports.deleteProfileImage = async (req, res) => {
//   try {
//     // Extract the user ID from the request route parameters
//     const userId = req.params.userId;

//     // Check if the user exists in the database
//     const userExists = await User.exists({ _id: userId });

//     if (!userExists) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);

//     // Get the current profile picture path
//     const currentProfilePicture = user.profilePicture;

//     // Check if the user has a profile picture
//     if (!currentProfilePicture) {
//       return res.status(400).json({ message: 'User does not have a profile picture.' });
//     }

//     // Delete the profile picture file from the UserImages folder
//     const fileName = path.basename(currentProfilePicture);
//     const filePath = path.join(__dirname, '../UserImages', fileName);
//     fs.unlinkSync(filePath);

//     // Remove the profile picture path from the user document
//     user.profilePicture = null;
//     await user.save();

//     // Return success response
//     return res.status(200).json({ message: 'Profile picture deleted successfully.' });
//   } catch (error) {
//     console.error('Error deleting profile picture:', error);
//     return res.status(500).json({ message: 'Error deleting profile picture.' });
//   }
// };


// exports.addAddress = async (req, res) => {
//   try {
//     const userId = req.body.userId; // Assuming the user ID is sent in the request body
//     const newAddress = req.body.address; // Assuming the new address is sent in the request body

//     // Check if the user exists in the database
//     const userExists = await User.exists({ _id: userId });

//     if (!userExists) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     // Find the user by ID
//     const user = await User.findById(userId);

//     // Push the new address to the user's address array
//     user.address.push(newAddress);

//     // Save the updated user
//     await user.save();

//     // Return success response
//     return res.status(201).json({ message: 'New address added successfully.' });
//   } catch (error) {
//     console.error('Error adding new address:', error);
//     return res.status(500).json({ message: 'Error adding new address.' });
//   }
// };




