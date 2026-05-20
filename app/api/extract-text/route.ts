import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Forward the file to the Spring Boot backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const backendResponse = await fetch(`${BACKEND_URL}/api/extract-text`, {
      method: "POST",
      body: backendFormData,
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        responseData,
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("File extraction error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with the extraction service. Please try again." },
      { status: 500 }
    );
  }
}
