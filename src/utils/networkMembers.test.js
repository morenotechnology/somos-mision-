import test from 'node:test';
import assert from 'node:assert/strict';
import { directoryGroups, directoryGroup, invitationUrl } from './communityDirectory.js';
import { referralCode, referralLink } from './referral.js';
import { prepareMemberPhoto } from './memberPhoto.js';

test('opens a draft for the exact mobile, keeping the invite inside the encoded message', () => {
  const community = 'https://chat.whatsapp.com/test?s=hd&p=i';
  const member = { name: 'José & María', phone: '(300) 000-1234' };
  const draft = new URL(invitationUrl(member, community));
  assert.equal(draft.origin + draft.pathname, 'https://wa.me/573000001234');
  assert.equal(draft.searchParams.size, 1);
  assert.ok(draft.searchParams.get('text').includes('José!'));
  assert.ok(draft.searchParams.get('text').endsWith(community));
  for (const phone of ['+1 (212) 555 0100', '0012125550100']) assert.equal(new URL(invitationUrl({phone})).pathname, '/12125550100');
  for (const phone of ['', 'Sin registrar', '3e00000555', '1234', '1112223333']) assert.equal(invitationUrl({phone}), null);
});
test('each member belongs to exactly one group; distinguishes churches in different districts', () => {
  const users = [
    {congregation:'Belén',district:'d1',districtName:'Distrito 1',regionName:'Andina'},
    {congregation:' belen ',district:'d1',districtName:'Distrito 1',regionName:'Andina'},
    {congregation:'Belén',district:'d2',districtName:'Distrito 2',regionName:'Andina'},
    {congregation:'Sin congregación',districtName:'Sin distrito',regionName:'Sin región'},
  ];
  for (const dimension of ['congregation','district','region']) {
    const groups = directoryGroups(users, dimension);
    assert.equal(groups.reduce((n,g) => n + g.count,0), users.length);
    assert.equal(groups.find(g => g.key === 'missing').count,1);
    for (const group of groups) assert.equal(group.count,users.filter(u => directoryGroup(u,dimension).key === group.key).length);
  }
  assert.deepEqual(directoryGroups(users,'congregation').map(g=>g.count),[2,1,1]);
});
test('registration links use opaque codes and invalid tokens do not obstruct normal signup', () => {
  const code = '12345678-aaaa-bbbb-cccc-123456789012';
  assert.equal(referralCode(code.toUpperCase()), code);
  assert.equal(referralLink('https://example.org',code), 'https://example.org/register?ref='+ code);
  for (const value of ['',null,'user@example.org','../admin']) assert.equal(referralLink('https://example.org',value),'');
});
test('refuses oversized files and non-raster formats before decoding', async () => {
  for (const file of [{type:'image/svg+xml',size:10},{type:'image/png',size:9*1024*1024},{type:'image/jpeg',size:0}])
    await assert.rejects(prepareMemberPhoto(file), /8 MB/);
});
