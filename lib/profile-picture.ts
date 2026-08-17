import { v2 as cloudinary } from "cloudinary";

const PROFILE_PICTURE_FOLDER = "onefit/profile-pictures";

export type UploadedProfilePicture = {
  dataUrl: string;
  publicId: string;
};

export class NonSquareProfilePictureError extends Error {
  constructor() {
    super("Profile Picture must be square");
  }
}

export async function uploadProfilePicture(
  content: Buffer,
  mimeType: string,
): Promise<UploadedProfilePicture> {
  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${content.toString("base64")}`,
    {
      folder: PROFILE_PICTURE_FOLDER,
      resource_type: "image",
    },
  );

  if (result.width !== result.height) {
    await cloudinary.uploader.destroy(result.public_id, { resource_type: "image" });
    throw new NonSquareProfilePictureError();
  }

  return { dataUrl: result.secure_url, publicId: result.public_id };
}
