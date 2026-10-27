import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

// Courriel de bienvenue de l'infolettre, envoyé par Brevo juste après une inscription réussie dans Mailchimp.
// Réutilisable par d'autres formulaires (ex. site Wix) : POST /api/bienvenue { prenom, courriel, site_web, t }
//
// Protections :
//  - un seul courriel de bienvenue par adresse (on garde seulement une empreinte chiffrée de l'adresse, jamais l'adresse elle-même)
//  - champ piège et délai minimal contre les robots
//  - seules les pages de Gemmes en douceur peuvent l'appeler

const SENDER = { email: "gemmesendouceur@gmail.com", name: "Edith | Gemmes en douceur" };
const SUJET_AVEC_PRENOM = (p: string) => `Bienvenue, ${p}! Qu'est-ce qui t'amène ici?`;
const SUJET_SANS_PRENOM = "Bienvenue! Qu'est-ce qui t'amène ici?";
const ORIGINES_PERMISES = [
  "https://gemmes-calendrier-avent.netlify.app",
  "https://www.gemmesendouceur.com",
  "https://gemmesendouceur.com",
  "https://www-gemmesendouceur-com.filesusr.com", // blocs HTML intégrés du site Wix
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function enTetes(origine: string | null) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (origine && ORIGINES_PERMISES.includes(origine)) {
    h["Access-Control-Allow-Origin"] = origine;
    h["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Vary"] = "Origin";
  }
  return h;
}

async function empreinte(texte: string): Promise<string> {
  const data = new TextEncoder().encode("gemmes-bienvenue:" + texte);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function courrielBienvenue(prenom: string): string {
  const salut = prenom ? `Bonjour ${escapeHtml(prenom)},` : "Bonjour,";
  const p = (t: string) => `<p style="margin:0 0 16px 0;">${t}</p>`;
  return `<!doctype html>
<html lang="fr-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf4f1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf4f1;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
  <tr><td style="background:#992174;padding:26px 32px;text-align:center;">
    <p style="margin:0;font-family:Georgia,serif;font-size:22px;letter-spacing:4px;color:#ffffff;text-transform:uppercase;">Gemmes en douceur</p>
    <p style="margin:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:3px;color:#F5BEAC;text-transform:uppercase;">Comprendre à la source, transformer en profondeur</p>
  </td></tr>
  <tr><td style="padding:34px 32px 10px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#3d2a33;">
    <p style="margin:0 0 18px 0;font-family:Georgia,serif;font-size:24px;color:#992174;">${salut}</p>
    ${p(`Merci de t'être abonné·e à l'infolettre de <strong style="color:#992174;">Gemmes en douceur</strong>. Je suis vraiment contente que tu sois ici.`)}
    ${p(`Moi, c'est <strong style="color:#992174;">Edith</strong>. Je suis lithothérapeute et accompagnante énergétique à Sherbrooke (et en ligne). J'aime rendre l'invisible plus compréhensible : mettre des mots sur ce qu'on ressent, observer les liens qui se dessinent et ouvrir de nouvelles pistes de réflexion.`)}
    ${p(`Dans mes courriels, tu trouveras des réflexions, des questions pour prendre un temps d'arrêt, des coulisses de ma pratique et les nouvelles de <em>Gemmes en douceur</em>. J'espère que chaque message t'apportera quelque chose : une idée à laisser mûrir, une prise de conscience ou simplement un petit moment pour toi.`)}
    ${p(`Et pour que tu saches à qui tu écris : derrière la praticienne, il y a aussi une Edith qui peut se mettre à chanter dès qu'un mot lui rappelle une chanson, qui aime les romances et les road trips, et qui est parfois un peu (bon, très) têtue.`)}
    ${p(`Prends ce qui te parle et laisse le reste. Tu es toujours libre de ce que tu choisis d'en retenir.`)}
  </td></tr>
  <tr><td style="padding:0 32px 10px 32px;">
    <div style="background:#fcebe4;border-radius:12px;padding:20px 22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#3d2a33;">
      <p style="margin:0 0 10px 0;">Pour commencer, j'aimerais savoir : <strong>qu'est-ce qui t'a donné envie de t'abonner?</strong> Les pierres, la curiosité, une période de questionnement, un sujet qui revient dans ta vie… ou autre chose?</p>
      <p style="margin:0;">Tu peux simplement répondre à ce courriel, même en quelques mots. Je lis les réponses moi-même, et ça m'aide à mieux comprendre ce qui t'intéresse.</p>
    </div>
  </td></tr>
  <tr><td style="padding:22px 32px 30px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#3d2a33;">
    ${p(`Au plaisir de te lire!`)}
    <p style="margin:0 0 22px 0;font-family:Georgia,serif;font-style:italic;font-size:19px;color:#992174;">Parce que ce que tu vis a toujours un sens. On va le trouver ensemble.</p>
    <p style="margin:0 0 4px 0;">Avec douceur,</p>
    <p style="margin:0;font-family:Georgia,serif;font-size:19px;color:#992174;">Edith</p>
    <p style="margin:2px 0 0 0;font-size:14px;color:#976356;">Gemmes en douceur · Sherbrooke<br><a href="https://www.gemmesendouceur.com" style="color:#992174;">www.gemmesendouceur.com</a></p>
  </td></tr>
  <tr><td style="background:#F5BEAC;padding:18px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5a3a44;">
    Tu reçois ce courriel parce que tu viens de t'abonner à l'infolettre de Gemmes en douceur.<br>
    Tu peux te désabonner en un clic au bas de chaque infolettre, ou en <a href="mailto:gemmesendouceur@gmail.com?subject=D%C3%A9sabonnement%20infolettre" style="color:#992174;">m'écrivant simplement</a>.
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export default async (req: Request) => {
  const origine = req.headers.get("origin");
  const headers = enTetes(origine);

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Méthode non permise" }), { status: 405, headers });
  if (origine && !ORIGINES_PERMISES.includes(origine)) {
    return new Response(JSON.stringify({ error: "Origine non permise" }), { status: 403, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide" }), { status: 400, headers });
  }

  const prenom = String(body.prenom ?? "").trim().slice(0, 60);
  const courriel = String(body.courriel ?? "").trim().toLowerCase().slice(0, 120);
  const piege = String(body.site_web ?? "");
  const tempsMs = Number(body.t ?? 0);

  // Robots : on répond « succès » sans rien envoyer
  if (piege || (tempsMs > 0 && tempsMs < 3000)) return new Response(JSON.stringify({ success: true }), { headers });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(courriel)) {
    return new Response(JSON.stringify({ error: "Courriel invalide" }), { status: 400, headers });
  }

  const apiKey = Netlify.env.get("BREVO_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "Configuration manquante" }), { status: 500, headers });

  // Un seul courriel de bienvenue par adresse
  const store = getStore({ name: "bienvenue-envoyes", consistency: "strong" });
  const cle = await empreinte(courriel);
  if (await store.get(cle)) return new Response(JSON.stringify({ success: true, deja: true }), { headers });

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: courriel, ...(prenom ? { name: prenom } : {}) }],
      replyTo: { email: SENDER.email, name: "Edith Cloutier" },
      subject: prenom ? SUJET_AVEC_PRENOM(prenom) : SUJET_SANS_PRENOM,
      htmlContent: courrielBienvenue(prenom),
      tags: ["bienvenue-infolettre"],
    }),
  });

  if (!res.ok) {
    console.error("Erreur Brevo bienvenue :", await res.text());
    return new Response(JSON.stringify({ error: "Envoi impossible" }), { status: 502, headers });
  }

  await store.set(cle, new Date().toISOString());
  return new Response(JSON.stringify({ success: true }), { headers });
};

export const config: Config = {
  path: "/api/bienvenue",
};
