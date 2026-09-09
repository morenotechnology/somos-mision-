export const parentCommentId = (comment) => String(comment.parentCommentId || comment.parent_comment_id || '');

// Recent replies can point outside their page. Context rows must not advance its cursor.
export async function completeCommentAncestry(rows, loadParents) {
  const byId = new Map(rows.map((row) => [String(row.id), row]));
  const requested = new Set();
  while (true) {
    const missing = [...new Set([...byId.values()].map(parentCommentId))]
      .filter((id) => id && !byId.has(id) && !requested.has(id));
    if (!missing.length) break;
    missing.forEach((id) => requested.add(id));
    const parents = await loadParents(missing);
    parents.forEach((parent) => { if (!byId.has(String(parent.id))) byId.set(String(parent.id), { ...parent, contextOnly: true }); });
  }
  return [...byId.values()];
}

export function buildCommentThreads(comments) {
  const byId = new Map(comments.map((comment) => [String(comment.id), comment]));
  const threads = new Map();
  comments.forEach((comment) => {
    let root = comment;
    const seen = new Set([String(comment.id)]);
    while (byId.has(parentCommentId(root)) && !seen.has(parentCommentId(root))) {
      seen.add(parentCommentId(root));
      root = byId.get(parentCommentId(root));
    }
    const key = String(root.id);
    if (!threads.has(key)) threads.set(key, { root, replies: [] });
    if (String(comment.id) !== key) threads.get(key).replies.push(comment);
  });
  return [...threads.values()].sort((a, b) => new Date(b.root.createdAt || 0) - new Date(a.root.createdAt || 0))
    .map((thread) => ({ ...thread, replies: thread.replies.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)) }));
}

export function commentDescendants(comments, id) {
  const ids = new Set([String(id)]);
  let changed = true;
  while (changed) {
    changed = false;
    comments.forEach((comment) => {
      if (ids.has(parentCommentId(comment)) && !ids.has(String(comment.id))) {
        ids.add(String(comment.id)); changed = true;
      }
    });
  }
  return ids;
}
