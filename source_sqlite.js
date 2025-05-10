import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function init() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
    verbose: true,
  });
  await db.migrate({ migrationsPath: './migrations-sqlite' });
  return db;
}
const dbConn = init();

function currentTime() {
  return new Date().toISOString();
}

export async function addRaceData(type, data, id) {
  if (!type || !data || !id) {
    return { success: false, message: 'Not given all data to submit' };
  }

  try {
    const db = await dbConn;
    await db.run(
      'INSERT INTO race_data (data_type, data_array, client_id, time) VALUES (?, ?, ?, ?)',
      [type, JSON.stringify(data), id, currentTime()],
    );

    const result = await getRaceData(type);
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: 'Failed to add race data' };
  }
}

export async function editRaceResult(type, data, id) {
  if (!type || !data || !id) {
    return { success: false, message: 'Not given all data to submit' };
  }

  try {
    const db = await dbConn;
    const statement = await db.run(
      'UPDATE race_data SET data_array = ?, time = ? WHERE client_id = ? AND data_type = ?',
      [JSON.stringify(data), currentTime(), id, type],
    );

    if (statement.changes === 0) {
      return { success: false, message: 'Race data not found' };
    }

    const result = await getRaceData(type);
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: 'Failed to update race data' };
  }
}

export async function getAllRaceData() {
  try {
    const db = await dbConn;
    const results = await db.all('SELECT * FROM race_data ORDER BY time DESC');

    const formattedResults = [];
    results.forEach((row) => {
      formattedResults.push({
        raceData_id: row.raceData_id,
        data_type: row.data_type,
        data_array: JSON.parse(row.data_array),
        client_id: row.client_id,
        time: row.time,
      });
    });

    return {
      success: true,
      data: formattedResults,
    };
  } catch (error) {
    return { success: false, message: 'Failed to fetch race data' };
  }
}

export async function getRaceData(type) {
  try {
    const db = await dbConn;
    const results = await db.all(
      'SELECT * FROM race_data WHERE data_type = ? ORDER BY time DESC',
      [type],
    );

    const formattedResults = [];
    results.forEach((row) => {
      formattedResults.push({
        ...row,
        data_array: JSON.parse(row.data_array),
      });
    });

    return {
      success: true,
      data: formattedResults,
    };
  } catch (error) {
    return { success: false, message: `Failed to fetch ${type} data` };
  }
}

export async function addRaceResult(timesArray, runnersArray) {
  if (!timesArray || !runnersArray) {
    return { success: false, message: 'Not given all data to submit' };
  }

  try {
    const db = await dbConn;
    await db.run(
      'INSERT OR REPLACE INTO race_results (id, times_array, runners_array, time) VALUES (1, ?, ?, ?)',
      [JSON.stringify(timesArray), JSON.stringify(runnersArray), currentTime()],
    );

    const result = await getCurrentResults();
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, message: 'Failed to add race results' };
  }
}

export async function getCurrentResults() {
  try {
    const db = await dbConn;
    const results = await db.get('SELECT * FROM race_results WHERE id = 1');

    if (!results) {
      return { success: false, message: 'No race results found' };
    }

    return {
      success: true,
      data: {
        times: JSON.parse(results.times_array),
        runners: JSON.parse(results.runners_array),
      },

    };
  } catch (error) {
    return { success: false, message: 'Failed to fetch current results' };
  }
}

export async function clearDBData(table) {
  const validTables = ['race_data', 'race_results'];
  if (!validTables.includes(table)) {
    return { success: false, message: 'Invalid table name' };
  }

  try {
    const db = await dbConn;
    await db.run(`DELETE FROM ${table}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: 'Failed to clear data' };
  }
}
