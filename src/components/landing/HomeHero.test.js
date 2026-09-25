import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('home starts with one non-looping video and an accessible welcome slide; national posts reuse the header logo', async () => {
  const previousMode = process.env.VITE_API_MODE;
  process.env.VITE_API_MODE = 'mock';
  const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: HomeHero } = await server.ssrLoadModule('/src/components/landing/HomeHero.jsx');
    const html = renderToStaticMarkup(createElement(HomeHero));
    assert.equal((html.match(/<video\b/g) || []).length, 1);
    assert.doesNotMatch(html, /<video[^>]*\bloop[=\s>]/);
    assert.match(html, /aria-label="1 de 2: video de bienvenida" aria-hidden="false"/);
    assert.match(html, /aria-label="2 de 2: bienvenida a los 5.000 Amigos" aria-hidden="true" inert=""/);
    assert.match(html, /red-amigos-mobile\.jpg/);
    const message = 'Ser parte de la red de los 5000 es convertirse en un multiplicador virtual de misiones nacionales';
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    const firstSlide = html.split('aria-label="1 de 2: video de bienvenida"')[1].split('aria-label="2 de 2: bienvenida a los 5.000 Amigos"')[0];
    assert.doesNotMatch(firstSlide, /<h[12]|Unirme a la red|Iniciar sesión|Ser parte de/);
    for (const heading of html.matchAll(/<h[12][^>]*>(.*?)<\/h[12]>/g)) assert.equal(heading[1].replace(/<[^>]*>/g, ''), message);
    assert.doesNotMatch(html, /La misión|Hay un lugar para ti|Una invitación para ti|Tu voz también|Una misma misión|mission-film-credit/);
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
  } finally {
    await server.close();
    if (previousMode === undefined) delete process.env.VITE_API_MODE;
    else process.env.VITE_API_MODE = previousMode;
  }
});
