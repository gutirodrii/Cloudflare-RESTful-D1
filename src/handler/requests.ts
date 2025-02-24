import { isAuthorized } from '../auth/authenticate';
import { Env } from '..';
import { returnJson, badEntity, badRequest, serverRoot, notFound, notAllowed, noContent, serverError } from './responses';
import {
	getDataByTable,
	getRowByID,
	updateRowById,
	insertRowInTable,
	deleteRowById,
	dropEntireTable,
	getRowByCol,
} from '../database/d1sqlite';

export async function respondRequest(
	req: Request,
	env: Env,
	path: string,
	search: string,
	searchParams: any,
	is_post: boolean,
	is_get: boolean,
	is_put: boolean,
	is_delete: boolean
): Promise<Response> {
	if (is_get && path === '/') {
		// Check If Server is Live
		return serverRoot();
	}
	if (is_get && (path === '/favicon.ico' || path === '/robots.txt')) {
		// In case any Stupid Opens in Browser ( Like Me :)
		return noContent();
	}

	// ====== Check For Authorization ====== //
	// const authResult = isAuthorized(req, env);
	// if (authResult) {
	// 	return authResult;
	// }

	// ====== Guides Endpoints ====== //
	if (path.endsWith('/guides') && !search) {
		const table = 'guides';
		if (is_post) {
			let reqData;
			try {
				reqData = (await req.json()) as { title: string; content: string };
				const { title, content } = reqData;
				if (!title || !content) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await insertRowInTable(env, reqData, table);
			return response;
		} else if (is_get) {
			const details = await getDataByTable(env, table);
			if (details) {
				return returnJson(details);
			}
			return notFound();
		} else if (is_delete) {
			const response = await dropEntireTable(env, table);
			return response;
		} else {
			return notAllowed();
		}
	} else if (path.startsWith('/guides/') && !search) {
		const table = 'guides';
		const guideID = decodeURIComponent(path.split('/')[2]);
		if (is_get) {
			const response = await getRowByID(env, guideID, table);
			return response;
		} else if (is_put) {
			let newData;
			try {
				newData = (await req.json()) as { title?: string; content?: string };
				if (!newData.title && !newData.content) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await updateRowById(env, guideID, newData, table);
			return response;
		} else if (is_delete) {
			const response = await deleteRowById(env, guideID, table);
			return response;
		} else {
			return notAllowed();
		}
	}
	// ====== Guides Endpoints ====== //
	if (path.endsWith('/videos') && !search) {
		const table = 'videos';
		if (is_post) {
			let reqData;
			try {
				reqData = (await req.json()) as { title: string; description: string; thumbnail: string; src: string };
				const { title, description, thumbnail, src } = reqData;
				if (!title || !thumbnail || !src) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await insertRowInTable(env, reqData, table);
			return response;
		} else if (is_get) {
			const details = await getDataByTable(env, table);
			if (details) {
				return returnJson(details);
			}
			return notFound();
		} else if (is_delete) {
			const response = await dropEntireTable(env, table);
			return response;
		} else {
			return notAllowed();
		}
	} else if (path.startsWith('/videos/') && !search) {
		const table = 'videos';
		const guideID = decodeURIComponent(path.split('/')[2].split('.')[0]);
		if (is_get) {
			const [exists, results] = await getRowByCol(env, 'src', guideID, table);
			
			if (exists && results) {
				return returnJson(results);
			} else if (!exists) {
				return notFound();
			} else {
				return serverError();
			}
		} else if (is_put) {
			let newData;
			try {
				newData = (await req.json()) as { title?: string; content?: string };
				if (!newData.title && !newData.content) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await updateRowById(env, guideID, newData, table);
			return response;
		} else if (is_delete) {
			const response = await deleteRowById(env, guideID, table);
			return response;
		} else {
			return notAllowed();
		}
	}
	// ====== Guides Endpoints ====== //
	if (path.endsWith('/recursos') && !search) {
		const table = 'recursos';
		if (is_post) {
			let reqData;
			try {
				reqData = (await req.json()) as { name: string; url: string; img: string; type:string };
				const { name, url, img, type } = reqData;
				if (!name || !url) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await insertRowInTable(env, reqData, table);
			return response;
		} else if (is_get) {
			const details = await getDataByTable(env, table);
			if (details) {
				return returnJson(details);
			}
			return notFound();
		} else if (is_delete) {
			const response = await dropEntireTable(env, table);
			return response;
		} else {
			return notAllowed();
		}
	} else if (path.startsWith('/recursos/') && !search) {
		const table = 'recursos';
		const guideID = decodeURIComponent(path.split('/')[2]);
		if (is_get) {
			const response = await getRowByID(env, guideID, table);
			return response;
		} else if (is_put) {
			let newData;
			try {
				newData = (await req.json()) as { name?: string; url?: string; img?: string; type?:string };
				if (!newData.name && !newData.url) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await updateRowById(env, guideID, newData, table);
			return response;
		} else if (is_delete) {
			const response = await deleteRowById(env, guideID, table);
			return response;
		} else {
			return notAllowed();
		}
	}

	// ====== Channels Endpoints ====== //
	if (path.endsWith('/channels') && !search) {
		const table = 'channels';
		if (is_post) {
			let reqData;
			try {
				reqData = (await req.json()) as { name: string };
				const { name } = reqData;
				if (!name) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await insertRowInTable(env, reqData, table);
			return response;
		} else if (is_get) {
			const details = await getDataByTable(env, table);
			if (details) {
				return returnJson(details);
			}
			return notFound();
		} else if (is_delete) {
			const response = await dropEntireTable(env, table);
			return response;
		} else {
			return notAllowed();
		}
	} else if (path.startsWith('/channels/') && !search) {
		const table = 'channels';
		const channelID = decodeURIComponent(path.split('/')[2]);
		if (is_get) {
			const response = await getRowByID(env, channelID, table);
			return response;
		} else if (is_put) {
			let newData;
			try {
				newData = (await req.json()) as { name?: string };
				if (!newData.name) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await updateRowById(env, channelID, newData, table);
			return response;
		} else if (is_delete) {
			const response = await deleteRowById(env, channelID, table);
			return response;
		} else {
			return notAllowed();
		}
	}

	// ====== Messages Endpoints ====== //
	if (path.endsWith('/messages') && !search) {
		const table = 'messages';
		if (is_post) {
			let reqData;
			try {
				reqData = (await req.json()) as { channel_id: number; user_id: number; content: string };
				const { channel_id, user_id, content } = reqData;
				if (!channel_id || !user_id || !content) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await insertRowInTable(env, reqData, table);
			return response;
		} else if (is_get) {
			const details = await getDataByTable(env, table);
			if (details) {
				return returnJson(details);
			}
			return notFound();
		} else if (is_delete) {
			const response = await dropEntireTable(env, table);
			return response;
		} else {
			return notAllowed();
		}
	} else if (path.startsWith('/messages/') && !search) {
		const table = 'messages';
		const messageID = decodeURIComponent(path.split('/')[2]);
		if (is_get) {
			const response = await getRowByID(env, messageID, table);
			return response;
		} else if (is_put) {
			let newData;
			try {
				newData = (await req.json()) as { channel_id?: number; user_id?: number; content?: string };
				if (!newData.channel_id && !newData.user_id && !newData.content) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await updateRowById(env, messageID, newData, table);
			return response;
		} else if (is_delete) {
			const response = await deleteRowById(env, messageID, table);
			return response;
		} else {
			return notAllowed();
		}
	}

	// ====== Users Endpoints ====== //
	if (path.endsWith('/users') && !search) {
		const table = 'users';
		if (is_post) {
			let reqData;
			try {
				reqData = (await req.json()) as { username: string; email: string; password: string };
				const { username, email, password } = reqData;
				if (!username || !email || !password) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await insertRowInTable(env, reqData, table);
			return response;
		} else if (is_get) {
			const details = await getDataByTable(env, table);
			if (details) {
				return returnJson(details);
			}
			return notFound();
		} else if (is_delete) {
			const response = await dropEntireTable(env, table);
			return response;
		} else {
			return notAllowed();
		}
	} else if (path.startsWith('/users/') && !search) {
		const table = 'users';
		const userID = decodeURIComponent(path.split('/')[2]);
		if (is_get) {
			const response = await getRowByID(env, userID, table);
			return response;
		} else if (is_put) {
			let newData;
			try {
				newData = (await req.json()) as { username?: string; email?: string; password?: string };
				if (!newData.username && !newData.email && !newData.password) {
					return badEntity();
				}
			} catch (e) {
				console.log(e);
				return badEntity();
			}
			const response = await updateRowById(env, userID, newData, table);
			return response;
		} else if (is_delete) {
			const response = await deleteRowById(env, userID, table);
			return response;
		} else {
			return notAllowed();
		}
	}

	// ====== Default Response for Unknown Paths ====== //
	return badRequest();
}
