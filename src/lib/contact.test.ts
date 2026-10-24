import { describe, expect, it } from "vitest";
import { buildContactEmail, contactSchema } from "./contact";

describe("contact email", () => {
  it("addresses enquiries to info@minialife.com", () => {
    expect(buildContactEmail({ name: "Visitor", email: "visitor@example.org", message: "Route question" }).split("?")[0]).toBe("mailto:info@minialife.com");
  });
  it("encodes subject and body without allowing extra mail headers", () => {
    const link = buildContactEmail({ name: "A & B", email: "visitor@example.org", message: "Hello &bcc=other@example.org\nA question?" });
    const params = new URLSearchParams(link.split("?")[1]);
    expect([...params.keys()]).toEqual(["subject", "body"]);
    expect(params.get("body")).toContain("Hello &bcc=other@example.org\nA question?");
    expect(params.get("body")).toContain("Reply to: visitor@example.org");
  });
  it("rejects missing details and invalid email addresses", () => {
    expect(contactSchema.safeParse({ name: " ", email: "invalid", message: " " }).success).toBe(false);
    expect(() => buildContactEmail({ name: "Visitor", email: "invalid", message: "Question" })).toThrow();
  });
  it("rejects multiline names and excessive message length", () => {
    expect(contactSchema.safeParse({ name: "Visitor\nBcc: other", email: "visitor@example.org", message: "Question" }).success).toBe(false);
    expect(contactSchema.safeParse({ name: "Visitor", email: "visitor@example.org", message: "a".repeat(2001) }).success).toBe(false);
  });
});