import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COUNTRY_DIRECTORY } from "@/lib/data/countryDirectory";
import { tp } from "@/lib/i18n";

const about = readFileSync("src/routes/about.tsx", "utf8");

describe("about page", () => {
  it("describes the worldwide scope, not U.S.-only guides", () => {
    expect(about).toContain("40+ countries");
    expect(about).not.toMatch(/U\.S\. outdoor|free U\.S\./i);
  });
  it("the 40+ claim matches the country directory", () => {
    expect(COUNTRY_DIRECTORY.length).toBeGreaterThanOrEqual(40);
  });
  it("names the editorial team, never an invented person", () => {
    expect(about).toContain("WildParkRoutes editorial team");
  });
  it("new wording is translated on the German and French pages", () => {
    for (const text of [
      "Free outdoor travel guides and self-drive itineraries for 40+ countries — for people who would rather be outside.",
      "Guides are written and reviewed by the WildParkRoutes editorial team.",
    ]) {
      expect(tp("de", text)).not.toBe(text);
      expect(tp("fr", text)).not.toBe(text);
    }
  });
});

describe("no visible legacy email", () => {
  it("no route or component shows a minialife.com address", () => {
    // Text sources only: public/ also holds ~1 GB of images, which made a full grep slow enough to time out.
    const hits = execSync("grep -rIl --include='*.ts' --include='*.tsx' --include='*.txt' --include='*.html' --include='*.json' --include='*.xml' 'minialife\\.com' src/routes src/components public || true", { encoding: "utf8" }).trim();
    expect(hits).toBe("");
  });
});
