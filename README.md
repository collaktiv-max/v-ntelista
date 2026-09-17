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
valideras på servern och sparas i `data/waitlist.json` via
`src/lib/waitlist-db.ts` – en enkel fil-baserad "databas" så att alla
anmälningar samlas på ett ställe (inte bara i besökarens egen webbläsare).

Filen skapas automatiskt vid första anmälan och committas aldrig (se
`.gitignore`), eftersom den innehåller riktiga svar från besökare.

Obs: på en serverless-driftsättning (t.ex. Vercel) är filsystemet
skrivskyddat/tillfälligt mellan anrop. Kör då `next start` på en vanlig
server, eller byt ut `src/lib/waitlist-db.ts` mot en riktig databas
(t.ex. Postgres/Supabase) – funktionssignaturerna (`addWaitlistEntry`) är
skrivna så att det går att göra utan att ändra `route.ts`.

## Struktur

- `src/app/page.tsx` – väntelistan/tävlingen (en sida)
- `src/app/api/vantelista/route.ts` – tar emot och validerar anmälningar
- `src/lib/waitlist-db.ts` – lagring av anmälningar
- `src/lib/types.ts` – datamodell och svarsalternativ
- `src/components/waitlist` – sidans sektioner (frågekort, val, följ-oss m.m.)
- `src/components/ui` – delade UI-komponenter i Collaktivs grafiska profil
