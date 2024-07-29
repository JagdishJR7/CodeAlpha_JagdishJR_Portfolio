// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(bodyParser.json());

// Define routes
app.post('/send-email', async (req, res) => {
  const { name, emailID, emailSubject, htmlBody } = req.body;
  
  // Setup OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );
  
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const email = Buffer.from(
    [
      `From: ${emailID}`,
      `To: "YOUR_Email" <${process.env.EMAIL_USERNAME}>`,
      `Subject: ${emailSubject}`,
      `Reply-To: ${emailID}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      '',
      htmlBody,
    ].join('\n')
  )
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: email },
    });
    res.status(200).send(`Email sent successfully to ${name}!`);
  } catch (error) {
    res.status(500).send('Failed to send email. Please try again later.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
