import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World from TypeScript Backend!');
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
