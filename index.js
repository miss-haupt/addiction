require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // Added to handle file paths

const app = express();
const PORT = process.env.PORT || 3000;
const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.use(cors()); // Allow requests from different origins
app.use(express.json()); // Middleware to parse JSON bodies

// Serve the HTML Form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Added to serve index.html
});

// Endpoint to Update Gist
app.post('/update-gist', async (req, res) => {
  const newData = req.body.data;

  if (!newData) {
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    // Get the current content of the Gist
    const gistResponse = await axios.get(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let currentContent = JSON.parse(gistResponse.data.files['data.json'].content);

    // Ensure the current content is an array
    if (!Array.isArray(currentContent)) {
      currentContent = [];
    }

    // Append the new data to the existing array
    const newEntryObject = { "message": newData }; // Wrap the new entry in a message object
    currentContent.push(newEntryObject);

    // Update the Gist with new content
    await axios.patch(`https://api.github.com/gists/${GIST_ID}`, {
      files: {
        'data.json': {
          content: JSON.stringify(currentContent, null, 2)
        }
      }
    }, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    res.status(200).json({ message: 'Gist updated successfully!' });
  } catch (error) {
    console.error('Error updating the Gist:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to update the Gist' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});