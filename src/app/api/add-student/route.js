export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { student_name, student_class, username, password } = await req.json();

  const { data, error } = await supabase
    .from("students")
    .insert([{ student_name, student_class, username, password }]);

  if (error) {
    console.error("SUPABASE ERROR:", error);
    return NextResponse.json({ success: false, message: error.message });
  }

  return NextResponse.json({
    success: true,
    message: "Student Added Successfully",
  });
}
