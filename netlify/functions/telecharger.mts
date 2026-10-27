import { getStore } from "@netlify/blobs";
import type { Config, Context } from "@netlify/functions";

// Compteur de téléchargements du cahier « De l'invisible à la matière ».
// Aucune donnée personnelle n'est conservée : seulement un nombre total et un total par jour.
//
//   /api/telecharger : compte un téléchargement, puis envoie le PDF
//   /api/compteur    : affiche le nombre de téléchargements

const PDF = "/de-l-invisible-a-la-matiere.pdf";
const ROBOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|skype|curl|wget|python|headless/i;

type Stats = { total: number; jours: Record<string, number> };

async function lireStats(store: ReturnType<typeof getStore>) {
  const actuel = await store.getWithMetadata("stats", { type: "json" });
  if (actuel) return { stats: actuel.data as Stats, etag: actuel.etag };
  return { stats: { total: 0, jours: {} } as Stats, etag: undefined };
}

async function compter(store: ReturnType<typeof getStore>, jour: string) {
  // Quelques tentatives pour ne perdre aucun clic si deux personnes téléchargent en même temps
  for (let i = 0; i < 6; i++) {
    const { stats, etag } = await lireStats(store);
    stats.total += 1;
    stats.jours[jour] = (stats.jours[jour] ?? 0) + 1;
    const res = etag
      ? await store.setJSON("stats", stats, { onlyIfMatch: etag })
      : await store.setJSON("stats", stats, { onlyIfNew: true });
    if (res.modified) return;
  }
}

function jourQuebec(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const store = getStore({ name: "compteur-cahier", consistency: "strong" });

  if (url.pathname === "/api/compteur") {
    const { stats } = await lireStats(store);
    const total = stats.total;
    const jours: [string, number][] = Object.entries(stats.jours);
    jours.sort((a, b) => (a[0] < b[0] ? 1 : -1));
    const lignes = jours.map(([j, v]) => `<tr><td>${j}</td><td style="text-align:right">${v}</td></tr>`).join("");
    const html = `<!doctype html><html lang="fr-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Compteur du cahier</title></head>
<body style="font-family:Arial,sans-serif;background:#fdf8f5;color:#3d2a33;max-width:520px;margin:40px auto;padding:0 18px">
<p style="color:#976356;letter-spacing:2px;text-transform:uppercase;font-size:12px">Calendrier de l'Avent 2026</p>
<h1 style="font-family:Georgia,serif;color:#992174;font-weight:normal">De l'invisible à la matière</h1>
<p style="font-size:18px">Téléchargements au total : <strong style="font-size:32px;color:#992174">${total}</strong></p>
${jours.length ? `<table style="width:100%;border-collapse:collapse;font-size:15px"><thead><tr><th style="text-align:left;border-bottom:1px solid #F5BEAC;padding:6px 0">Jour</th><th style="text-align:right;border-bottom:1px solid #F5BEAC;padding:6px 0">Téléchargements</th></tr></thead><tbody>${lignes}</tbody></table>` : "<p>Le détail par jour s'affichera dès le prochain téléchargement.</p>"}
<p style="font-size:12px;color:#6d5560;margin-top:24px">Aucune donnée personnelle n'est enregistrée : seulement le nombre de clics sur le bouton de téléchargement.</p>
</body></html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  // /api/telecharger
  const agent = req.headers.get("user-agent") ?? "";
  if (req.method === "GET" && !ROBOTS.test(agent)) {
    try {
      await compter(store, jourQuebec());
    } catch (err) {
      // Le compteur ne doit jamais empêcher le téléchargement
      console.error("Compteur :", err);
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: PDF, "Cache-Control": "no-store" },
  });
};

export const config: Config = {
  path: ["/api/telecharger", "/api/compteur"],
};
