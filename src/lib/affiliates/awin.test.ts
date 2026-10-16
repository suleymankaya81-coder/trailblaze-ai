import { describe, expect, it } from "vitest";
import { buildAwinLink } from "./awin";
import { HARVEST_HOSTS_URL } from "../../components/destination/HarvestHostsCard";

describe("MiniaLife Awin attribution", () => {
  it("attributes RoverPass clicks to publisher 3115962", () => {
    const url = new URL(buildAwinLink({
      id: "roverpass",
      partner: "roverpass",
      networkMid: 32065,
      externalUrl: "https://www.roverpass.com",
    }, "yellowstone-session"));
    expect(url.searchParams.get("awinaffid")).toBe("3115962");
    expect(url.searchParams.get("awinmid")).toBe("32065");
    expect(url.searchParams.get("clickref")).toBe("yellowstone-session");
    expect(url.searchParams.get("ued")).toBe("https://www.roverpass.com");
  });

  it("attributes the actual Harvest Hosts promotional link to publisher 3115962", () => {
    const url = new URL(HARVEST_HOSTS_URL);
    expect(url.searchParams.get("awinaffid")).toBe("3115962");
    expect(url.searchParams.get("awinmid")).toBe("111454");
    const destination = new URL(url.searchParams.get("ued") ?? "");
    expect(destination.searchParams.get("utm_content")).toBe("MINIALIFE20");
    expect(destination.searchParams.get("show_code")).toBe("true");
  });
});