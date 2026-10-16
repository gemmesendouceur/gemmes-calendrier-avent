import type { Config } from "@netlify/functions";

// Calendrier de l'Avent des Étincelles Divines 2026 : envoi du cahier « De l'invisible à la matière »
//
// Variables à définir dans Netlify (Project configuration > Environment variables) :
//   BREVO_API_KEY       : la même clé API Brevo que tes autres pages (obligatoire)
//   AVENT_LIST_ID       : numéro de la liste Brevo « Calendrier de l'Avent 2026 » (obligatoire)
//   INFOLETTRE_LIST_ID  : numéro de ta liste d'infolettre (facultatif ; seulement si la case est cochée)

const SENDER = { email: "gemmesendouceur@gmail.com", name: "Edith | Gemmes en douceur" };
const NOTIFY_EMAIL = "gemmesendouceur@gmail.com";
const SITE_URL = "https://gemmes-calendrier-avent.netlify.app";
const PDF_URL = `${SITE_URL}/de-l-invisible-a-la-matiere.pdf`;
const EMPREINTE_URL = "https://www.gemmesendouceur.com/empreinte-gemmes";

const RESERVATION_URL = "https://www.gorendezvous.com/kinaya";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function courrielCadeau(prenom: string): string {
  const p = escapeHtml(prenom);
  return `<!doctype html>
<html lang="fr-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf4f1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf4f1;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;">
  <tr><td style="background:#992174;padding:26px 32px;text-align:center;">
    <p style="margin:0;font-family:Georgia,serif;font-size:13px;letter-spacing:3px;color:#F5BEAC;text-transform:uppercase;">Calendrier de l'Avent des Étincelles Divines</p>
  </td></tr>
  <tr><td style="padding:34px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#3d2a33;">
    <p style="margin:0 0 18px 0;font-family:Georgia,serif;font-size:24px;color:#992174;">Bonjour ${p},</p>
    <p style="margin:0 0 16px 0;">Merci de t'être inscrit·e! Comme promis, voici ton cahier d'introspection <strong>De l'invisible à la matière</strong>.</p>
    <p style="margin:0 0 24px 0;">Prends-le à ton rythme. Tu peux le lire d'un trait ou y revenir une page à la fois, écrire directement dedans ou dans un carnet à côté. Garde ce qui résonne pour toi et laisse de côté ce qui ne te parle pas.</p>
  </td></tr>
  <tr><td align="center" style="padding:0 32px 30px 32px;">
    <a href="${PDF_URL}" style="display:inline-block;background:#992174;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;padding:15px 30px;border-radius:40px;">Télécharger mon cahier (PDF)</a>
    <p style="margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#976356;">Astuce : enregistre-le sur ton appareil pour le retrouver facilement.</p>
  </td></tr>
  <tr><td style="padding:0 32px;"><div style="border-top:1px solid #F5BEAC;"></div></td></tr>
  <tr><td style="padding:28px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3d2a33;">
    <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:20px;color:#992174;">Un bonus pour aller plus loin</p>
    <p style="margin:0 0 14px 0;font-weight:bold;color:#976356;">L'Empreinte Gemmes à 199 $ au lieu de 225 $</p>
    <p style="margin:0 0 14px 0;">Si tu as envie d'explorer ce que tu vis avec quelqu'un à tes côtés, L'Empreinte Gemmes est une rencontre personnalisée de 2 heures qui allie discussion, exploration de ton vécu et travail énergétique, en présentiel à Sherbrooke ou à distance.</p>
    <p style="margin:0 0 14px 0;">Ce tarif s'applique à une seule rencontre par personne, que ce soit ta première rencontre ou une rencontre de suivi si tu es déjà cliente ou client.</p>
    <p style="margin:0 0 20px 0;"><strong>Pour obtenir le tarif :</strong> réserve sur <a href="${RESERVATION_URL}" style="color:#992174;font-weight:bold;">GoRendezVous</a> (Kinaÿa Espace bien-être, choisis Edith Cloutier, puis L'Empreinte Gemmes) et écris « Calendrier des Étincelles » dans la zone Commentaires.</p>
    <p style="margin:0 0 28px 0;"><a href="${EMPREINTE_URL}" style="color:#992174;">Découvrir L'Empreinte Gemmes</a></p>
    <p style="margin:0 0 4px 0;">Avec douceur,</p>
    <p style="margin:0 0 28px 0;font-family:Georgia,serif;font-size:18px;color:#992174;">Edith</p>
  </td></tr>
  <tr><td style="background:#F5BEAC;padding:20px 32px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#5a3a44;">
    <a href="https://www.gemmesendouceur.com" style="color:#992174;font-weight:bold;text-decoration:none;">Gemmes en douceur</a> · Sherbrooke, Québec<br>
    Tu reçois ce courriel parce que tu as demandé le cahier sur la page du calendrier de l'Avent. Ton adresse sert à t'envoyer ce cadeau.
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Méthode non permise" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requête invalide" }, 400);
  }

  const prenom = String(body.prenom ?? "").trim().slice(0, 60);
  const courriel = String(body.courriel ?? "").trim().toLowerCase().slice(0, 120);
  const infolettre = body.infolettre === true;
  const piege = String(body.site_web ?? "");
  const tempsMs = Number(body.t ?? 0);

  // Protection anti-robots : champ piège rempli, ou formulaire soumis en moins de 3 secondes.
  // On répond « succès » pour ne pas renseigner le robot, sans rien enregistrer.
  if (piege || (tempsMs > 0 && tempsMs < 3000)) {
    return json({ success: true });
  }

  if (!prenom || !courriel) {
    return json({ error: "Merci d'indiquer ton prénom et ton courriel." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(courriel)) {
    return json({ error: "Cette adresse courriel ne semble pas valide. Peux-tu la vérifier?" }, 400);
  }

  const apiKey = Netlify.env.get("BREVO_API_KEY");
  const listeAvent = Number(Netlify.env.get("AVENT_LIST_ID"));
  const listeInfolettre = Number(Netlify.env.get("INFOLETTRE_LIST_ID"));
  if (!apiKey || !listeAvent) {
    console.error("Configuration manquante : BREVO_API_KEY ou AVENT_LIST_ID");
    return json({ error: "Le formulaire n'est pas encore relié. Réessaie un peu plus tard." }, 500);
  }

  const listIds = [listeAvent];
  if (infolettre && listeInfolettre) listIds.push(listeInfolettre);

  const headers = { "Content-Type": "application/json", "api-key": apiKey };

  try {
    // 1. Enregistrer la personne dans Brevo (liste du calendrier, + infolettre seulement si cochée)
    const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: courriel,
        attributes: { PRENOM: prenom },
        listIds,
        updateEnabled: true,
      }),
    });
    if (!contactRes.ok) {
      console.error("Erreur Brevo contact :", await contactRes.text());
      return json({ error: "Ton inscription n'a pas pu être enregistrée. Réessaie dans un instant." }, 502);
    }

    // 2. Envoyer le cadeau tout de suite
    const envoiRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: courriel, name: prenom }],
        replyTo: { email: NOTIFY_EMAIL, name: "Edith Cloutier" },
        subject: "Ton cadeau : De l'invisible à la matière",
        htmlContent: courrielCadeau(prenom),
        tags: ["calendrier-avent-2026"],
      }),
    });
    if (!envoiRes.ok) {
      console.error("Erreur Brevo envoi :", await envoiRes.text());
      return json({ error: "Ton inscription est enregistrée, mais le courriel n'a pas pu partir. Écris-moi à gemmesendouceur@gmail.com et je te l'envoie." }, 502);
    }

    // 3. Petite notification pour Edith (n'empêche pas la réussite si elle échoue)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: NOTIFY_EMAIL }],
        subject: `Calendrier de l'Avent : nouvelle inscription (${prenom})`,
        htmlContent: `<p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p><p><strong>Courriel :</strong> ${escapeHtml(courriel)}</p><p><strong>Infolettre :</strong> ${infolettre ? "oui" : "non"}</p>`,
      }),
    }).catch((e) => console.error("Notification Edith :", e));

    return json({ success: true });
  } catch (err) {
    console.error("Erreur serveur :", err);
    return json({ error: "Une erreur est survenue. Réessaie dans un instant." }, 500);
  }
};

export const config: Config = {
  path: "/api/inscription",
};
