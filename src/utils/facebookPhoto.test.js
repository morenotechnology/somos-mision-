import test from 'node:test';
import assert from 'node:assert/strict';
import {extractFacebookPhoto,resolveFacebookPhoto} from './facebookPhoto.js';
import {isCroppedSocialImage,isSocialCdnImage,socialCoverUrl} from './socialImages.js';
import {loadSocialCover} from '../../api/social-cover.js';

const original='https://www.facebook.com/photo/?fbid=1556432629843731';
const image='https://scontent.xx.fbcdn.net/photo.jpg?stp=dst-jpg_p403x403_tt6';
const attachment=`<a href="${original}"><img class="_1p6f _1p6g img" width="398" height="498" src="${image}" /></a>`;
test('Facebook photo covers retain the full attachment, not avatars or square crops',()=>{
  const result=extractFacebookPhoto(attachment,original);
  assert.equal(result.imageUrl,image);
  assert.equal(result.imageHeight,498);
  assert.equal(extractFacebookPhoto(attachment.replace('stp=dst-jpg_p403x403_tt6','stp=c216.0.648.648a_dst-jpg'),original),null);
  assert.equal(extractFacebookPhoto(attachment.replace('_1p6f _1p6g','profile-avatar'),original),null);
  assert.equal(extractFacebookPhoto(attachment.replace('href="'+original+'"','href="https://www.facebook.com/photo/?fbid=999"'),original),null);
});
test('shared photo redirects stay on the original platform and never follow login or internal hosts',async()=>{
  const shared='https://www.facebook.com/share/p/Example/';
  const requests=[];
  const result=await resolveFacebookPhoto(shared,async url=>{
    requests.push(url);
    if(requests.length===1)return {ok:false,headers:{get:()=>original}};
    return {ok:true,headers:{get:()=>null},text:async()=>attachment};
  });
  assert.equal(result.inputUrl,shared);
  assert.equal(result.imageUrl,image);
  const blocked=[];
  assert.equal(await resolveFacebookPhoto(shared,async url=>{blocked.push(url);return {headers:{get:()=> 'http://127.0.0.1/private'}};}),null);
  assert.equal(blocked.length,1);
});
test('only safe social image resources can use the stable cover endpoint',()=>{
  assert.equal(isSocialCdnImage(image),true);
  assert.equal(isSocialCdnImage('https://scontent.cdninstagram.com/v/photo.jpg'),true);
  for(const url of ['http://scontent.xx.fbcdn.net/a.jpg','https://fbcdn.net.evil.example/a.jpg','https://user:pass@scontent.xx.fbcdn.net/a.jpg','https://scontent.xx.fbcdn.net:8443/a.jpg'])assert.equal(isSocialCdnImage(url),false);
  assert.equal(isCroppedSocialImage('https://scontent.cdninstagram.com/a.jpg?stp=c230.0.691.691a_dst-jpg'),true);
  assert.equal(isCroppedSocialImage(image),false);
  assert.match(socialCoverUrl(original),/^\/api\/social-cover\?url=/);
  assert.equal(socialCoverUrl('http://127.0.0.1/private'),'');
});
test('cover proxy returns validated image bytes and refuses cropped, unsafe, HTML or oversized responses',async()=>{
  const bytes=new Uint8Array([255,216,255,217]);
  const resolver=async()=>({imageUrl:image});
  const result=await loadSocialCover(original,{previewResolver:resolver,fetcher:async()=>new Response(bytes,{headers:{'Content-Type':'image/jpeg'}})});
  assert.equal(result.type,'image/jpeg');
  assert.deepEqual(result.bytes,Buffer.from(bytes));
  for(const imageUrl of ['https://private.example/file.jpg','https://scontent.xx.fbcdn.net/photo.jpg?stp=c100.0.500.500a']){
    let calls=0;
    await assert.rejects(loadSocialCover(original,{previewResolver:async()=>({imageUrl}),fetcher:async()=>{calls++;}}));
    assert.equal(calls,0);
  }
  for(const headers of [{'Content-Type':'text/html'},{'Content-Type':'image/svg+xml'},{'Content-Type':'image/jpeg','Content-Length':'9000000'}]){
    await assert.rejects(loadSocialCover(original,{previewResolver:resolver,fetcher:async()=>new Response(bytes,{headers})}));
  }
});
