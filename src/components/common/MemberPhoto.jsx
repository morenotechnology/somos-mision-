import { useState } from 'react';

export default function MemberPhoto({ src, initials }) {
  const [failed, setFailed] = useState('');
  return src && src !== failed
    ? <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(src)} style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
    : initials;
}
