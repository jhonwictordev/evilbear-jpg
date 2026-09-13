# Prévias da Beat Store

Envie aqui somente as prévias em MP3. Nunca coloque WAV, STEMS ou arquivos finais nesta pasta pública.

Use um arquivo por beat com o mesmo `slug` do catálogo, por exemplo:

- `enemies-preview.mp3`
- `no-signal-preview.mp3`

Depois, preencha `previewUrl` no item correspondente em `lib/beat-catalog.ts` com `/audio/nome-do-arquivo.mp3`.

Os arquivos licenciados ficam no armazenamento privado `BEAT_FILES`, no caminho `deliveries/<beat_id>/<license_id>.zip`, e só são entregues por download temporário após a confirmação do pagamento.
