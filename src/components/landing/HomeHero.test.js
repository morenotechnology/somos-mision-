import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('campaign follows the approved reference, preserves real video and exposes three accessible slides', async () => {
  const previousMode = process.env.VITE_API_MODE;
  process.env.VITE_API_MODE = 'mock';
  const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: HomeHero } = await server.ssrLoadModule('/src/components/landing/HomeHero.jsx');
    const html = renderToStaticMarkup(createElement(HomeHero));
    assert.equal((html.match(/<video\b/g) || []).length, 1);
    assert.doesNotMatch(html, /<video[^>]*\bloop[=\s>]/);
    assert.match(html, /aria-label="1 de 3: video de bienvenida" aria-hidden="false"/);
    assert.match(html, /aria-label="2 de 3: nuestra red" aria-hidden="true" inert=""/);
    assert.match(html, /aria-label="3 de 3: comunidad WhatsApp" aria-hidden="true" inert=""/);
    assert.match(html, /campaign-5000\/welcome-film\.jpg/);
    assert.match(html, /somos-mision-bienvenida\.mp4/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /<h1 id="home-title">5000 AMIGOS<\/h1>/);
    assert.match(html, /Súmate a la obra\. Juntos podemos llevar/);
    assert.match(html, /Unirme ahora/);
    assert.match(html, /Iniciar sesión/);
    assert.doesNotMatch(html, /Ver más/);
    assert.match(html, /Reproducir invitación con sonido/);
    assert.match(html, /Ver video en pantalla completa/);
    assert.match(html, /Progreso del video de bienvenida/);
    assert.doesNotMatch(html, /<video[^>]*\bautoPlay|314|259/);
    assert.doesNotMatch(html, /mission-map|colombia-red-dorada|amigos-home|logosinfondo|brand-logo/);

    const { default: BrandLogo } = await server.ssrLoadModule('/src/components/common/BrandLogo.jsx');
    const { default: SocialPost } = await server.ssrLoadModule('/src/components/content/SocialPost.jsx');
    const brandSource = renderToStaticMarkup(createElement(BrandLogo)).match(/<img[^>]+src="([^"]+)"/)[1];
    const nationalPost = renderToStaticMarkup(createElement(SocialPost, {
      item: { id: 'local-test', title: 'Noticia nacional', coordinationName: 'Misiones Nacionales', createdAt: '2026-09-23' },
      commentsCount: 0, originalLinks: [],
    }));
    assert.ok(nationalPost.includes(`src="${brandSource}"`));
    assert.doesNotMatch(nationalPost, /isologo-somos-mision\.svg/);

    const { default: CampaignHeader } = await server.ssrLoadModule('/src/components/landing/CampaignHeader.jsx');
    const header = renderToStaticMarkup(createElement(CampaignHeader));
    assert.match(header, /aria-label="Abrir menú"/);
    assert.match(header, /id="campaign-menu"[^>]*hidden=""/);
    assert.match(header, /Iniciar sesión/);
    assert.match(header, /Comunidad WhatsApp/);
    assert.equal((header.match(/<img\b/g) || []).length, 1);
  } finally {
    await server.close();
    if (previousMode === undefined) delete process.env.VITE_API_MODE;
    else process.env.VITE_API_MODE = previousMode;
  }
});
