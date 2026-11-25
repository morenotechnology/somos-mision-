import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('the admin UI keeps sharing, payment and manual sending separate', async () => {
  const vite = await createServer({logLevel:'silent',server:{middlewareMode:true},appType:'custom'});
  try {
    const {ReferralReport,OutreachControl} = await vite.ssrLoadModule('/src/components/admin/NetworkFollowup.jsx');
    const directory = new Map([['a',{name:'Ana',role:'admin',active:true}],['b',{name:'Bea'}]]);
    const referral = {inviter_id:'a',invitee_id:'b',first_shared_at:'2026-11-01T10:00:00Z'};
    const report = rows => renderToStaticMarkup(createElement(ReferralReport,{directory,data:{rows}}));
    assert.match(report([referral]), /Ana.*Bea.*Registrado.*Pendiente/);
    assert.doesNotMatch(report([referral]), /<strong[^>]*>400 XP acreditados/);
    assert.match(report([{...referral,credited_at:'2026-11-01T10:00:00Z'}]), /<strong[^>]*>400 XP acreditados/);
    const control = (row,actor,ready=true) => renderToStaticMarkup(createElement(OutreachControl,{row,actor,ready,directory,user:{id:'b',invitation:'https://wa.me/573000000000'}}));
    const opened = {opened_by:'a',opened_at:referral.first_shared_at};
    assert.match(control(opened,'a'), /Continuar chat.*Marcar enviado/);
    assert.doesNotMatch(control(opened,'another'), /<button/);
    assert.doesNotMatch(control({...opened,sent_at:opened.opened_at},'a'), /<button/);
    assert.doesNotMatch(control(null,'a',false), /<button/);
    const {createMockApi} = await vite.ssrLoadModule('/src/api/mockAdapter.js');
    const api=createMockApi();
    const admin=(await api.auth.login({email:'admin@misiones.org'})).user;
    assert.equal((await api.admin.whatsapp('b','open')).may_open,true);
    assert.equal((await api.admin.whatsapp('b','open')).may_open,false);
    await api.admin.whatsapp('b','sent');
    const [saved]=await api.admin.followup('contacts');
    assert.ok(saved.sent_at && saved.opened_by===admin.id);
    assert.equal((await api.admin.whatsapp('b','resume')).may_open,false);
    await api.auth.login({email:'carlos@misiones.org'});
    await assert.rejects(async()=>api.admin.followup('referrals'));
  } finally { await vite.close(); }
});
