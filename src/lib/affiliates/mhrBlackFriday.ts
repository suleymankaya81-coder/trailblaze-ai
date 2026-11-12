// Motorhome Republic Black Friday 2026: live until 2 Dec 2026 11:59pm NZDT (10:59 UTC).
export const MHR_BF_START = Date.UTC(2026, 10, 11, 0, 0);
export const MHR_BF_END = Date.UTC(2026, 11, 2, 10, 59);
export const MHR_BF_DEAL_PATH = "/cruise-america-us/special-offer-black-friday-sale.553538.html";
export const isMhrBlackFridayLive = (now = Date.now()) => now >= MHR_BF_START && now < MHR_BF_END;
