import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Introduce un correo valido" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { error } = await supabaseAdmin
      .from("waitlist")
      .upsert(
        { email: normalizedEmail },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { error: "No se pudo unir a la lista de espera. Intentalo de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist API error:", err);
    return NextResponse.json(
      { error: "Algo salio mal" },
      { status: 500 }
    );
  }
}
