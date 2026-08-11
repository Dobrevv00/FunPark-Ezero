"use server";

import { createEnquiry, type EnquiryResult } from "@/lib/enquiries";

/**
 * Сървърни екшъни за публичните форми. Всеки задава своя `formSource` сам —
 * клиентът не може да го подмени. Клиентските компоненти внасят само оттук.
 */

/** Контактната форма на страница „Контакти“. */
export async function submitContactEnquiry(input: {
  name: string;
  phone: string;
  email: string;
  message?: string;
  pageUrl?: string;
  honeypot?: string;
}): Promise<EnquiryResult> {
  return createEnquiry({ ...input, formSource: "contact" });
}

/** Запитване за пакет от страница „Рожденни дни“. */
export async function submitPackageEnquiry(input: {
  name: string;
  phone: string;
  email: string;
  message?: string;
  pageUrl?: string;
  honeypot?: string;
  packageId: number | string;
  packageTitle: string;
}): Promise<EnquiryResult> {
  return createEnquiry({
    name: input.name,
    phone: input.phone,
    email: input.email,
    message: input.message,
    pageUrl: input.pageUrl,
    honeypot: input.honeypot,
    selectedPackageId: input.packageId,
    selectedPackageTitle: input.packageTitle,
    formSource: "birthday_packages",
  });
}
