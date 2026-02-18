import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey =
  process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(request: Request) {
  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      {
        error:
          "Cloudinary API Key or Secret not configured. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local",
      },
      { status: 500 },
    );
  }

  const body = await request.json();
  const { paramsToSign } = body;

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({ signature });
}
