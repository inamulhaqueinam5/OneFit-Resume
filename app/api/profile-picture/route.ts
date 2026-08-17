import { auth } from "@clerk/nextjs/server";
import {
  NonSquareProfilePictureError,
  uploadProfilePicture,
} from "@/lib/profile-picture";

export const dynamic = "force-dynamic";

const MAX_PROFILE_PICTURE_BYTES = 10 * 1024 * 1024;

function isImageFile(value: unknown): value is Blob & { name: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "type" in value &&
    typeof value.type === "string" &&
    value.type.startsWith("image/") &&
    "size" in value &&
    typeof value.size === "number"
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!isImageFile(file)) {
    return new Response("An image file is required", { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_PROFILE_PICTURE_BYTES) {
    return new Response("Profile Picture must be smaller than 10 MB", { status: 400 });
  }

  try {
    const picture = await uploadProfilePicture(Buffer.from(await file.arrayBuffer()), file.type);
    return Response.json({ profilePicture: picture });
  } catch (error) {
    if (error instanceof NonSquareProfilePictureError) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Profile Picture upload failed", { status: 502 });
  }
}
