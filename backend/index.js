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

    if (role === "admin") {
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

// API to update ALL profile details for inline editing
app.put("/update-profile/:id", async (req, res) => {
  try {
    const { ename, email, bloodGroup, location, phone, age, weight, status } = req.body;
    
    const updatedProfile = await donor.findByIdAndUpdate(
      req.params.id,
      { ename, email, bloodGroup, location, phone, age, weight, status },
      { new: true }
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

// ====================================================================
// UPDATED: Automated Email Request Using Your Verified Google Script Proxy
// ====================================================================
app.post("/send-request-email", async (req, res) => {
  const { email, ename, bloodGroup } = req.body;

  if (!email) {
    return res.status(400).send("Donor email is required");
  }

  try {
    // Bypasses Render's firewall by using a standard HTTPS web request over port 443
    const response = await fetch("https://script.google.com/macros/s/AKfycbxTQ4gBrFD4jkidc3e_5L4F40vTVaWL557naVYOL3zF7KobFTyHKE7DueTqRp9gaHUh/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ename, bloodGroup })
    });
    
    if (response.ok) {
      console.log("Email routed successfully through Google Cloud proxy!");
      return res.status(200).send("Request email sent successfully!");
    } else {
      throw new Error("Google Script proxy endpoint returned an unexpected error status");
    }
  } catch (error) {
    console.log("Email routing error: ", error.message);
    return res.status(500).send("Failed to send email alert");
  }
});

// Dynamic port allocation for Google Cloud Run / Render
const PORT = process.env.PORT || 8080;
const path = require("path");

// Point Express to your frontend build folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// If a user types in any website route, hand them your main React interface
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Force the port fallback to 8080 and bind to all available incoming network interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});