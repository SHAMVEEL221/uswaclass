import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    return NextResponse.json({
      success: false,
      message: "Invalid username or password",
    });
  }

  return NextResponse.json({
    success: true,
    message: "Login successful",
    student: data,
  });
}
