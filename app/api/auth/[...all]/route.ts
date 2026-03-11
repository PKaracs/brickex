import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const GET = async (req: Request) => {
  return NextResponse.json(
    { message: "Auth disabled in development" },
    { status: 200 }
  );
};

export const POST = async (req: Request) => {
  return NextResponse.json(
    { message: "Auth disabled in development" },
    { status: 200 }
  );
};
