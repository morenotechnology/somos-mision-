import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('a profile photo follows its author into previous comments and replies; referrals pay the inviter', async () => {
  const vite = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { createMockApi } = await vite.ssrLoadModule('/src/api/mockAdapter.js');
    const { default: Threads } = await vite.ssrLoadModule('/src/components/content/CommentThreads.jsx');
    const api = createMockApi();
    const member = (await api.auth.login({email:'carlos@misiones.org'})).user;
    const root = await api.social.agregarComentario('5555','Saludos');
    await api.social.agregarComentario('5555','Una respuesta',root.id);
    const photo = await api.perfiles.uploadPhoto(member.id,new Blob(['test'],{type:'image/jpeg'}));
    const comments = await api.social.comentarios({publication_id:'5555'});
    const html = renderToStaticMarkup(createElement(Threads,{comments,currentUser:member}));
    assert.equal(html.split(photo).length - 1,2);
    const {code} = await api.perfiles.referral();
    await api.auth.logout();
    const registration = {name:'Prueba',email:'new@example.invalid',referralCode:code};
    await api.auth.register(registration);
    await assert.rejects(api.auth.register(registration));
    const updated = (await api.auth.login({email:member.email})).user;
    assert.equal(updated.xp,member.xp + 400);
    assert.deepEqual(await api.perfiles.referral(),{code,confirmed:1});
  } finally { await vite.close(); }
});
