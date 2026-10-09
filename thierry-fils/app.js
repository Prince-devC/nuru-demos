/* Thierry & Fils · application du site (routage par ancre, aucune dépendance).
   Le paiement est simulé : en production, il passe par un agrégateur béninois
   (FedaPay ou KKiaPay) qui déclenche la demande Mobile Money sur le téléphone du client. */
import { ICONES } from "./icones.js";
import { ENTREPRISE, LOGEMENTS, PRODUITS, LIVRAISON, MODELES_TROC } from "./donnees.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const e = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ico = (n, cl = "i") => `<svg class="${cl}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n] || ""}</svg>`;
const F = (n) => new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ") + " F";
const wa = (texte) => `https://wa.me/${ENTREPRISE.whatsapp}?text=${encodeURIComponent(texte)}`;
const app = $("#app");

/* ── Stockage local : le panier et l'historique de démonstration ───────── */
const lire = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* navigation privée */ } };
let panier = lire("tf-panier", []);
const sauverPanier = () => { ecrire("tf-panier", panier); majCompteur(); };
const historiser = (o) => { const h = lire("tf-historique", []); h.unshift(o); ecrire("tf-historique", h.slice(0, 50)); };

/* ── Dates ─────────────────────────────────────────────────────────────── */
const auj = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const deIso = (s) => { const [a, m, j] = s.split("-").map(Number); return new Date(a, m - 1, j); };
const ajoute = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const longue = (s) => deIso(s).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
const nuits = (du, au) => Math.round((deIso(au) - deIso(du)) / 864e5);

/* Disponibilités d'exemple : quelques jours déjà pris, toujours les mêmes. */
function joursPris(id) {
  const base = auj(), pris = new Set(), graine = id === "godomey" ? [3, 4, 9, 10, 11, 17, 24, 25] : [2, 6, 7, 13, 20, 21, 27];
  graine.forEach((n) => pris.add(iso(ajoute(base, n))));
  lire("tf-historique", []).filter((o) => o.type === "reservation" && o.logement === id).forEach((o) => {
    // Le jour du départ reste libre : le logement se libère le matin.
    if (o.du === o.au) pris.add(o.du);
    else for (let d = deIso(o.du); d < deIso(o.au); d = ajoute(d, 1)) pris.add(iso(d));
  });
  return pris;
}

/* ── Illustrations des produits (dessinées, pas de photo de stock) ─────── */
function dessin(p, couleur) {
  const c = couleur || p.couleurs[0][1];
  if (p.forme === "ecouteurs") return `<svg viewBox="0 0 120 120"><rect x="22" y="30" width="76" height="66" rx="24" fill="${c}" stroke="#cfd4da"/><line x1="22" y1="52" x2="98" y2="52" stroke="#cfd4da"/><circle cx="60" cy="72" r="3" fill="#c9cdd2"/></svg>`;
  if (p.forme === "chargeur") return `<svg viewBox="0 0 120 120"><circle cx="60" cy="54" r="34" fill="${c}" stroke="#cfd4da"/><circle cx="60" cy="54" r="22" fill="none" stroke="#dde1e5"/><path d="M60 88 C60 100 70 104 84 106" stroke="#d6dade" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  if (p.forme === "coque") return `<svg viewBox="0 0 100 200"><rect x="6" y="4" width="88" height="192" rx="18" fill="${c}" fill-opacity=".55" stroke="#b9c3cc" stroke-width="2"/><rect x="12" y="12" width="40" height="44" rx="11" fill="none" stroke="#9aa6b1" stroke-width="2"/><circle cx="50" cy="118" r="22" fill="none" stroke="#9aa6b1" stroke-width="2"/></svg>`;
  const lentilles = p.pro
    ? `<circle cx="27" cy="27" r="9" fill="#1d1f22"/><circle cx="27" cy="51" r="9" fill="#1d1f22"/><circle cx="49" cy="39" r="9" fill="#1d1f22"/><circle cx="27" cy="27" r="4" fill="#3a4a63"/><circle cx="27" cy="51" r="4" fill="#3a4a63"/><circle cx="49" cy="39" r="4" fill="#3a4a63"/><circle cx="49" cy="57" r="3" fill="#f3e9c8"/>`
    : `<circle cx="27" cy="28" r="9" fill="#1d1f22"/><circle cx="27" cy="51" r="9" fill="#1d1f22"/><circle cx="27" cy="28" r="4" fill="#3a4a63"/><circle cx="27" cy="51" r="4" fill="#3a4a63"/><circle cx="45" cy="40" r="3" fill="#f3e9c8"/>`;
  return `<svg viewBox="0 0 100 200" role="img" aria-label="${e(p.nom)}"><defs><linearGradient id="g${p.id}${c.slice(1)}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
  <rect x="4" y="2" width="92" height="196" rx="17" fill="${c}"/><rect x="4" y="2" width="92" height="196" rx="17" fill="url(#g${p.id}${c.slice(1)})"/>
  <rect x="11" y="10" width="${p.pro ? 52 : 34}" height="${p.pro ? 60 : 58}" rx="13" fill="${c}" stroke="#000" stroke-opacity=".1"/>${lentilles}</svg>`;
}

function dessinAuto() {
  return `<svg viewBox="0 0 220 110" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M14 78h192c5 0 8-4 7-9l-4-14c-2-6-7-10-14-11l-36-5-26-20c-4-3-9-5-14-5H76c-7 0-13 3-17 8L42 40l-20 6c-6 2-10 7-10 13v12c0 4 1 7 2 7Z"/>
  <path d="M60 40h96M108 21v19M64 40l14-17"/><circle cx="58" cy="80" r="16" fill="hsl(218 80% 14%)"/><circle cx="58" cy="80" r="6"/><circle cx="166" cy="80" r="16" fill="hsl(218 80% 14%)"/><circle cx="166" cy="80" r="6"/>
  <path d="M196 58h10M16 58h12" stroke-width="4"/></svg>`;
}

/* ── Gabarit commun ────────────────────────────────────────────────────── */
function majCompteur() {
  const n = panier.reduce((s, a) => s + a.qte, 0);
  const em = $("#compteur"); em.textContent = n; em.classList.toggle("cache", !n);
}
function toast(t) {
  const el = $("#toast"); el.innerHTML = ico("circle-check") + e(t); el.classList.add("on");
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2600);
}
const titre = (t) => { document.title = t ? `${t} · Thierry & Fils` : "Thierry & Fils · Appartements meublés, téléphones et véhicules"; };

/* ══ Accueil ═══════════════════════════════════════════════════════════ */
function vueAccueil() {
  titre();
  const g = LOGEMENTS[0], b = LOGEMENTS[1];
  app.innerHTML = `
  <section class="heros" style="padding:0">
    <div class="diapo">${[g.photos[0], g.photos[5], g.photos[2], g.photos[4]].map((p, k) => `<img src="${p}" alt="" ${k ? 'loading="lazy"' : 'fetchpriority="high"'} style="animation-delay:${k * 6}s">`).join("")}</div>
    <div class="c">
      <span class="sur">${ico("sparkles")}Résidences meublées · Boutique · Véhicules</span>
      <h1>Votre séjour, votre téléphone, votre véhicule. <span>Réservés en deux minutes.</span></h1>
      <p class="lead">Appartements meublés à Godomey et Bidossèssi, smartphones neufs et reconditionnés, troc, réparation, véhicules. Payez par Mobile Money, recevez la confirmation sur WhatsApp.</p>
      <div class="actions"><a class="btn p" href="#/residences">${ico("calendar-check")}Réserver un appartement</a><a class="btn s" href="#/boutique">${ico("smartphone")}Voir la boutique</a></div>
      <div class="chiffres">
        <div><b>${F(10000)}</b><small>la journée à Bidossèssi</small></div>
        <div><b>${F(30000)}</b><small>la nuitée à Godomey, électricité incluse</small></div>
        <div><b>Mobile Money</b><small>MTN et Moov acceptés</small></div>
      </div>
    </div>
  </section>

  <section><div class="c">
    <div class="tete"><div><span class="sur">Trois métiers, une seule adresse</span><h2>Tout ce que propose Thierry & Fils</h2>
      <p class="st">Un appartement pour la nuit, un iPhone pour la semaine, un véhicule pour le week-end : tout se réserve et se paie ici.</p></div></div>
    <div class="univers">
      <a class="univ" href="#/residences"><img src="${g.photos[0]}" alt="Salon de l'appartement de Godomey"><div><span class="etq">${ico("bed-double")}Appartements</span><h3>Résidences meublées</h3><p>Godomey Échangeur et Bidossèssi, à la journée, à la nuitée ou pour 24 heures.</p><span class="fl">Réserver ${ico("arrow-right")}</span></div></a>
      <a class="univ" href="#/boutique"><div class="illu illu-tel">${dessin(PRODUITS[0]).replace("<svg", '<svg style="width:34%;transform:rotate(-8deg);filter:drop-shadow(0 30px 40px #0008)"')}</div><div><span class="etq">${ico("smartphone")}Téléphones</span><h3>Boutique et dealer</h3><p>iPhone neufs et reconditionnés, accessoires, troc de votre ancien téléphone et réparation.</p><span class="fl">Découvrir ${ico("arrow-right")}</span></div></a>
      <a class="univ" href="#/vehicules"><div class="illu illu-auto">${dessinAuto()}</div><div><span class="etq">${ico("car")}Véhicules</span><h3>Vente et location</h3><p>Un véhicule pour un déplacement, un événement ou pour l'acheter : dites-nous ce qu'il vous faut.</p><span class="fl">Faire une demande ${ico("arrow-right")}</span></div></a>
    </div>
  </div></section>

  <section style="padding-top:0"><div class="c">
    <div class="tete"><div><span class="sur">${ico("bed-double")}Nos résidences</span><h2>Deux appartements, disponibles maintenant</h2></div><a class="btn s" href="#/residences">Tout voir ${ico("arrow-right")}</a></div>
    <div class="logements">${LOGEMENTS.map(carteLogement).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="c">
    <div class="tete"><div><span class="sur">${ico("play")}Visite en vidéo</span><h2>Visitez avant de réserver</h2><p class="st">Les vidéos tournées sur place, sans retouche.</p></div></div>
    <div class="videos">${LOGEMENTS.map((l) => `<figure><div class="video-cadre"><video controls playsinline preload="none" poster="${l.affiche}"><source src="${l.video}" type="video/mp4"></video></div><figcaption><b>${e(l.court)}</b><a class="sur" href="#/residence/${l.id}">Réserver ${ico("arrow-right")}</a></figcaption></figure>`).join("")}</div>
  </div></section>

  <section style="padding-top:0"><div class="c">
    <div class="confiance">
      <div class="conf"><div class="tuile">${ico("wallet")}</div><div><h3>Mobile Money</h3><p>MTN MoMo, Moov Money ou carte bancaire. Reçu immédiat.</p></div></div>
      <div class="conf"><div class="tuile">${ico("calendar-check")}</div><div><h3>Disponibilités en direct</h3><p>Le calendrier montre les jours libres. Plus d'aller-retour de messages.</p></div></div>
      <div class="conf"><div class="tuile">${ico("message-circle")}</div><div><h3>Confirmation WhatsApp</h3><p>Votre réservation ou votre commande arrive directement chez nous.</p></div></div>
      <div class="conf"><div class="tuile rg">${ico("shield-check")}</div><div><h3>Paiement sécurisé</h3><p>Votre argent passe par un opérateur agréé, jamais par une capture d'écran.</p></div></div>
    </div>
  </div></section>

  <section style="padding-top:0"><div class="c">
    <div class="appel"><div><h2>Une question avant de réserver ?</h2><p>Écrivez-nous, on répond vite. Ou appelez le ${e(ENTREPRISE.telephone)}.</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn s" href="${wa("Bonjour Thierry & Fils, j'ai une question.")}" target="_blank" rel="noopener">${ico("message-circle")}WhatsApp</a><a class="btn r" href="tel:+${ENTREPRISE.whatsapp}">${ico("phone")}Appeler</a></div></div>
  </div></section>`;
}

function carteLogement(l) {
  const min = Math.min(...l.formules.map((f) => f.prix));
  return `<a class="logement" href="#/residence/${l.id}">
    <div class="vis"><img src="${l.photos[0]}" alt="${e(l.nom)}" loading="lazy"><span class="etq ok">${ico("circle-check")}${e(l.statut)}</span></div>
    <div class="corps"><span class="lieu">${ico("map-pin")}${e(l.lieu)}</span><h3>${e(l.nom)}</h3><p style="color:hsl(var(--gris));font-size:15px">${e(l.accroche)}</p>
      <div class="equip">${l.equipements.slice(0, 4).map(([i, t]) => `<span class="etq">${ico(i)}${e(t)}</span>`).join("")}</div>
      <div class="pied"><span class="prix"><small>À partir de</small><br><b>${F(min)}</b></span><span class="btn p sm">Réserver ${ico("arrow-right")}</span></div></div></a>`;
}

/* ══ Résidences ════════════════════════════════════════════════════════ */
function vueResidences() {
  titre("Résidences meublées");
  app.innerHTML = `<div class="c" style="padding-block:48px 88px">
    <span class="sur">${ico("bed-double")}Résidences meublées</span><h1 style="font-size:clamp(32px,4.6vw,52px);margin:12px 0 12px">Choisissez votre appartement</h1>
    <p class="st" style="margin-bottom:36px">Les disponibilités sont à jour. Choisissez vos dates, payez par Mobile Money : la confirmation arrive sur WhatsApp.</p>
    <div class="logements">${LOGEMENTS.map(carteLogement).join("")}</div></div>`;
}

/* ══ Fiche d'un appartement + module de réservation ════════════════════ */
const etatResa = {};
function vueLogement(id) {
  const l = LOGEMENTS.find((x) => x.id === id); if (!l) return vueResidences();
  titre(l.nom);
  const s = etatResa[id] ||= { formule: l.formules[0].id, du: null, au: null, mois: auj().getMonth(), annee: auj().getFullYear() };
  app.innerHTML = `<div class="c">
    <nav class="fil"><a href="#/">Accueil</a>${ico("chevron-right")}<a href="#/residences">Résidences</a>${ico("chevron-right")}<span>${e(l.court)}</span></nav>
    <div class="fiche-tete"><div><span class="lieu" style="display:flex;gap:6px;color:hsl(var(--gris));font-weight:600">${ico("map-pin")}${e(l.lieu)}</span><h1 style="margin-top:8px">${e(l.nom)}</h1></div>
      <span class="etq ok" style="font-size:14px;padding:7px 14px">${ico("circle-check")}${e(l.statut)}</span></div>
    <div class="galerie">${l.photos.slice(0, 5).map((p, k) => `<button data-photo="${k}" aria-label="Agrandir la photo ${k + 1}"><img src="${p}" alt="" ${k ? 'loading="lazy"' : ""}>${k === 4 || (k === l.photos.length - 1 && k < 4) ? `<span class="plus">${ico("images")}${l.photos.length} photos</span>` : ""}</button>`).join("")}</div>
    <div class="fiche">
      <div>
        <div class="bloc"><h2>L'appartement</h2><p>${e(l.description)}</p></div>
        <div class="bloc"><h2>Ce que vous trouverez sur place</h2><div class="equipements">${l.equipements.map(([i, t]) => `<div>${ico(i)}${e(t)}</div>`).join("")}</div></div>
        <div class="bloc"><h2>La visite en vidéo</h2><div class="media-duo"><div class="video-cadre"><video controls playsinline preload="none" poster="${l.affiche}"><source src="${l.video}" type="video/mp4"></video></div>
          <div class="regles"><div>${ico("clock")}<span>Arrivée et départ aux heures convenues lors de la confirmation.</span></div><div>${ico("key-round")}<span>Remise des clés en main propre, à l'arrivée.</span></div><div>${ico("wallet")}<span>Réservation garantie après paiement de l'acompte ou de la totalité.</span></div><div>${ico("message-circle")}<span>Une question ? Nous répondons sur WhatsApp au ${e(ENTREPRISE.telephone)}.</span></div></div></div></div>
        <div class="bloc" style="border:0"><h2>Où se trouve l'appartement</h2><p style="margin-bottom:14px">${e(l.lieu)}. L'adresse exacte vous est envoyée avec la confirmation.</p>
          <div class="carte-plan"><iframe loading="lazy" title="Carte" src="https://maps.google.com/maps?q=${encodeURIComponent(l.carte)}&output=embed&hl=fr"></iframe></div></div>
      </div>
      <aside class="resa" id="resa"></aside>
    </div></div>`;
  $$("[data-photo]").forEach((b) => b.onclick = () => visionneuse(l.photos, +b.dataset.photo));
  dessinerResa(l, s);
}

function dessinerResa(l, s) {
  const f = l.formules.find((x) => x.id === s.formule);
  const pris = joursPris(l.id);
  const total = calculer(l, s);
  const pret = f.plage ? s.du && s.au : s.du;
  $("#resa").innerHTML = `
    <div class="prix"><b>${F(f.prix)}</b> <small>/ ${e(f.nom.toLowerCase())}</small></div>
    ${l.formules.length > 1 ? `<div class="formules">${l.formules.map((x) => `<button class="formule" data-f="${x.id}" aria-pressed="${x.id === s.formule}"><span>${e(x.nom)}<small>${e(x.detail)}</small></span><b>${F(x.prix)}</b></button>`).join("")}</div>` : `<p style="color:hsl(var(--gris));font-size:14px;margin:-8px 0 16px">${e(f.detail)}</p>`}
    <p style="font-size:13px;font-weight:700;margin-bottom:8px">${f.plage ? "Choisissez l'arrivée, puis le départ" : "Choisissez le jour"}</p>
    ${calendrier(s, pris, f.plage)}
    ${pret ? `<div class="recap">${f.plage ? `<div><span>Arrivée</span><b>${longue(s.du)}</b></div><div><span>Départ</span><b>${longue(s.au)}</b></div><div><span>${F(f.prix)} × ${nuits(s.du, s.au)} ${f.id === "24h" ? "période(s) de 24 h" : "nuit(s)"}</span><span>${F(total)}</span></div>` : `<div><span>${e(f.nom)}</span><b>${longue(s.du)}</b></div>`}<div class="total"><span>Total</span><span>${F(total)}</span></div></div>` : ""}
    <button class="btn p plein" id="continuer" ${pret ? "" : "disabled"}>${ico("lock")}Réserver et payer</button>
    <p class="note">Vous ne payez rien avant l'étape suivante.</p>`;
  $$(".formule").forEach((b) => b.onclick = () => { s.formule = b.dataset.f; s.du = s.au = null; dessinerResa(l, s); });
  $$(".jour[data-j]").forEach((b) => b.onclick = () => choisirJour(l, s, b.dataset.j, pris));
  $("[data-mois='-1']").onclick = () => { if (--s.mois < 0) { s.mois = 11; s.annee--; } dessinerResa(l, s); };
  $("[data-mois='1']").onclick = () => { if (++s.mois > 11) { s.mois = 0; s.annee++; } dessinerResa(l, s); };
  $("#continuer").onclick = () => { location.hash = `#/reserver/${l.id}?f=${s.formule}&du=${s.du}${s.au ? `&au=${s.au}` : ""}`; };
}

function choisirJour(l, s, j, pris) {
  const f = l.formules.find((x) => x.id === s.formule);
  if (!f.plage) { s.du = j; s.au = null; }
  else if (!s.du || s.au || j <= s.du) { s.du = j; s.au = null; }
  else {
    for (let d = deIso(s.du); d < deIso(j); d = ajoute(d, 1)) if (pris.has(iso(d))) { toast("Ces dates contiennent une nuit déjà réservée"); return; }
    s.au = j;
  }
  dessinerResa(l, s);
}

function calendrier(s, pris, plage) {
  const premier = new Date(s.annee, s.mois, 1), aujourdhui = auj();
  const decal = (premier.getDay() + 6) % 7, nb = new Date(s.annee, s.mois + 1, 0).getDate();
  const peutReculer = s.annee > aujourdhui.getFullYear() || s.mois > aujourdhui.getMonth();
  let cases = "";
  for (let k = 0; k < decal; k++) cases += "<span></span>";
  for (let j = 1; j <= nb; j++) {
    const d = new Date(s.annee, s.mois, j), k = iso(d), passe = d < aujourdhui, estPris = pris.has(k);
    // Un jour pris peut servir de jour de départ (on libère le matin).
    const departPossible = plage && s.du && !s.au && k > s.du;
    const off = passe || (estPris && !departPossible);
    let cl = "jour";
    if (estPris) cl += " pris";
    if (k === s.du) cl += " deb";
    if (k === s.au) cl += " fin";
    if (s.du && s.au && k > s.du && k < s.au) cl += " dans";
    cases += `<button class="${cl}" ${off ? "disabled" : `data-j="${k}"`} aria-label="${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}${estPris ? ", réservé" : ""}">${j}</button>`;
  }
  return `<div class="cal"><div class="cal-tete"><button data-mois="-1" ${peutReculer ? "" : "disabled"} aria-label="Mois précédent">${ico("chevron-left")}</button>
    <span>${premier.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span><button data-mois="1" aria-label="Mois suivant">${ico("chevron-right")}</button></div>
    <div class="cal-grille">${["L", "M", "M", "J", "V", "S", "D"].map((x) => `<small>${x}</small>`).join("")}${cases}</div>
    <div class="cal-leg"><span><i></i>Votre choix</span><span><i class="x"></i>Déjà réservé</span><span>Disponibilités d'exemple</span></div></div>`;
}

function calculer(l, s) {
  const f = l.formules.find((x) => x.id === s.formule);
  if (!s.du) return 0;
  return f.plage ? (s.au ? f.prix * nuits(s.du, s.au) : 0) : f.prix;
}

/* ══ Tunnel de réservation ═════════════════════════════════════════════ */
function vueReserver(id, q) {
  const l = LOGEMENTS.find((x) => x.id === id); if (!l || !q.get("du")) return vueLogement(id);
  const s = { formule: q.get("f"), du: q.get("du"), au: q.get("au") };
  const f = l.formules.find((x) => x.id === s.formule) || l.formules[0];
  const total = calculer(l, s);
  const dossier = { type: "reservation", logement: l.id, nomLogement: l.nom, formule: f.nom, du: s.du, au: s.au || s.du, total };
  titre("Réservation");
  const resume = `<div class="resume"><img src="${l.photos[0]}" alt=""><div class="in"><span class="lieu" style="display:flex;gap:6px;color:hsl(var(--gris));font-size:14px;font-weight:600">${ico("map-pin")}${e(l.court)}</span><h3 style="margin-top:4px">${e(l.nom)}</h3>
    <div class="recap"><div><span>Formule</span><b>${e(f.nom)}</b></div><div><span>${s.au ? "Arrivée" : "Date"}</span><b>${longue(s.du)}</b></div>${s.au ? `<div><span>Départ</span><b>${longue(s.au)}</b></div>` : ""}<div class="total"><span>Total</span><span>${F(total)}</span></div></div></div></div>`;
  tunnel({ dossier, resume, montant: total, acompte: true, retour: `#/residence/${l.id}` });
}

/* ══ Boutique ══════════════════════════════════════════════════════════ */
const choixProduit = {};
let filtreBoutique = "tout";
function vueBoutique() {
  titre("Boutique");
  const liste = PRODUITS.filter((p) => filtreBoutique === "tout" || (filtreBoutique === "neuf" ? p.type === "iphone" && p.etat === "Neuf" : filtreBoutique === "recond" ? p.etat === "Reconditionné" : p.type === "accessoire"));
  app.innerHTML = `<div class="c" style="padding-block:48px 88px">
    <span class="sur">${ico("smartphone")}Boutique · Thierry & Fils Dealer</span>
    <h1 style="font-size:clamp(32px,4.6vw,52px);margin:12px 0 12px">Smartphones et accessoires</h1>
    <p class="st" style="margin-bottom:28px">Neufs et reconditionnés, livrés à Cotonou et Calavi ou à retirer en boutique. Paiement Mobile Money ou à la livraison.</p>
    <div class="filtres">${[["tout", "Tout"], ["neuf", "iPhone neufs"], ["recond", "Reconditionnés"], ["acc", "Accessoires"]].map(([k, t]) => `<button class="filtre" data-filtre="${k}" aria-pressed="${filtreBoutique === k}">${t}</button>`).join("")}</div>
    <div class="produits">${liste.map(carteProduit).join("")}</div>
    <p class="note" style="text-align:left;margin-top:18px">${ico("info", "i")} Prix d'exemple, à remplacer par les tarifs de la boutique.</p>
    <div class="services">
      <a class="service" href="#/troc"><div class="tuile">${ico("repeat")}</div><h3>Troc</h3><p>Échangez votre ancien téléphone contre un nouveau. Envoyez-nous son état, on vous fait une offre.</p><span class="sur">Estimer mon téléphone ${ico("arrow-right")}</span></a>
      <a class="service" href="#/reparation"><div class="tuile rg">${ico("wrench")}</div><h3>Réparation</h3><p>Écran cassé, batterie faible, problème de charge : décrivez la panne, on vous rappelle avec un devis.</p><span class="sur">Demander une réparation ${ico("arrow-right")}</span></a>
      <a class="service" href="${wa("Bonjour Thierry & Fils, je cherche un téléphone précis :")}" target="_blank" rel="noopener"><div class="tuile">${ico("search")}</div><h3>Un modèle introuvable ?</h3><p>Dites-nous ce que vous cherchez, on vous le trouve.</p><span class="sur">Écrire sur WhatsApp ${ico("arrow-right")}</span></a>
    </div></div>`;
  $$("[data-filtre]").forEach((b) => b.onclick = () => { filtreBoutique = b.dataset.filtre; vueBoutique(); });
  brancherProduits();
}

function carteProduit(p) {
  const c = choixProduit[p.id] ||= { couleur: 0, cap: 0 };
  return `<article class="produit" data-p="${p.id}">
    <div class="vis">${dessin(p, p.couleurs[c.couleur][1])}<span class="etq ${p.etat === "Neuf" ? "" : "att"}">${e(p.etat)}</span></div>
    <div class="corps"><h3>${e(p.nom)}</h3><small style="color:hsl(var(--gris));font-weight:600;font-size:13px">${e(p.couleurs[c.couleur][0])}</small>
      ${p.couleurs.length > 1 ? `<div class="couleurs">${p.couleurs.map(([n, h], k) => `<button class="pastille-c" style="background:${h}" data-c="${k}" aria-pressed="${k === c.couleur}" aria-label="${e(n)}"></button>`).join("")}</div>` : ""}
      <div class="capacites">${p.capacites.map(([n], k) => `<button class="cap" data-k="${k}" aria-pressed="${k === c.cap}">${e(n)}</button>`).join("")}</div>
      <div class="pied"><span class="prix"><b>${F(p.capacites[c.cap][1])}</b></span><button class="btn p sm" data-ajout>${ico("plus")}Ajouter</button></div></div></article>`;
}

function brancherProduits() {
  $$(".produit").forEach((el) => {
    const p = PRODUITS.find((x) => x.id === el.dataset.p), c = choixProduit[p.id];
    const redessiner = () => { el.outerHTML = carteProduit(p); brancherProduits(); };
    $$("[data-c]", el).forEach((b) => b.onclick = () => { c.couleur = +b.dataset.c; redessiner(); });
    $$("[data-k]", el).forEach((b) => b.onclick = () => { c.cap = +b.dataset.k; redessiner(); });
    $("[data-ajout]", el).onclick = () => {
      const cle = `${p.id}|${c.couleur}|${c.cap}`, ex = panier.find((a) => a.cle === cle);
      if (ex) ex.qte++; else panier.push({ cle, id: p.id, nom: p.nom, couleur: p.couleurs[c.couleur][0], hex: p.couleurs[c.couleur][1], option: p.capacites[c.cap][0], prix: p.capacites[c.cap][1], qte: 1 });
      sauverPanier(); toast(`${p.nom} ajouté au panier`); ouvrirPanier();
    };
  });
}

/* Le tiroir du panier */
function ouvrirPanier() { dessinerPanier(); $("#tiroir").classList.add("ouvert"); $("#voile").classList.add("ouvert"); }
function fermerPanier() { $("#tiroir").classList.remove("ouvert"); $("#voile").classList.remove("ouvert"); }
function dessinerPanier() {
  const total = panier.reduce((s, a) => s + a.prix * a.qte, 0);
  $("#tiroir-corps").innerHTML = panier.length ? panier.map((a, k) => `<div class="article"><div class="mini">${dessin(PRODUITS.find((p) => p.id === a.id), a.hex)}</div>
    <div><b>${e(a.nom)}</b><small>${e(a.couleur)} · ${e(a.option)}</small><div class="qte"><button data-moins="${k}" aria-label="Retirer un">${ico("minus")}</button><span>${a.qte}</span><button data-plus="${k}" aria-label="Ajouter un">${ico("plus")}</button></div></div>
    <b>${F(a.prix * a.qte)}</b></div>`).join("") : `<div class="vide">${ico("shopping-bag")}<p style="margin-top:10px">Votre panier est vide.</p></div>`;
  $("#tiroir-pied").innerHTML = panier.length ? `<div class="recap" style="margin:0 0 14px"><div class="total" style="border:0;margin:0;padding:0"><span>Sous-total</span><span>${F(total)}</span></div></div><a class="btn p plein" href="#/commande">${ico("lock")}Commander</a>` : `<a class="btn s plein" href="#/boutique">Voir la boutique</a>`;
  $$("[data-moins]").forEach((b) => b.onclick = () => { const a = panier[+b.dataset.moins]; if (--a.qte <= 0) panier.splice(+b.dataset.moins, 1); sauverPanier(); dessinerPanier(); });
  $$("[data-plus]").forEach((b) => b.onclick = () => { panier[+b.dataset.plus].qte++; sauverPanier(); dessinerPanier(); });
  $$("#tiroir-pied a").forEach((a) => a.addEventListener("click", fermerPanier));
}

/* ══ Tunnel de commande ════════════════════════════════════════════════ */
function vueCommande() {
  if (!panier.length) { location.hash = "#/boutique"; return; }
  titre("Commande");
  const sous = panier.reduce((s, a) => s + a.prix * a.qte, 0);
  const dossier = { type: "commande", articles: panier.map((a) => ({ ...a })), sousTotal: sous, mode: "retrait", total: sous };
  const resume = () => `<div class="resume"><div class="in"><h3>Votre commande</h3>${dossier.articles.map((a) => `<div class="article" style="grid-template-columns:48px 1fr auto"><div class="mini" style="width:48px;height:48px">${dessin(PRODUITS.find((p) => p.id === a.id), a.hex)}</div><div><b style="font-size:14px">${e(a.nom)}</b><small>${e(a.couleur)} · ${e(a.option)} · × ${a.qte}</small></div><b style="font-size:14px">${F(a.prix * a.qte)}</b></div>`).join("")}
    <div class="recap"><div><span>Sous-total</span><span>${F(sous)}</span></div><div><span>${dossier.mode === "livraison" ? "Livraison" : "Retrait en boutique"}</span><span>${dossier.mode === "livraison" ? F(LIVRAISON.cotonou_calavi) : "Gratuit"}</span></div><div class="total"><span>Total</span><span>${F(dossier.total)}</span></div></div></div></div>`;
  tunnel({ dossier, resume, montant: sous, livraison: true, retour: "#/boutique" });
}

/* ══ Le tunnel commun : coordonnées → paiement → confirmation ══════════ */
function tunnel(o) {
  const d = o.dossier; let etape = 1, moyen = "mtn", part = "total";
  const rendre = () => {
    const montant = d.total, aPayer = part === "acompte" ? Math.ceil(montant / 2 / 100) * 100 : montant;
    const pas = ["Vos coordonnées", "Paiement", "Confirmation"].map((t, k) => `<span class="${k + 1 === etape ? "on" : k + 1 < etape ? "fait" : ""}">${k + 1 < etape ? ico("check") : `${k + 1}.`} ${t}</span>`).join("");
    let corps = "";
    if (etape === 1) corps = `<div class="panneau"><h2>Vos coordonnées</h2><p>Pour vous envoyer la confirmation et vous joindre si besoin.</p>
      <form id="f1"><div class="deux"><div class="champ"><label for="nom">Nom et prénom</label><input id="nom" required autocomplete="name" value="${e(d.client?.nom)}"></div>
      <div class="champ"><label for="tel">Téléphone WhatsApp</label><input id="tel" required inputmode="tel" autocomplete="tel" placeholder="01 XX XX XX XX" value="${e(d.client?.tel)}"></div></div>
      ${o.livraison ? `<div class="champ"><label>Mode de réception</label><div class="choix"><button type="button" data-mode="retrait" aria-pressed="${d.mode === "retrait"}">${ico("store")} Retrait en boutique</button><button type="button" data-mode="livraison" aria-pressed="${d.mode === "livraison"}">${ico("truck")} Livraison Cotonou / Calavi</button></div></div>
        ${d.mode === "livraison" ? `<div class="champ"><label for="adr">Quartier et repère</label><input id="adr" required placeholder="Ex. Fidjrossè, près de l'église" value="${e(d.client?.adr)}"></div>` : ""}` : `<div class="deux"><div class="champ"><label for="pers">Nombre de personnes</label><select id="pers">${[1, 2, 3, 4].map((n) => `<option ${d.client?.pers == n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div class="champ"><label for="heure">Heure d'arrivée prévue</label><input id="heure" type="time" value="${e(d.client?.heure || "18:00")}"></div></div>`}
      <div class="champ"><label for="msg">Un message ? (facultatif)</label><textarea id="msg" placeholder="${o.livraison ? "Une précision sur la commande" : "Une demande particulière"}">${e(d.client?.msg)}</textarea></div>
      <button class="btn p plein" type="submit">Continuer vers le paiement ${ico("arrow-right")}</button></form></div>`;
    if (etape === 2) corps = `<div class="panneau"><h2>Paiement</h2><p>Choisissez votre moyen de paiement. Vous validez sur votre téléphone, avec votre code secret.</p>
      <div class="demo-pay">${ico("info")}<span>Démonstration : aucun paiement réel n'est effectué. Sur le site final, le paiement passe par un agrégateur agréé au Bénin (FedaPay ou KKiaPay).</span></div>
      ${o.acompte ? `<div class="champ"><label>Montant à payer maintenant</label><div class="choix"><button data-part="total" aria-pressed="${part === "total"}">Totalité · ${F(montant)}</button><button data-part="acompte" aria-pressed="${part === "acompte"}">Acompte 50 % · ${F(Math.ceil(montant / 2 / 100) * 100)}</button></div></div>` : ""}
      <div class="moyens">
        <button class="moyen" data-moyen="mtn" aria-pressed="${moyen === "mtn"}"><span class="logo-op op-mtn">MTN</span><span>MTN MoMo<small>Validation sur votre téléphone</small></span></button>
        <button class="moyen" data-moyen="moov" aria-pressed="${moyen === "moov"}"><span class="logo-op op-moov">Moov</span><span>Moov Money<small>Validation sur votre téléphone</small></span></button>
        <button class="moyen" data-moyen="carte" aria-pressed="${moyen === "carte"}"><span class="logo-op op-carte">${ico("credit-card")}</span><span>Carte bancaire<small>Visa, Mastercard</small></span></button>
        ${o.livraison ? `<button class="moyen" data-moyen="livraison" aria-pressed="${moyen === "livraison"}"><span class="logo-op op-liv">${ico("wallet")}</span><span>À la réception<small>Espèces ou MoMo au livreur</small></span></button>` : ""}
      </div>
      ${moyen === "mtn" || moyen === "moov" ? `<div class="champ"><label for="num">Numéro ${moyen === "mtn" ? "MTN" : "Moov"} à débiter</label><input id="num" inputmode="tel" value="${e(d.client?.tel)}"></div>` : ""}
      <button class="btn p plein" id="payer">${ico("lock")}${moyen === "livraison" ? "Confirmer la commande" : `Payer ${F(aPayer)}`}</button>
      <button class="btn s plein" style="margin-top:10px" id="retour1">${ico("chevron-left")}Modifier mes coordonnées</button></div>`;
    if (etape === 25) corps = `<div class="panneau attente"><div class="rond"></div><h2>Validez sur votre téléphone</h2><p style="color:hsl(var(--gris));margin-top:8px">Une demande de ${F(aPayer)} a été envoyée au ${e(d.client.num || d.client.tel)}. Composez votre code secret pour confirmer.</p></div>`;
    if (etape === 3) {
      const msg = messageWhatsApp(d);
      corps = `<div class="panneau succes"><div class="coche">${ico("check")}</div><h2>${d.type === "reservation" ? "Réservation confirmée" : "Commande confirmée"}</h2>
        <p style="color:hsl(var(--gris));margin:8px 0 18px">Référence <span class="ref">${d.ref}</span>. ${d.paye ? `${F(d.paye)} payés par ${d.moyenNom}.` : "Paiement à la réception."}</p>
        <div style="display:grid;gap:10px;max-width:420px;margin:0 auto"><a class="btn wa plein" href="${wa(msg)}" target="_blank" rel="noopener">${ico("message-circle")}Envoyer la confirmation sur WhatsApp</a>
        ${d.type === "reservation" ? `<button class="btn s plein" id="ics">${ico("calendar")}Ajouter à mon agenda</button>` : ""}<a class="btn s plein" href="#/">Retour à l'accueil</a></div></div>`;
    }
    app.innerHTML = `<div class="c"><nav class="fil"><a href="${o.retour}">${ico("chevron-left")}Retour</a></nav><div class="tunnel"><div><div class="etapes">${pas}</div>${corps}</div>${typeof o.resume === "function" ? o.resume() : o.resume}</div></div>`;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    if (etape === 1) {
      $$("[data-mode]").forEach((b) => b.onclick = () => { garder(); d.mode = b.dataset.mode; d.total = d.sousTotal + (d.mode === "livraison" ? LIVRAISON.cotonou_calavi : 0); rendre(); });
      $("#f1").onsubmit = (ev) => { ev.preventDefault(); garder(); if (!/^\+?[\d\s]{8,}$/.test(d.client.tel)) { toast("Vérifiez le numéro de téléphone"); return; } etape = 2; rendre(); };
    }
    if (etape === 2) {
      $$("[data-moyen]").forEach((b) => b.onclick = () => { moyen = b.dataset.moyen; rendre(); });
      $$("[data-part]").forEach((b) => b.onclick = () => { part = b.dataset.part; rendre(); });
      $("#retour1").onclick = () => { etape = 1; rendre(); };
      $("#payer").onclick = () => {
        d.client.num = $("#num")?.value || d.client.tel;
        d.moyenNom = { mtn: "MTN MoMo", moov: "Moov Money", carte: "carte bancaire", livraison: "paiement à la réception" }[moyen];
        d.paye = moyen === "livraison" ? 0 : aPayer;
        d.ref = (d.type === "reservation" ? "TF-R-" : "TF-C-") + Date.now().toString(36).slice(-5).toUpperCase();
        d.date = new Date().toISOString();
        if (moyen === "livraison") { finir(); return; }
        etape = 25; rendre(); setTimeout(finir, 3200);
      };
    }
    if (etape === 3 && d.type === "reservation") $("#ics").onclick = () => agenda(d);
  };
  const garder = () => { d.client = { ...d.client, nom: $("#nom")?.value.trim(), tel: $("#tel")?.value.trim(), adr: $("#adr")?.value.trim(), pers: $("#pers")?.value, heure: $("#heure")?.value, msg: $("#msg")?.value.trim() }; };
  const finir = () => { historiser({ ...d }); if (d.type === "commande") { panier = []; sauverPanier(); } etape = 3; rendre(); };
  rendre();
}

function messageWhatsApp(d) {
  if (d.type === "reservation") return `Bonjour Thierry & Fils, voici ma réservation.\n\nRéférence : ${d.ref}\nLogement : ${d.nomLogement}\nFormule : ${d.formule}\nDate : ${longue(d.du)}${d.au !== d.du ? ` → ${longue(d.au)}` : ""}\nPersonnes : ${d.client.pers} · arrivée vers ${d.client.heure}\nMontant : ${F(d.total)} · payé ${F(d.paye)} (${d.moyenNom})\n\nNom : ${d.client.nom}\nTéléphone : ${d.client.tel}${d.client.msg ? `\nMessage : ${d.client.msg}` : ""}`;
  return `Bonjour Thierry & Fils, voici ma commande.\n\nRéférence : ${d.ref}\n${d.articles.map((a) => `• ${a.nom} ${a.option}, ${a.couleur} × ${a.qte}`).join("\n")}\nTotal : ${F(d.total)} · ${d.paye ? `payé ${F(d.paye)} (${d.moyenNom})` : "paiement à la réception"}\n${d.mode === "livraison" ? `Livraison : ${d.client.adr}` : "Retrait en boutique"}\n\nNom : ${d.client.nom}\nTéléphone : ${d.client.tel}${d.client.msg ? `\nMessage : ${d.client.msg}` : ""}`;
}

function agenda(d) {
  const f = (s) => s.replaceAll("-", "");
  const fin = d.au !== d.du ? d.au : iso(ajoute(deIso(d.du), 1));
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Thierry & Fils//FR", "BEGIN:VEVENT", `UID:${d.ref}@thierry-fils`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${f(d.du)}`, `DTEND;VALUE=DATE:${f(fin)}`, `SUMMARY:Séjour · ${d.nomLogement}`, `DESCRIPTION:Référence ${d.ref}. Contact : ${ENTREPRISE.telephone}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = `reservation-${d.ref}.ics`; a.click();
}

/* ══ Troc, réparation, véhicules : des demandes envoyées sur WhatsApp ══ */
function pageService({ titreP, sur, icone, intro, etapes, champs, construire, bouton }) {
  titre(titreP);
  app.innerHTML = `<div class="c"><nav class="fil"><a href="#/">Accueil</a>${ico("chevron-right")}<span>${e(titreP)}</span></nav>
    <div class="service-page"><div><span class="sur">${ico(icone)}${e(sur)}</span><h1 style="font-size:clamp(32px,4.4vw,50px);margin:12px 0 14px">${e(titreP)}</h1><p class="st">${e(intro)}</p>
      <div class="etapes-liste">${etapes.map(([t, x], k) => `<div class="etape-l"><b>${k + 1}</b><div><h3>${e(t)}</h3><p>${e(x)}</p></div></div>`).join("")}</div></div>
    <div class="panneau"><form id="fs">${champs}<button class="btn wa plein" type="submit">${ico("message-circle")}${e(bouton)}</button><p class="note">Votre demande s'ouvre dans WhatsApp : vous la relisez avant de l'envoyer.</p></form></div></div></div>`;
  $$(".choix").forEach((g) => $$("button", g).forEach((b) => b.onclick = () => { $$("button", g).forEach((x) => x.setAttribute("aria-pressed", x === b)); }));
  $("#fs").onsubmit = (ev) => { ev.preventDefault(); const v = (id) => $(`#${id}`)?.value?.trim() || ""; const c = (id) => $(`#${id} [aria-pressed="true"]`)?.textContent.trim() || "";
    const texte = construire(v, c); historiser({ type: titreP.toLowerCase(), date: new Date().toISOString(), texte }); window.open(wa(texte), "_blank", "noopener"); };
}

const champ = (id, label, attr = "") => `<div class="champ"><label for="${id}">${label}</label><input id="${id}" ${attr}></div>`;
const choix = (id, label, opts, def = 0) => `<div class="champ"><label>${label}</label><div class="choix" id="${id}">${opts.map((o, k) => `<button type="button" aria-pressed="${k === def}">${e(o)}</button>`).join("")}</div></div>`;
const liste = (id, label, opts) => `<div class="champ"><label for="${id}">${label}</label><select id="${id}">${opts.map((o) => `<option>${e(o)}</option>`).join("")}</select></div>`;

function vueTroc() {
  pageService({ titreP: "Troc", sur: "Échangez votre téléphone", icone: "repeat",
    intro: "Votre ancien téléphone a de la valeur. Décrivez-le, choisissez le modèle qui vous intéresse : on vous fait une offre de reprise, et vous ne payez que la différence.",
    etapes: [["Décrivez votre téléphone", "Modèle, capacité, état, santé de la batterie."], ["Recevez notre offre", "Sur WhatsApp, avec la différence à payer."], ["Passez en boutique", "On vérifie le téléphone, vous repartez avec le nouveau."]],
    champs: `<div class="deux">${liste("modele", "Votre téléphone actuel", MODELES_TROC)}${liste("cap", "Capacité", ["64 Go", "128 Go", "256 Go", "512 Go", "1 To"])}</div>
      ${choix("etat", "État général", ["Comme neuf", "Bon état", "Rayures visibles", "Écran fissuré"], 1)}
      <div class="deux">${champ("batt", "Santé de la batterie (%)", 'type="number" min="40" max="100" placeholder="Ex. 86"')}${liste("veut", "Le modèle qui vous intéresse", PRODUITS.filter((p) => p.type === "iphone").map((p) => p.nom))}</div>
      <div class="deux">${champ("nom", "Votre nom", 'required autocomplete="name"')}${champ("tel", "Votre téléphone", 'required inputmode="tel"')}</div>`,
    construire: (v, c) => `Bonjour Thierry & Fils, je voudrais faire un troc.\n\nMon téléphone : ${v("modele")} ${v("cap")}\nÉtat : ${c("etat")}${v("batt") ? `\nBatterie : ${v("batt")} %` : ""}\nJe voudrais : ${v("veut")}\n\nNom : ${v("nom")}\nTéléphone : ${v("tel")}`,
    bouton: "Demander mon offre de reprise" });
}

function vueReparation() {
  pageService({ titreP: "Réparation", sur: "Atelier de réparation", icone: "wrench",
    intro: "Écran, batterie, charge, caméra : décrivez la panne et choisissez un jour pour déposer votre téléphone. On vous rappelle avec un devis avant toute intervention.",
    etapes: [["Décrivez la panne", "Le modèle et ce qui ne fonctionne plus."], ["Recevez le devis", "Prix et délai, avant toute intervention."], ["Déposez, récupérez", "Vous êtes prévenu sur WhatsApp quand c'est prêt."]],
    champs: `${liste("modele", "Modèle du téléphone", MODELES_TROC)}
      ${choix("panne", "La panne", ["Écran cassé", "Batterie", "Ne charge plus", "Caméra", "Autre"])}
      <div class="champ"><label for="desc">Décrivez le problème</label><textarea id="desc" placeholder="Ex. L'écran est fissuré en haut, le tactile fonctionne encore."></textarea></div>
      <div class="deux">${champ("jour", "Jour de dépôt souhaité", `type="date" min="${iso(auj())}"`)}${champ("tel", "Votre téléphone", 'required inputmode="tel"')}</div>${champ("nom", "Votre nom", 'required autocomplete="name"')}`,
    construire: (v, c) => `Bonjour Thierry & Fils, j'ai besoin d'une réparation.\n\nTéléphone : ${v("modele")}\nPanne : ${c("panne")}${v("desc") ? `\nDétail : ${v("desc")}` : ""}${v("jour") ? `\nDépôt souhaité : ${longue(v("jour"))}` : ""}\n\nNom : ${v("nom")}\nTéléphone : ${v("tel")}`,
    bouton: "Demander un devis" });
}

function vueVehicules() {
  pageService({ titreP: "Véhicules", sur: "Vente et location de véhicules", icone: "car",
    intro: "Pour un déplacement, un mariage, une mission ou pour acheter : dites-nous ce qu'il vous faut, on vous propose les véhicules disponibles avec photos et prix.",
    etapes: [["Votre besoin", "Location ou achat, type de véhicule, dates."], ["Nos propositions", "Les véhicules disponibles, photos et tarifs, sur WhatsApp."], ["Réservez", "Acompte par Mobile Money, remise des clés à la date prévue."]],
    champs: `${choix("type", "Vous souhaitez", ["Louer", "Acheter"])}
      ${choix("cat", "Type de véhicule", ["Berline", "SUV", "4x4", "Minibus", "Peu importe"], 4)}
      <div class="deux">${champ("du", "À partir du", `type="date" min="${iso(auj())}"`)}${champ("jours", "Durée (jours)", 'type="number" min="1" placeholder="Ex. 3"')}</div>
      ${choix("chauffeur", "Chauffeur", ["Avec chauffeur", "Sans chauffeur", "À voir"], 2)}
      <div class="deux">${champ("nom", "Votre nom", 'required autocomplete="name"')}${champ("tel", "Votre téléphone", 'required inputmode="tel"')}</div>`,
    construire: (v, c) => `Bonjour Thierry & Fils, je cherche un véhicule.\n\nJe souhaite : ${c("type")}\nType : ${c("cat")}${v("du") ? `\nÀ partir du : ${longue(v("du"))}` : ""}${v("jours") ? `\nDurée : ${v("jours")} jour(s)` : ""}\nChauffeur : ${c("chauffeur")}\n\nNom : ${v("nom")}\nTéléphone : ${v("tel")}`,
    bouton: "Envoyer ma demande" });
}

/* ── Visionneuse de photos ─────────────────────────────────────────────── */
function visionneuse(photos, k) {
  const v = $("#visio"), img = $("img", v), cpt = $(".cpt", v);
  const montre = () => { img.src = photos[k]; cpt.textContent = `${k + 1} / ${photos.length}`; };
  $(".g", v).onclick = () => { k = (k - 1 + photos.length) % photos.length; montre(); };
  $(".d", v).onclick = () => { k = (k + 1) % photos.length; montre(); };
  $(".x", v).onclick = () => v.classList.remove("ouvert");
  v.onclick = (ev) => { if (ev.target === v) v.classList.remove("ouvert"); };
  document.onkeydown = (ev) => { if (!v.classList.contains("ouvert")) return; if (ev.key === "Escape") v.classList.remove("ouvert"); if (ev.key === "ArrowLeft") $(".g", v).click(); if (ev.key === "ArrowRight") $(".d", v).click(); };
  let x0 = null; v.ontouchstart = (ev) => { x0 = ev.touches[0].clientX; };
  v.ontouchend = (ev) => { if (x0 === null) return; const dx = ev.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) (dx > 0 ? $(".g", v) : $(".d", v)).click(); x0 = null; };
  montre(); v.classList.add("ouvert");
}

/* ── Routage ───────────────────────────────────────────────────────────── */
function router() {
  const [chemin, qs] = (location.hash.slice(1) || "/").split("?");
  const q = new URLSearchParams(qs || ""), p = chemin.split("/").filter(Boolean);
  fermerPanier(); $("#menu-mob").classList.remove("ouvert");
  document.body.classList.toggle("en-tunnel", ["reserver", "commande"].includes(p[0]));
  $$(".liens a").forEach((a) => a.classList.toggle("actif", a.getAttribute("href") === `#/${p[0] || ""}`));
  if (!p.length) vueAccueil();
  else if (p[0] === "residences") vueResidences();
  else if (p[0] === "residence") vueLogement(p[1]);
  else if (p[0] === "reserver") vueReserver(p[1], q);
  else if (p[0] === "boutique") vueBoutique();
  else if (p[0] === "commande") vueCommande();
  else if (p[0] === "troc") vueTroc();
  else if (p[0] === "reparation") vueReparation();
  else if (p[0] === "vehicules") vueVehicules();
  else vueAccueil();
  if (!p.length || p[0] !== "reserver") window.scrollTo(0, 0);
}

$("#ouvrir-panier").onclick = ouvrirPanier;
$("#fermer-panier").onclick = fermerPanier;
$("#voile").onclick = fermerPanier;
$("#burger").onclick = () => $("#menu-mob").classList.toggle("ouvert");
$$("[data-ico]").forEach((el) => { el.insertAdjacentHTML("afterbegin", ico(el.dataset.ico)); });
window.addEventListener("hashchange", router);
majCompteur(); router();
