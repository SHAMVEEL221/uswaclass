import { NextResponse } from "next/server";

// Hardcoded credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "uswa25.";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { success: false, message: "Invalid username ⚠️" },
        { status: 401 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
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
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Server error ❌" },
      { status: 500 }
    );
  }
}
