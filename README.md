# Collaktiv – Väntelista

En publik väntelista/tävlingssida för Collaktiv, i samma grafiska profil som
[företagsportalen](https://github.com/collaktiv-max/collaktiv). Besökaren
gissar antalet bussbiljetter, svarar på en av två frågor om vad som skulle
få dem att åka mer buss eller vilka rabatter de vill se, och skriver upp sig
med sin e-postadress för att vara med i tävlingen.

Byggt med Next.js (App Router), TypeScript och Tailwind CSS v4.

## Kom igång

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

## Hur svaren sparas

Alla svar skickas till `POST /api/vantelista` (`src/app/api/vantelista/route.ts`),
valideras på servern och sparas via `src/lib/waitlist-db.ts`:

- **Lokalt** (`npm run dev`, ingen databas kopplad): sparas i filen
  `data/waitlist.json`. Bra för att testa, men filen finns bara på din egen
  dator/container och committas aldrig (se `.gitignore`).
- **På Vercel** (när du kopplat en databas, se guiden nedan): sparas i en
  riktig Postgres-databas via miljövariabeln `DATABASE_URL`. Det är detta
  du ska använda på riktigt, så att alla anmälningar samlas på ett ställe
  och inte försvinner.

## Driftsättning på Vercel – steg för steg

### 1. Koppla GitHub-repot till Vercel

1. Gå till [vercel.com](https://vercel.com) och logga in (kan göras med
   ditt GitHub-konto).
2. Klicka **Add New → Project**.
3. Välj repot `collaktiv-max/v-ntelista` och klicka **Import**.
4. Vercel känner igen att det är ett Next.js-projekt automatiskt – du
   behöver inte ändra några inställningar. Klicka **Deploy**.
5. Efter ett par minuter får du en länk som `v-ntelista.vercel.app` där
   sidan är live. Just nu sparas anmälningar fortfarande i en fil som
   nollställs ibland – gör steg 2 innan ni delar länken på riktigt.

### 2. Koppla på en riktig databas

1. Öppna projektet i Vercel och gå till fliken **Storage**.
2. Klicka **Create Database** och välj **Postgres** (drivs av Neon,
   ingår gratis i Vercels hobby-plan upp till en bra bit).
3. Följ guiden och klicka **Connect** till ditt projekt (`v-ntelista`).
   Vercel lägger då automatiskt in miljövariabeln `DATABASE_URL` åt dig –
   du behöver inte skriva in något själv.
4. Gå till **Deployments** och klicka **Redeploy** på den senaste
   deployen (så att den nya miljövariabeln börjar användas).
5. Klart! Nu skapas tabellen `waitlist_entries` automatiskt första gången
   någon skickar in ett svar. Vill du se svaren: **Storage → din databas →
   Query**, kör t.ex.:
   ```sql
   select * from waitlist_entries order by created_at desc;
   ```

### 3. Koppla er egen domän (t.ex. collaktiv.se)

1. I Vercel-projektet: **Settings → Domains**.
2. Skriv in domänen ni äger (eller köp en direkt i samma vy om ni inte har
   någon än) och klicka **Add**.
3. Vercel visar en eller två DNS-poster ni ska lägga till hos er
   domänleverantör (t.ex. Loopia, One.com, GoDaddy):
   - En **A-post** som pekar `@` mot en IP-adress Vercel ger er, **eller**
   - En **CNAME-post** som pekar t.ex. `www` mot `cname.vercel-dns.com`.
4. Logga in hos domänleverantören, hitta DNS-inställningarna för
   domänen, och lägg till posterna exakt som Vercel visar.
5. Det kan ta allt från några minuter till någon timme innan det slår
   igenom. Vercel visar en grön bock i Domains-fliken när allt fungerar,
   och fixar automatiskt HTTPS (hänglåset) åt er.

Efter detta pushar ni bara ändringar till `main` som vanligt – Vercel
bygger och publicerar automatiskt varje gång.

## Adminsida – se alla svar

Gå till `/admin` på sidan (t.ex. `https://v-ntelista.vercel.app/admin`) för
att logga in och se alla anmälningar i en lista, med e-post, gissning,
rabattsvar och det frivilliga fritextsvaret.

- **Facit**: fyll i det rätta antalet bussbiljetter i fältet högst upp när
  ni vet svaret, så sorteras listan automatiskt efter vem som gissat
  närmast (🥇/🥈 för de två som vinner pris).
- **Sök**: filtrera på e-postadress.
- **Exportera CSV**: laddar ner alla anmälningar som en Excel-vänlig fil.

**Inget att ställa in i Vercel för inloggningen.** Första gången någon
öppnar `/admin` finns inget konto än, så sidan visar "Skapa admin-konto"
istället för en inloggningsruta – fyll i den e-post och det lösenord ni
vill logga in med direkt där, så är ni inloggade på en gång. Kontot
sparas i samma databas som väntelistans svar (se avsnittet ovan om att
koppla på en databas – utan den fungerar inloggningen bara tillfälligt,
av samma anledning som anmälningarna annars försvinner).

Vill ni byta e-post eller lösenord senare: **Kontoinställningar**-knappen
uppe i adminsidan, ingen Vercel-inblandning där heller.

## Struktur

- `src/app/page.tsx` – väntelistan/tävlingen (en sida)
- `src/app/admin` – skyddad sida för att se alla anmälningar
- `src/app/api/vantelista/route.ts` – tar emot och validerar anmälningar
- `src/app/api/admin` – konto (skapa/logga in/logga ut/byt uppgifter) och
  att hämta anmälningar
- `src/lib/waitlist-db.ts` – lagring av anmälningar
- `src/lib/admin-db.ts` – lagring av adminkontot
- `src/lib/admin-auth.ts` – lösenordshashning, sessionscookie för `/admin`
- `src/proxy.ts` – skyddar `/admin`-sidorna mot obehörig åtkomst
- `src/lib/types.ts` – datamodell och svarsalternativ
- `src/components/waitlist` – sidans sektioner (frågekort, val, följ-oss m.m.)
- `src/components/ui` – delade UI-komponenter i Collaktivs grafiska profil
