# 01: Socle : stockage JSON et test de l'API

**What to build:** les données du Foyer vivent dans un fichier JSON côté serveur (voir `docs/adr/0001-server-json-file-storage.md`). Le fichier est lu et écrit de façon atomique (fichier temporaire puis renommage), à un chemin configurable. Un fichier absent se lit comme des données vides. L'app est une coquille en français, mobile d'abord, avec une navigation entre Planning et Courses. Un script `npm run dev:lan` lance le serveur sur le réseau local et affiche l'URL à ouvrir sur le téléphone. Un framework de test léger est en place avec un premier test d'un handler de l'API sur un fichier temporaire.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Lire le guide Next.js dans `node_modules/next/dist/docs/` avant de coder (voir `AGENTS.md`)
- [x] Le fichier de données est ignoré par git
- [x] Fichier absent = données vides, sans erreur
- [x] L'écriture est atomique : un plantage ne laisse pas de fichier tronqué
- [x] Le chemin du fichier est configurable, et les tests utilisent un fichier temporaire
- [x] Un test d'un handler de l'API passe (`npm test`)
- [ ] `npm run dev:lan` affiche l'URL du PC sur le réseau local et l'app s'ouvre depuis le téléphone
- [ ] Interface en français avec navigation Planning / Courses, lisible sur mobile
