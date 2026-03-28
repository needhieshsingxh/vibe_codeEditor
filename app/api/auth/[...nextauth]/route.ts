import { handlers } from "@/auth";

export const runtime = "nodejs";

const logRouteError = (method: string, req: Request, error: unknown) => {
	const url = new URL(req.url);
	const query = Object.fromEntries(url.searchParams.entries());

	if (error instanceof Error) {
		console.error(
			`[auth-route][${method}] ${url.pathname} failed: ${error.message}`,
			{
				query,
				stack: error.stack,
			}
		);
		return;
	}

	console.error(`[auth-route][${method}] ${url.pathname} failed`, {
		query,
		error,
	});
};

export async function GET(req: Request) {
	try {
		return await handlers.GET(req);
	} catch (error) {
		logRouteError("GET", req, error);
		throw error;
	}
}

export async function POST(req: Request) {
	try {
		return await handlers.POST(req);
	} catch (error) {
		logRouteError("POST", req, error);
		throw error;
	}
}