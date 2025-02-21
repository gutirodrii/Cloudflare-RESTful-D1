// copyright 2023 © Xron Trix | https://github.com/Xrontrix10

import { Env } from '..';
import { customAlphabet } from 'nanoid';
import { returnJson, notFound, serverError, dataConflict } from '../handler/responses';

const customAlphabetChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateCustomID = customAlphabet(customAlphabetChars, 6);

export function convertToJSON(data: any): any {
	const [id, collection, results, time, success] = data;
	return JSON.stringify({ id: id, collection: collection, results: results, time: time, success: success });
}

export async function getDataByTable(env: Env, table: string): Promise<any> {
	try {
		const stmt = env.DB.prepare(`SELECT * FROM ${table}`);
		const { results, success, meta } = await stmt.all();
		return convertToJSON([null, table, results, meta.duration, success]);
	} catch (e) {
		return null;
	}
}

// Custom Function to get Row data by selecting Column
export async function getRowByCol(env: Env, colName: string, colVal: string, table: string): Promise<any> {
	const sql = `SELECT * FROM ${table} WHERE ${colName} = ?1`;
	try {
		const stmt = env.DB.prepare(sql).bind(colVal);
		const { results, success, meta } = await stmt.all();
		if (results.length === 0) {
			return [false, false];
		}
		return [true, convertToJSON([results[0].id, table, results, meta.duration, success])];
	} catch (error) {
		return [true, null];
	}
}

// Function to retrieve Row by ID from the D1 store
export async function getRowByID(env: Env, id: string, table: string): Promise<any> {
	const [exists, results] = await getRowByCol(env, 'id', id, table);

	if (exists && results) {
		return returnJson(results);
	} else if (!exists) {
		return notFound();
	} else {
		return serverError();
	}
}

// Function to update data by id in the D1 store
export async function updateRowById(env: Env, id: string, updatedData: any, table: string): Promise<any> {
	// Check If Row Exists
	const [exists, _] = await getRowByCol(env, 'id', id, table);
	if (!exists) {
		return notFound();
	}
	// Construct the SET clause of the SQL query
	const setClause = Object.keys(updatedData)
		.map((key) => `${key} = ?`)
		.join(', ');

	// Extract the values from updatedData
	const values = Object.values(updatedData);

	// Construct and execute the UPDATE SQL query
	const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`; // Assuming there's an 'id' column for the record
	values.push(id);

	try {
		const { success, meta } = await env.DB.prepare(sql)
			.bind(...values)
			.run();
		return returnJson(convertToJSON([id, table, updatedData, meta.duration, success]));
	} catch (e) {
		console.error(e);
		return serverError();
	}
}

// Function to insert new data in the D1 store
export async function insertRowInTable(env: Env, newData: any, table: string) {
	const sql_values = Object.values(newData);
	let dataArray = [];
	let dataIndex = -1;
	let dataId = generateCustomID();
	let insert_sql = `INSERT INTO ${table} (`;
	let create_sql = `CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, `;
	let existingData = null;

	try {
		const stmt = env.DB.prepare(`SELECT * FROM ${table}`);
		const { results } = await stmt.all();
		existingData = JSON.stringify(results);
	} catch (error) {
		console.error(error);
	}

	if (existingData) {
		// if data fetch was successful
		dataArray = JSON.parse(existingData);
	}

	// Data duplication check
	if (existingData && table === 'users') {
		dataIndex = dataArray.findIndex((data_t: { email: any }) => data_t.email === newData.email);
		if (dataIndex !== -1) {
			return dataConflict();
		}
	} else if (existingData && table === 'channels') {
		dataIndex = dataArray.findIndex((data_t: { name: any }) => data_t.name === newData.name);
		if (dataIndex !== -1) {
			return dataConflict();
		}
	} else if (existingData && table === 'guides') {
		dataIndex = dataArray.findIndex((data_t: { content: any }) => data_t.content === newData.content);
		if (dataIndex !== -1) {
			return dataConflict();
		}
	}
	//No necesitamos checkear si el mensaje esta duplicado, ya que puede ser que tenga el mismo contenido, y no por ello significa que este duplicado
	// } else if (existingData && table === 'messages') {
	//   dataIndex = dataArray.findIndex(
	//     (data_t: { content: any; }) => data_t.content === newData.content,
	//   );
	//   if (dataIndex !== -1) {
	//     return dataConflict();
	//   }
	// }

	if (dataIndex !== -1) {
		return dataConflict();
	}

	// Check for ID Duplication and prepare SQl Commands
	if (table === 'guides') {
		// create_sql += 'name TEXT, role TEXT, image TEXT, mobile TEXT, roll TEXT)';
		insert_sql += 'title, content) VALUES (?1, ?2)';
	}
	try {
		// await env.DB.exec(create_sql);
		const { success, meta } = await env.DB.prepare(insert_sql)
			.bind(...sql_values)
			.run(); // Store the new data in D1
		return returnJson(convertToJSON([table, null, meta.duration, success]));
	} catch (error) {
		console.error(error);
		return serverError();
	}
}

// Function to delete data by ID from the D1 store
export async function deleteRowById(env: Env, id: string, table: string) {
	// Check If Row Exists
	const [exists, _] = await getRowByCol(env, 'id', id, table);
	if (!exists) {
		return notFound();
	}

	try {
		const { success, meta } = await env.DB.prepare(`DELETE FROM ${table} WHERE id = '${id}'`).run();
		// Return results to indicate successful deletion
		return returnJson(convertToJSON([id, table, null, meta.duration, success]));
	} catch (error) {
		console.error(error);
		return serverError();
	}
}

export async function dropEntireTable(env: Env, table: string) {
	try {
		const { success, meta } = await env.DB.prepare(`DROP TABLE IF EXISTS ${table}`).run();
		// Return results to indicate successful deletion
		return returnJson(convertToJSON([null, table, null, meta.duration, success]));
	} catch (error) {
		console.error(error);
		return serverError();
	}
}
