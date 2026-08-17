import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  upload: vi.fn(),
  destroy: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("cloudinary", () => ({
  v2: { uploader: { upload: mocks.upload, destroy: mocks.destroy } },
}));

import { POST } from "@/app/api/profile-picture/route";

function requestWithFile(file: unknown): Request {
  return {
    formData: async () => ({ get: () => file }),
  } as unknown as Request;
}

describe("Profile Picture upload route", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.upload.mockReset();
    mocks.destroy.mockReset();
  });

  it("uploads an image to Cloudinary and returns the original asset URL", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/photo.jpg",
      public_id: "onefit/profile-pictures/photo",
      width: 100,
      height: 100,
    });
    const file = {
      arrayBuffer: async () => new TextEncoder().encode("image bytes").buffer,
      name: "photo.jpg",
      size: 11,
      type: "image/jpeg",
    };

    const response = await POST(requestWithFile(file));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      profilePicture: {
        dataUrl: "https://res.cloudinary.com/demo/image/upload/photo.jpg",
        publicId: "onefit/profile-pictures/photo",
      },
    });
    expect(mocks.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/jpeg;base64,/),
      expect.objectContaining({ folder: "onefit/profile-pictures", resource_type: "image" }),
    );
  });

  it("rejects unauthenticated uploads", async () => {
    mocks.auth.mockResolvedValue({ userId: null });

    const response = await POST(requestWithFile(null));

    expect(response.status).toBe(401);
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("rejects non-image files", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    const file = {
      arrayBuffer: async () => new TextEncoder().encode("not an image").buffer,
      name: "resume.txt",
      size: 12,
      type: "text/plain",
    };

    const response = await POST(requestWithFile(file));

    expect(response.status).toBe(400);
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("rejects and removes a non-square Cloudinary asset", async () => {
    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/photo.jpg",
      public_id: "onefit/profile-pictures/photo",
      width: 120,
      height: 100,
    });

    const response = await POST(requestWithFile({
      arrayBuffer: async () => new ArrayBuffer(1),
      name: "photo.jpg",
      size: 1,
      type: "image/jpeg",
    }));

    expect(response.status).toBe(400);
    expect(mocks.destroy).toHaveBeenCalledWith("onefit/profile-pictures/photo", { resource_type: "image" });
  });
});
