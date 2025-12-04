import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Invalid username ⚠️" },
        { status: 401 }
      );
    }

    if (data.password !== password) {
      return NextResponse.json(
        { success: false, message: "Wrong password ❌" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin login success ✅",
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server error ❌" },
      { status: 500 }
    );
  }
}
