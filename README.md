# EVILBEAR.JPG

Portfólio e Beat Store da EVILBEAR.JPG. A loja mantém o visual do site e inclui catálogo pesquisável, filtros, páginas de beat, prévias, licenças, carrinho persistente e checkout seguro.

## Stack e estrutura

- Vinext + React + Vite para as páginas.
- CSS global e Framer Motion para o visual e animações.
- Netlify Functions para o checkout e o webhook de pagamento.
- Netlify Blobs para pedidos e status de pagamento persistentes.
- Mercado Pago Checkout Pro criado no servidor; o navegador nunca recebe o Access Token.

Os beats de desenvolvimento ficam em `lib/beat-catalog.ts`. Eles são fáceis de trocar por uma fonte de dados administrativa no futuro sem mudar o catálogo, carrinho ou checkout.

## Desenvolvimento e validação

    npm install
    npm run dev
    npm run build
    npm test
    npm run lint
    npm run security:audit

## Variáveis de ambiente

Copie `.env.example` para `.env.local` no desenvolvimento. Nunca envie esse arquivo ao Git.

| Variável | Uso |
| --- | --- |
| `MERCADO_PAGO_ACCESS_TOKEN` | Access Token privado do Checkout Pro. Apenas servidor. |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Chave secreta para validar `x-signature` do webhook. Apenas servidor. |
| `PUBLIC_SITE_URL` | URL HTTPS pública do site, sem barra no fim. |
| `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` | Opcional para uma futura migração ao Checkout Bricks; não é usada pelo Checkout Pro. |

No ambiente hospedado, defina os segredos no painel do provedor. Não use `NEXT_PUBLIC_` para valores privados.

## Configurar banco, armazenamento e Mercado Pago

1. No Netlify, habilite o armazenamento **Blobs** do projeto. Os pedidos são gravados no store privado `evilbear-orders`.
2. Crie uma aplicação no [Mercado Pago Developers](https://www.mercadopago.com.br/developers/pt/reference/online-payments/checkout-pro-preferences/overview) e registre `MERCADO_PAGO_ACCESS_TOKEN` e `MERCADO_PAGO_WEBHOOK_SECRET` como segredos de **Functions** no Netlify.
3. Em **Suas integrações → Webhooks**, habilite o evento **Pagamentos** e use a URL HTTPS `https://evilbear-jpg.netlify.app/api/webhooks/mercadopago`. A aplicação também envia essa URL em cada preferência de Checkout Pro. O Mercado Pago exige uma URL HTTPS e assina as notificações com HMAC. [Documentação oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications)
4. Faça uma compra em modo de teste. O pedido deve continuar `pending` até o webhook consultar o pagamento no Mercado Pago e atualizar o status para `approved`. O redirecionamento para `/checkout/success` nunca libera a compra somente pelo redirecionamento.

## Adicionar beats e prévias

1. Adicione ou edite um item em `lib/beat-catalog.ts`: slug, título, BPM, tonalidade, duração, gênero, tags, capa e licenças.
2. Coloque somente a prévia MP3 em `public/audio/`, por exemplo `enemies-preview.mp3`, e informe `previewUrl: "/audio/enemies-preview.mp3"` no beat.
3. Mantenha WAV, STEMS e ZIPs finais fora de `public/`. A entrega digital deve ser liberada somente após o pagamento `approved` e por um canal privado.

Cada pedido recebe um número não previsível e só expõe ao comprador o status e o total do pagamento; dados pessoais e credenciais não chegam ao navegador.

## Pagamento, pedidos e notificações

O endpoint `/api/checkout` ignora valores enviados pelo navegador: ele procura o beat e a licença no catálogo do servidor, recalcula o total e só então cria a preferência do Mercado Pago. O webhook valida a assinatura HMAC, consulta a API de pagamentos antes de atualizar o status e apenas então registra o pedido como `approved`.

O esquema inclui desconto por item para promoções futuras como “compre 2 e leve 3”, sem alterar pedidos já criados.
