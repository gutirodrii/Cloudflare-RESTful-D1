// copyright 2023 © Xron Trix | https://github.com/Xrontrix10

import { notAllowed } from './handler/responses';
import { respondRequest } from './handler/requests';

export interface Env {
	AUTH_TOKEN: string;
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const method = request.method;
		const { pathname, search, searchParams } = new URL(request.url);

		if (method === 'POST') {
			const respond = await respondRequest(request, env, pathname, search, searchParams, true, false, false, false);
			return respond;
		} else if (method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		} else if (method === 'GET') {
			const respond = await respondRequest(request, env, pathname, search, searchParams, false, true, false, false);
			return respond;
		} else if (method === 'PUT') {
			const respond = await respondRequest(request, env, pathname, search, searchParams, false, false, true, false);
			return respond;
		} else if (method === 'DELETE') {
			const respond = await respondRequest(request, env, pathname, search, searchParams, false, false, false, true);
			return respond;
		} else {
			return notAllowed();
		}
	},
};
