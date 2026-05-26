var express = require("express");
var cors = require("cors");
var nodemailer = require("nodemailer");
require("./db"); // Database connection file
var donor = require("./model");

var app = express();
app.use(express.json());
app.use(cors());

// API to add a new donor (Register)
app.post("/add", async (req, res) => {
  try {
    await new donor(req.body).save();
    res.send("Donor registered successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error saving donor record");
  }
});

// API to get all donors (View/Search)
app.get("/view", async (req, res) => {
  try {
    var data = await donor.find();
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching donor records");
  }
});

// ====================================================================
// Multi-Role Login Handler (Admin with Password, User without)
// ====================================================================
app.post("/login-check", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).send("Email is required");
    }

    // 1. Check if Admin Login option was chosen on the frontend layout
    if (role === "admin") {
      // Secure layout verification for Master Admin email and credentials
      if (email.toLowerCase() === "gopikag.info@gmail.com" && password === "admin123") {
        return res.status(200).json({ 
          message: "Admin login successful", 
          email: "gopikag.info@gmail.com",
          ename: "System Administrator",
          role: "admin"
        });
      } else {
        return res.status(401).send("Invalid Admin email or password.");
      }
    }

    // 2. Default fallback: Check if standard User Login option was chosen
    const existingDonor = await donor.findOne({ email: email });

    if (existingDonor) {
      return res.status(200).json({ 
        message: "Login successful", 
        email: existingDonor.email,
        ename: existingDonor.ename,
        role: "donor"
      });
    } else {
      return res.status(404).send("No registered donor found with this email address.");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error during login check");
  }
});

// API to fetch a single donor profile by email directly from the database
app.get("/profile-details/:email", async (req, res) => {
  try {
    const data = await donor.findOne({ email: req.params.email });
    if (!data) {
      return res.status(404).json({ message: "No profile matching this email found" });
    }
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching profile details");
  }
});

// API to update a donor's availability status from their profile page
app.put("/update-status/:id", async (req, res) => {
  try {
    const updatedDonor = await donor.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.send(updatedDonor);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating donor status");
  }
});

// ====================================================================
// NEW: API to update ALL profile details for inline editing
// ====================================================================
app.put("/update-profile/:id", async (req, res) => {
  try {
    const { ename, email, bloodGroup, location, phone, age, weight, status } = req.body;
    
    const updatedProfile = await donor.findByIdAndUpdate(
      req.params.id,
      {
        ename,
        email,
        bloodGroup,
        location,
        phone,
        age,
        weight,
        status
      },
      { new: true } // Returns the newly modified document object
    );

    if (!updatedProfile) {
      return res.status(404).send("Donor profile not found");
    }

    res.send("Profile updated successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error saving updated donor profile data");
  }
});

// API to delete a donor
app.delete("/delete/:id", async (req, res) => {
  try {
    await donor.findByIdAndDelete(req.params.id);
    res.send("Donor record deleted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting donor record");
  }
});

// Automated Email Request Configured with your updated Gmail App Password
app.post("/send-request-email", async (req, res) => {
  const { email, ename, bloodGroup } = req.body;

  if (!email) {
    return res.status(400).send("Donor email is required");
  }

  // 1. Configure the SMTP Transporter with your updated credentials
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gopikag.info@gmail.com",       // Your Gmail
      pass: "oafb vkic qtxw xujm"            // Your updated 16-character App Password
    }
  });

  // 2. Formulate the official BloodSystem template
  var mailOptions = {
    from: '"Admin, BloodSystem Portal" <gopikag.info@gmail.com>',
    to: email,
    subject: "Urgent: Blood Donation Request - BloodSystem Management System",
    text: `Dear ${ename},

We hope this email finds you well.

There is an urgent requirement for your blood group (${bloodGroup}) at our affiliated hospital. Because you are registered as an eligible donor in our BloodSystem, we are reaching out to ask if you are currently available to donate.

If you are able to assist, please visit the hospital at your earliest convenience or reply to this email to coordinate your arrival. Your contribution can save a life today.

Thank you for your continued support and generosity.

Best regards,
Admin, BloodSystem Management System`
  };

  // 3. Send the message
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Email error: ", error);
      return res.status(500).send("Failed to send email alert");
    } else {
      console.log("Email sent successfully: " + info.response);
      return res.status(200).send("Request email sent successfully!");
    }
  });
});

app.listen(3002, () => {
  console.log("Server running on port 3002");
});