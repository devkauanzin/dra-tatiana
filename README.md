# Landing page · Dra. Tatiana Tomich — Dermatologia e Laser

Site estático (HTML, CSS e JavaScript puros, sem dependências de build).

## Estrutura

- `index.html` — landing page
- `politica-de-privacidade.html`, `404.html` — páginas auxiliares
- `css/styles.css` — estilos; cores, fontes e espaçamentos em variáveis no `:root`
- `js/config.js` — **WhatsApp, Instagram, links de mapa, e-mail, CRM e RQE** (edite aqui)
- `js/main.js` — menu móvel, animações, formulário de pré-agendamento → WhatsApp
- `assets/` — fotos otimizadas e monograma do logotipo

## Rodar localmente

```bash
npx http-server@14.1.1 . -p 5173
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie todos os arquivos desta pasta (o `index.html` precisa ficar na raiz).
2. No repositório, vá em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
3. Em alguns minutos o site fica disponível em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

A página `404.html` usa caminhos absolutos (`/css`, `/assets`) e só fica com o visual correto em domínio próprio ou em repositório `SEU-USUARIO.github.io`.

## Antes de publicar

1. Preencher `crm` e `rqe` em `js/config.js` (exigência da Resolução CFM nº 2.336/2023).
2. Trocar os caminhos de `og:image` e do JSON-LD pela URL absoluta do domínio.
3. Substituir `assets/monograma.png` pelo arquivo original do logotipo (SVG ou PNG em alta), se disponível.
4. Revisar a política de privacidade com o jurídico.
