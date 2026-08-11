"use server";

import { getPayload } from "payload";
import config from "@payload-config";

import { isValidBgPhone, isValidEmail } from "@/lib/validation";

export type EnquiryResult = { ok: boolean; error?: string };

/**
 * Записва запитване за пакет. Създаването през публичния REST е забранено —
 * записът минава само оттук, затова се ползва overrideAccess.
 */
export async function submitPackageEnquiry(input: {
  packageId: number | string;
  packageTitle: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
}): Promise<EnquiryResult> {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const email = input.email?.trim() ?? "";

  // същите правила като в контактната форма
  if (name === "" || !isValidBgPhone(phone) || !isValidEmail(email)) {
    return { ok: false, error: "invalid" };
  }

  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "package-enquiries",
      overrideAccess: true,
      data: {
        name,
        phone,
        email,
        message: input.message?.trim() || undefined,
        package: Number(input.packageId) || undefined,
        packageTitle: input.packageTitle,
        status: "new",
      },
    });
    return { ok: true };
  } catch (err) {
    console.error(
      "[birthdays] запитването не можа да бъде записано:",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "server" };
  }
}
