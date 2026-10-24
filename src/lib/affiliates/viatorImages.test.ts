import { describe, expect, it } from "vitest";
import { viatorProductImage } from "./viatorImages";

describe("real Viator photos", () => {
  it("retains provider images below 480 pixels rather than dropping real tours", () => {
    expect(viatorProductImage([{ isCover: true, variants: [{ width: 320, url: "https://media.viator.com/small.jpg" }] }])).toBe("https://media.viator.com/small.jpg");
  });
  it("uses another provider photo when the cover has no usable variant", () => {
    expect(viatorProductImage([{ isCover: true, variants: [] }, { variants: [{ width: 720, url: "https://media.viator.com/other.jpg" }] }])).toBe("https://media.viator.com/other.jpg");
  });
  it("never invents an image or accepts insecure images", () => {
    expect(viatorProductImage([{ variants: [{ width: 900, url: "http://media.viator.com/image.jpg" }] }])).toBeNull();
    expect(viatorProductImage()).toBeNull();
  });
});