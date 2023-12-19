const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 8000;
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Middleware
app.use(cors()); // This allows all origins

app.use(express.json());

// App config
app.listen(port, () => {
  console.log('Server started on port: ' + port);
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/', async (req, res) => {
  if (!req.body.prompt) {
    res.status(400).send('Bad Request');
    return;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: req.body.prompt || '' }],
      stream: true,
    });

    for await (const chunk of stream) {
      res.write(chunk.choices[0]?.delta?.content || '');
    }
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
