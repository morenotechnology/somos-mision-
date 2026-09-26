// Exact originals recovered during the editorial audit, not generated placeholders.
// Keep these as a fallback for posts whose public metadata endpoint requires login.
const archive = [
  ['la-mision-nos-une.jpg', ['/share/p/19VvPvJSSk/', '/ipucmisionesnacionales/posts/pfbid02pU3d3tu38rCUN5k1h9EjcaQTKKg63AbPt3MqXVqtWr7e7f2orqb7RzaYUU9gcvDql']],
  ['cali.jpg', ['/share/p/18J2vPntVD/', '/ipucmisionesnacionales/posts/pfbid0i217rDUCjwozyqJjb6FbRJEjWSBz5PCMCpncaW2BRSW2mtMVWLXtzn1mrH933z8Tl']],
  ['orinoquia.jpg', ['/share/p/184moewxWH/', '/ipucmisionesnacionales/posts/pfbid025TuUZNG72puhn5WPc6XuyshmtknJUk8sZ5zxPwKE2p4hpUakmt8SbdN3kZydyv6wl']],
];
export function archivedPublicationCover(value = '') {
  try {
    const url = new URL(value);
    if (!['facebook.com','www.facebook.com','web.facebook.com','m.facebook.com'].includes(url.hostname)) return '';
    const match = archive.find(([,paths]) => paths.some(path => path.replace(/\/$/,'') === url.pathname.replace(/\/$/,'')));
    return match ? `/media/publication-covers/${match[0]}` : '';
  } catch { return ''; }
}
