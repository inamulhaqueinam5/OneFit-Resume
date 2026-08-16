"use server";

import { auth } from "@clerk/nextjs/server";
import mammoth from "mammoth";
import { assessImport, deserializeResume, parseDocx } from "@/lib/resume";
import { saveMasterProfile } from "@/lib/master-profile";
import type { ParseResult, Resume } from "@/lib/resume/types";

export type ParsedUpload = {
  resume: Resume;
  review: ParseResult["review"];
  isOfficialTemplate: boolean;
  warning: string | null;
};

export async function parseUploadedDocx(formData: FormData): Promise<ParsedUpload> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Please upload a .docx file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { value } = await mammoth.convertToHtml({ buffer });
  const result = parseDocx(value);
  const assessment = assessImport(result);

  return {
    resume: result.resume,
    review: result.review,
    isOfficialTemplate: assessment.isOfficialTemplate,
    warning: assessment.warning,
  };
}

export async function createMasterProfile(resume: Resume): Promise<void> {
  const { userId } = await auth.protect();
  const validated = deserializeResume(resume);
  await saveMasterProfile(userId, validated);
}
