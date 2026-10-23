import { useEffect, useRef, useState } from "react";
import { Car, Truck } from "lucide-react";
import { motorhomeRepublicLink, airportRentalsLink } from "@/lib/affiliates/webjet";
import { Button } from "@/components/ui/button";

const TABS = {
  rv: { label: "RV & Campervan", icon: Truck, brand: "Motorhome Republic", host: "www.motorhomerepublic.com", extra: "&country=", fallback: motorhomeRepublicLink(), blurb: "Compare motorhomes and campervans from professional rental fleets across the USA." },
  car: { label: "Car Rental", icon: Car, brand: "Airport Rentals", host: "www.airportrentals.com", extra: "", fallback: airportRentalsLink(), blurb: "Compare airport car rentals and return to the same airport to avoid one-way fees." },
} as const;
type Tab = keyof typeof TABS;

/** Live Webjet search forms (affiliate=minialife), loaded only when the section scrolls into view. */
export function RentalSearch() {
  const [tab, setTab] = useState<Tab>("rv");
  const [visible, setVisible] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(430);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setVisible(true); io.disconnect(); } }, { rootMargin: "300px" });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.type !== "webjet-size") return;
      if (typeof event.data.height === "number") setHeight(Math.min(1100, Math.max(320, event.data.height)));
      if (event.data.ready === true) setReady(true);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  const t = TABS[tab];
  // Each provider owns a global Republic namespace. Separate documents prevent
  // the RV widget from overwriting the car widget's templates and country lists.
  const src = `https://${t.host}/widget/searchform.js?element_id=VehicleSearchForm&affiliate=minialife&target=_blank&pickup_country=US&country=US&language=en`;
  const documentHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="https://${t.host}/"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    :root{color-scheme:light}body{margin:0;font-family:Arial,sans-serif}#VehicleSearchForm{width:100%;min-height:300px}*{box-sizing:border-box}input,select{max-width:100%}
  </style></head><body><div id="VehicleSearchForm"></div><script>
    function report(){
      var root=document.getElementById('VehicleSearchForm');
      // A legacy provider template can emit '< class="republic-small">'
      // as text instead of a span. Remove only that malformed tag fragment.
      var walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), node;
      while(node=walk.nextNode()){
        var cleaned=node.nodeValue.replace(/<\\s*class=["']republic-(small|large)["']>/g,'');
        if(cleaned!==node.nodeValue)node.nodeValue=cleaned;
      }
      parent.postMessage({type:'webjet-size',height:Math.ceil(document.body.scrollHeight)+24,ready:!!root.querySelector('input,select')},'*');
    }
    new MutationObserver(report).observe(document.getElementById('VehicleSearchForm'),{childList:true,subtree:true,characterData:true});
    window.addEventListener('resize',report);setInterval(report,1500);
  </script><script async src="${src}"></script></body></html>`;

  return (
    <div ref={wrap} className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <div className="flex border-b border-border">
        {(Object.keys(TABS) as Tab[]).map((k) => {
          const T = TABS[k];
          return (
            <Button key={k} type="button" variant="ghost" onClick={() => { setTab(k); setReady(false); setHeight(430); }} aria-pressed={tab === k}
              className={`h-auto flex-1 whitespace-normal rounded-none px-4 py-4 text-sm font-semibold ${tab === k ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
              <T.icon className="h-4 w-4" />{T.label}
            </Button>
          );
        })}
      </div>
      <div className="p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground/60">Live search · {t.brand}</p>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{t.blurb}</p>
        {visible && <iframe ref={frame} key={tab} title={`${t.brand} live rental search`} srcDoc={documentHtml}
          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" height={height}
          className={`mt-5 w-full border-0 ${ready ? "" : "hidden"}`} />}
        <Button asChild variant={ready ? "outline" : "default"} className="mt-4 h-auto whitespace-normal py-3">
          <a href={t.fallback} target="_blank" rel="sponsored nofollow noopener noreferrer">
            Search on {t.brand}
          </a>
        </Button>
        <p className="mt-4 text-[11px] text-muted-foreground">Partner links · MiniaLife may earn a commission. Prices and availability are confirmed on the partner site.</p>
      </div>
    </div>
  );
}
