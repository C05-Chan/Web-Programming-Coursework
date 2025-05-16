import express from 'express';
import * as db from './source_sqlite.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const app = express();
const PORT = 8080;


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));


app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/client/index.html`);
});

app.get('/runnersDetails.csv', (req, res) => {
  res.sendFile(path.join(__dirname, 'runnersDetails.csv'));
});

async function submitData(req, res) {
  try {
    const { type, data, id } = req.body;

    if (!data || data.length === 0) {
      return res.status(400).json({ status: 'error', message: `Please provide some ${type} data!` });
    }

    const result = await db.addRaceData(type, data, id);

    if (!result.success) {
      console.log(`Unable to save ${type} data. Error: ${result.error}`);
      return res.status(500).json({ status: 'error', message: `Unable to save ${type} data` });
    }

    console.log(`${type} data submitted successfully!`);
    return res.status(200).json({ status: 'success', message: `${type} data submitted successfully!` });
  } catch (error) {
    console.error(`Server error: ${error}`);
    return res.status(500).json({ status: 'error', message: 'Unable to save data due to server error' });
  }
}

async function updateData(req, res) {
  try {
    const { type, data, id } = req.body;

    const result = await db.updateRaceData(type, data, id);

    if (!result.success) {
      console.log(`Unable to update ${type} data. Error: ${result.error}`);
      return res.status(500).json({ status: 'error', message: `Unable to update ${type} data` });
    }

    console.log(`Updated ${type} data!`);
    return res.status(200).json({ status: 'success', message: `The ${type} data updated successfully` });
  } catch (error) {
    console.error(`Server error: ${error}`);
    return res.status(500).json({ status: 'error', message: 'Unable to update data due to server error' });
  }
}

async function getAllData(req, res) {
  try {
    const result = await db.getAllRaceData();

    if (!result.success) {
      console.log(`Unable to get all data. Error: ${result.error}`);
      return res.status(500).json({ status: 'error', message: 'Unable to get all data' });
    }

    console.log('Successfully got all data!');
    res.json({ status: 'success', data: result.data });
  } catch (error) {
    console.error(`Server error: ${error}`);
    res.status(500).json({ status: 'error', message: 'Could not get data due to server error' });
  }
}

async function addResult(req, res) {
  try {
    const { results } = req.body;


    const data = await db.addRaceResult(results);

    if (!data.success) {
      console.log('Unable to save results.');
      return res.status(500).json({ status: 'error', message: `Unable to save the results. Error: ${data.error}` });
    }

    console.log('Successfully saved race results');
    return res.json({ status: 'success', message: 'Race results saved successfully' });
  } catch (error) {
    console.error('Error saving race results:', error);
    return res.status(500).json({ status: 'error', message: 'Unable to save the results due to server error' });
  }
}

async function getResults(req, res) {
  try {
    const result = await db.getRaceResults();

    if (!result.success) {
      console.log(`Unable to get race result. Error: ${result.error}`);
      return res.status(500).json({ status: 'error', message: 'Unable to get race results' });
    }

    console.log('Successfully got race result!');
    res.json({ status: 'success', results: result.results });
  } catch (error) {
    console.error(`Server error: ${error}`);
    res.status(500).json({ status: 'error', message: 'Could not get race result due to server error' });
  }
}

async function testClear() {
  const result = await db.clearDBData('race_data');
  console.log('Clear result:', result);
}

testClear();

app.post('/submit-data', submitData);
app.post('/update-data', updateData);

app.get('/get-all-data', getAllData);

app.post('/add-race-result', addResult);
app.get('/get-race-result', getResults);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
