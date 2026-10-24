import { z } from "zod";

export const CONTACT_EMAIL = "info@minialife.com";
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(100, "Use 100 characters or fewer.").refine((value) => !/[\r\n]/.test(value), "Use a single line for your name."),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  message: z.string().trim().min(1, "Enter your message.").max(2000, "Use 2,000 characters or fewer."),
});

export function buildContactEmail(input: unknown) {
  const data = contactSchema.parse(input);
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`MiniaLife enquiry from ${data.name}`)}&body=${encodeURIComponent(`${data.message}\n\nFrom: ${data.name}\nReply to: ${data.email}`)}`;
}