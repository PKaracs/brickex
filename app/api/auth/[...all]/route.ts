import { authHandler } from "@/lib/auth";

export const runtime = "nodejs";

export const { GET, POST, PATCH, PUT, DELETE } = authHandler;
