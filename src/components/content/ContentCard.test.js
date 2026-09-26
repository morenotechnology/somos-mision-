import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('misclassified reels render a player and direct files retain native controls', async () => {
  const previous = process.env.VITE_API_MODE;
  const previousWindow = globalThis.window;
  process.env.VITE_API_MODE = 'mock';
  const server = await createServer({logLevel:'silent',server:{middlewareMode:true},appType:'custom'});
  try {
    const {default: ContentCard} = await server.ssrLoadModule('/src/components/content/ContentCard.jsx');
    globalThis.window = { location: { origin: 'https://www.somosmisioncolombia.com' } };
    const base = {id:'test',title:'Video de prueba',format:'imagen',createdAt:'2026-09-25',imageUrl:'https://cdn.example/cover.jpg'};
    const reel = renderToStaticMarkup(createElement(ContentCard,{socialFeed:true,item:{...base,sourceUrl:'https://web.facebook.com/reel/123/'}}));
    assert.match(reel,/Reproducir video: Video de prueba/);
    const native = renderToStaticMarkup(createElement(ContentCard,{socialFeed:true,item:{...base,imageUrl:'/media/somos-mision-bienvenida.mp4'}}));
    assert.match(native, /<video[^>]*controls=""/);
    assert.doesNotMatch(native, /social-video-buttons/);
  } finally {
    await server.close();
    if(previous === undefined) delete process.env.VITE_API_MODE; else process.env.VITE_API_MODE = previous;
    if(previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  }
});
