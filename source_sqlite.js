import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function init() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
    verbose: true,
  });

  await db.migrate({
    migrationsPath: './migrations-sqlite',
  });

  return db;
}

const dbConn = init();


// Race Data //
export async function addRaceData(type, data, id) {
  if (!data) {
    return { success: false, error: 'No data to be submitted' };
  }

  try {
    const db = await dbConn;

    await db.run('INSERT INTO race_data (data_type, data_array, client_id, time) VALUES (?, ?, ?, datetime("now"))',
      [type, JSON.stringify(data), id],
    );

    console.log(`Successfully added ${type} data!`);
    return { success: true, message: `Successfully added ${type} data!` };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: `Could not add ${type} data to database` };
  }
}

export async function updateRaceData(type, data, id) {
  if (data.length === 0) {
    deleteRaceData(type, id);
  }

  try {
    const db = await dbConn;

    await db.run('UPDATE race_data SET data_array = ? WHERE data_type = ? AND client_id = ?',
      [JSON.stringify(data), type, id],
    );

    console.log(`Successfully updated ${type} data!`);
    return { success: true, message: `Successfully updated ${type} data!` };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: `Could not update ${type} data.` };
  }
}

export async function getAllRaceData() {
  try {
    const db = await dbConn;

    const result = await db.all('SELECT * FROM race_data ORDER BY time');

    const formattedData = [];

    for (const row of result) {
      formattedData.push({
        raceData_id: row.raceData_id,
        client_id: row.client_id,
        data_type: row.data_type,
        data_array: JSON.parse(row.data_array),
        time: row.time,
      });
    }
    console.log('Successfully retrieved the data!');
    return { success: true, data: formattedData };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: 'Could not retrieve the data.', data: [] };
  }
}

export async function getRaceData(type, id) {
  try {
    const db = await dbConn;

    const result = await db.all('SELECT * FROM race_data WHERE data_type = ? AND client_id = ?',
      [type, id],
    );

    const formattedData = [];

    for (const row of result) {
      formattedData.push({
        data_array: JSON.parse(row.data_array),
      });
    }

    console.log(`Successfully retrieve ${type} data!`);
    return { success: true, data: formattedData };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: `Could not retrieve the ${type} data.`, data: [] };
  }
}

async function deleteRaceData(type, id) {
  try {
    const db = await dbConn;

    await db.run('DELETE FROM race_data WHERE data_type = ? AND client_id = ?',
      [type, id],
    );

    console.log(`Successfully deleted ${id}'s ${type} data!`);
    return { success: true, message: `Successfully deleted ${id}'s ${type} data!` };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: `Could not delete ${id}'s ${type} data!` };
  }
}

// Race Results //
export async function addRaceResult(resultsArray) {
  try {
    const db = await dbConn;

    await db.run(
      'INSERT OR REPLACE INTO race_results (id, results_array, time) VALUES (1, ?, datetime("now"))',
      [JSON.stringify(resultsArray)],
    );

    console.log('Created race results!');
    return { success: true, message: 'Created race results!' };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: 'Unable to create race results' };
  }
}

export async function getRaceResults() {
  try {
    const db = await dbConn;

    const results = await db.get('SELECT * FROM race_results WHERE id = 1');

    if (!results) {
      console.log('No results!');
      return { success: true, error: 'No results!', results: [] };
    }

    console.log('Retrieved race results!');
    return { success: true, results: JSON.parse(results.results_array) };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: 'Unable to retrieve race results' };
  }
}

// Clear table //
export async function clearDBData(table) {
  try {
    const db = await dbConn;

    const validTables = ['race_data', 'race_results'];

    if (!validTables.includes(table)) {
      console.error('Invalid table name!');
      return { success: false, error: 'Invalid table name!' };
    }

    await db.run(`DELETE FROM ${table}`);

    console.log(`Successfully cleared table ${table}`);
    return { success: true, message: `Successfully cleared table ${table}` };
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    return { success: false, error: `Could not clear ${table} table` };
  }
}
