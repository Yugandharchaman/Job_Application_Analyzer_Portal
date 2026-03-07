import { useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
//  SUPABASE FULL INTEGRATION CODE
// ═══════════════════════════════════════════════════════════════
/*
─────────────────────────────────────────
  1. INSTALL
─────────────────────────────────────────
  npm install @supabase/supabase-js

─────────────────────────────────────────
  2. SUPABASE CLIENT  (lib/supabase.js)
─────────────────────────────────────────
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(
    'https://YOUR_PROJECT_URL.supabase.co',
    'YOUR_ANON_KEY'
  )

─────────────────────────────────────────
  3. SQL SCHEMA  (run in Supabase SQL Editor)
─────────────────────────────────────────
  -- PROFILES (auto-created on signup)
  create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    avatar_url text,
    created_at timestamptz default now()
  );

  -- POSTS
  create table posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete cascade not null,
    caption text,
    media_url text,
    media_type text,          -- 'image' | 'video' | 'pdf' | 'text'
    file_name text,
    created_at timestamptz default now()
  );

  -- LIKES  (unique per user per post)
  create table likes (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references posts(id) on delete cascade not null,
    user_id uuid references profiles(id) on delete cascade not null,
    created_at timestamptz default now(),
    unique(post_id, user_id)
  );

  -- COMMENTS
  create table comments (
    id uuid primary key default gen_random_uuid(),
    post_id uuid references posts(id) on delete cascade not null,
    user_id uuid references profiles(id) on delete cascade not null,
    text text not null,
    created_at timestamptz default now()
  );

─────────────────────────────────────────
  4. STORAGE BUCKET  (run in Supabase SQL Editor)
─────────────────────────────────────────
  -- Create public bucket
  insert into storage.buckets (id, name, public)
  values ('post-media', 'post-media', true);

  -- Allow authenticated users to upload
  create policy "Auth users can upload"
  on storage.objects for insert
  with check (bucket_id = 'post-media' and auth.role() = 'authenticated');

  -- Public read for everyone
  create policy "Public read"
  on storage.objects for select
  using (bucket_id = 'post-media');

  -- Users can delete their own files
  create policy "Owner delete"
  on storage.objects for delete
  using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);

─────────────────────────────────────────
  5. RLS POLICIES
─────────────────────────────────────────
  alter table posts    enable row level security;
  alter table likes    enable row level security;
  alter table comments enable row level security;
  alter table profiles enable row level security;

  -- Posts: public read, auth insert, owner update/delete
  create policy "Public read posts"    on posts for select using (true);
  create policy "Auth insert posts"    on posts for insert with check (auth.uid() = user_id);
  create policy "Owner delete posts"   on posts for delete using (auth.uid() = user_id);

  -- Likes
  create policy "Public read likes"    on likes for select using (true);
  create policy "Auth toggle likes"    on likes for insert with check (auth.uid() = user_id);
  create policy "Owner delete likes"   on likes for delete using (auth.uid() = user_id);

  -- Comments
  create policy "Public read comments" on comments for select using (true);
  create policy "Auth add comments"    on comments for insert with check (auth.uid() = user_id);
  create policy "Owner del comments"   on comments for delete using (auth.uid() = user_id);

  -- Profiles
  create policy "Public read profiles" on profiles for select using (true);
  create policy "Owner update profile" on profiles for update using (auth.uid() = id);

─────────────────────────────────────────
  6. FUNCTIONS TO USE IN YOUR APP
─────────────────────────────────────────

  // Upload file → returns public URL
  export async function uploadMedia(file, userId) {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('post-media').getPublicUrl(data.path)
    return publicUrl
  }

  // Create post
  export async function createPost({ userId, caption, mediaUrl, mediaType, fileName }) {
    const { data, error } = await supabase.from('posts')
      .insert([{ user_id: userId, caption, media_url: mediaUrl, media_type: mediaType, file_name: fileName }])
      .select('*, profiles(*)')
    if (error) throw error
    return data[0]
  }

  // Fetch all posts with author + like count + comment count
  export async function fetchPosts() {
    const { data, error } = await supabase.from('posts')
      .select('*, profiles(*), likes(count), comments(count)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  // Toggle like
  export async function toggleLike(postId, userId) {
    const { data: existing } = await supabase.from('likes')
      .select('id').eq('post_id', postId).eq('user_id', userId).single()
    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('likes').insert([{ post_id: postId, user_id: userId }])
      return true
    }
  }

  // Fetch comments for a post
  export async function fetchComments(postId) {
    const { data, error } = await supabase.from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  }

  // Add comment
  export async function addComment(postId, userId, text) {
    const { data, error } = await supabase.from('comments')
      .insert([{ post_id: postId, user_id: userId, text }])
      .select('*, profiles(full_name, avatar_url)')
    if (error) throw error
    return data[0]
  }
*/

// ═══════════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════════
const USERS = [
  { id: "u1", name: "Yugandhar Reddy", initials: "YR", color: "#FF6B35" },
  { id: "u2", name: "Sneha Patel",     initials: "SP", color: "#7C3AED" },
  { id: "u3", name: "Arjun Kumar",     initials: "AK", color: "#059669" },
  { id: "u4", name: "Priya Singh",     initials: "PS", color: "#DC2626" },
];

const MOCK_POSTS = [
  {
    id: "p1", user: USERS[1],
    caption: "Just finished my first full-stack project using React + Supabase. The real-time features are insane! 🚀 Really happy how the UI turned out.",
    mediaUrl: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&h=500&auto=format&fit=crop",
    mediaType: "image", fileName: null,
    timestamp: "2 hours ago", likes: ["u1","u3"], comments: [
      { id: "c1", user: USERS[2], text: "Looks amazing! Great work 🔥", time: "1h ago" },
      { id: "c2", user: USERS[0], text: "Which UI library did you use?", time: "45m ago" },
    ], shares: 8,
  },
  {
    id: "p2", user: USERS[2],
    caption: "📄 Sharing my notes on Data Structures & Algorithms — PDF attached. Hope it helps everyone prepping for interviews!",
    mediaUrl: null, mediaType: "pdf", fileName: "DSA_Notes_Complete.pdf",
    timestamp: "5 hours ago", likes: ["u1","u2","u4"], comments: [
      { id: "c3", user: USERS[3], text: "Thank you so much Arjun! Needed this 🙏", time: "4h ago" },
    ], shares: 24,
  },
  {
    id: "p3", user: USERS[0],
    caption: "Golden hour never disappoints. Sometimes you just need to step away from the screen 🌅",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&h=500&auto=format&fit=crop",
    mediaType: "image", fileName: null,
    timestamp: "1 day ago", likes: ["u2","u3","u4"], comments: [], shares: 15,
  },
];

// ═══════════════════════════════════════════════════════════════
//  CSS
// ═══════════════════════════════════════════════════════════════
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white:   #ffffff;
    --bg:      #f5f4f0;
    --surface: #ffffff;
    --border:  #e8e6e0;
    --border2: #f0ede8;
    --text:    #1a1917;
    --muted:   #8a8680;
    --accent:  #1a1917;
    --red:     #e5484d;
    --blue:    #0070f3;
    --radius:  18px;
    --shadow:  0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-up: 0 -2px 20px rgba(0,0,0,0.06);
    --font:    'Plus Jakarta Sans', sans-serif;
    --serif:   'Instrument Serif', serif;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); }

  /* ── LAYOUT ── */
  .nf-root { min-height: 100vh; background: var(--bg); }

  /* ── TOP NAV ── */
  .nf-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    height: 60px;
    display: flex; align-items: center;
    padding: 0 20px; gap: 12px;
  }
  .nf-nav-logo {
    font-family: var(--serif); font-style: italic;
    font-size: 1.5rem; color: var(--text); letter-spacing: -0.5px; flex: 1;
  }
  .nf-nav-logo span { font-style: normal; font-family: var(--font); font-size: 0.7rem;
    font-weight: 600; color: var(--muted); display: block; letter-spacing: 1.5px;
    text-transform: uppercase; margin-top: -4px; }
  .nf-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border); border-radius: 50px;
    padding: 5px 14px 5px 6px; cursor: pointer; transition: all 0.15s;
  }
  .nf-user-pill:hover { border-color: #ccc; background: #f0ede8; }
  .nf-user-pill select {
    background: transparent; border: none; outline: none;
    font-family: var(--font); font-size: 0.82rem; font-weight: 600; color: var(--text);
    cursor: pointer; max-width: 130px;
  }

  /* ── AVATAR ── */
  .avatar {
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: white; flex-shrink: 0; font-size: 0.75rem;
  }
  .avatar-sm  { width: 32px; height: 32px; font-size: 0.7rem; }
  .avatar-md  { width: 40px; height: 40px; font-size: 0.8rem; }
  .avatar-lg  { width: 48px; height: 48px; font-size: 0.9rem; }

  /* ── COMPOSE CARD ── */
  .compose-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px;
    box-shadow: var(--shadow); margin-bottom: 16px;
    animation: fadeUp 0.4s ease both;
  }
  .compose-top { display: flex; gap: 12px; align-items: flex-start; }
  .compose-input {
    flex: 1; background: var(--bg); border: 1.5px solid var(--border2);
    border-radius: 12px; padding: 12px 14px;
    font-family: var(--font); font-size: 0.92rem; color: var(--text); resize: none;
    outline: none; min-height: 52px; line-height: 1.5; transition: border-color 0.2s;
  }
  .compose-input:focus { border-color: var(--text); }
  .compose-input::placeholder { color: var(--muted); }

  .compose-footer { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border2); }
  .attach-btns { display: flex; gap: 6px; flex: 1; flex-wrap: wrap; }
  .attach-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--bg); color: var(--muted); font-family: var(--font);
    font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
    position: relative; overflow: hidden;
  }
  .attach-btn:hover { border-color: var(--text); color: var(--text); background: var(--border2); }
  .attach-btn input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .attach-btn.active { background: var(--text); color: white; border-color: var(--text); }

  .post-btn {
    padding: 9px 22px; border-radius: 10px; border: none; cursor: pointer;
    background: var(--text); color: white; font-family: var(--font);
    font-size: 0.85rem; font-weight: 700; transition: all 0.2s;
    white-space: nowrap;
  }
  .post-btn:hover { background: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .post-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* ── MEDIA PREVIEW (compose) ── */
  .compose-media-preview {
    margin-top: 12px; border-radius: 12px; overflow: hidden;
    border: 1px solid var(--border); position: relative;
  }
  .compose-media-preview img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
  .compose-media-preview video { width: 100%; max-height: 280px; display: block; }
  .compose-file-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 16px; background: var(--bg);
  }
  .compose-file-chip-icon {
    width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  }
  .remove-media {
    position: absolute; top: 8px; right: 8px;
    width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.55);
    border: none; cursor: pointer; color: white; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center; transition: background 0.15s;
  }
  .remove-media:hover { background: rgba(229,72,77,0.9); }

  /* ── FEED ── */
  .nf-feed { max-width: 600px; margin: 0 auto; padding: 20px 16px 80px; }

  /* ── POST CARD ── */
  .post-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
    box-shadow: var(--shadow); margin-bottom: 16px;
    animation: fadeUp 0.45s ease both;
    transition: box-shadow 0.2s;
  }
  .post-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.06); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── POST HEADER ── */
  .post-header {
    display: flex; align-items: center; gap: 11px;
    padding: 14px 16px 10px;
  }
  .post-author { flex: 1; }
  .post-author-name { font-size: 0.9rem; font-weight: 700; color: var(--text); }
  .post-time { font-size: 0.75rem; color: var(--muted); margin-top: 1px; }
  .post-more { width: 32px; height: 32px; border-radius: 50%; border: none; background: transparent;
    cursor: pointer; color: var(--muted); font-size: 1.1rem; display: flex; align-items: center;
    justify-content: center; transition: background 0.15s; }
  .post-more:hover { background: var(--bg); color: var(--text); }

  /* ── POST CAPTION ── */
  .post-caption {
    padding: 0 16px 12px;
    font-size: 0.9rem; line-height: 1.6; color: var(--text);
  }

  /* ── POST MEDIA ── */
  .post-media-wrap {
    background: #f8f7f4; position: relative; overflow: hidden;
    border-top: 1px solid var(--border2); border-bottom: 1px solid var(--border2);
  }
  .post-media-wrap img {
    width: 100%; display: block; max-height: 480px; object-fit: cover;
    transition: transform 0.4s ease;
  }
  .post-media-wrap:hover img { transform: scale(1.015); }
  .post-media-wrap video { width: 100%; display: block; max-height: 480px; background: #000; }
  .post-pdf-chip {
    display: flex; align-items: center; gap: 14px; padding: 18px 20px;
  }
  .pdf-chip-icon {
    width: 48px; height: 48px; border-radius: 12px;
    background: #fff1f2; border: 1px solid #fecdd3;
    display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0;
  }
  .pdf-chip-name { font-size: 0.88rem; font-weight: 600; color: var(--text); }
  .pdf-chip-sub  { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }
  .pdf-open-btn {
    margin-left: auto; padding: 7px 16px; border-radius: 8px;
    border: 1.5px solid var(--border); background: white; color: var(--text);
    font-family: var(--font); font-size: 0.8rem; font-weight: 700; cursor: pointer;
    transition: all 0.15s;
  }
  .pdf-open-btn:hover { background: var(--text); color: white; }

  /* ── LIKE COUNT STRIP ── */
  .like-strip {
    padding: 8px 16px 0; font-size: 0.82rem; font-weight: 700; color: var(--text);
  }
  .like-strip span { color: var(--muted); font-weight: 400; }

  /* ── ACTION BAR ── */
  .action-bar {
    display: flex; align-items: center;
    padding: 4px 8px 8px; gap: 2px;
    border-bottom: 1px solid var(--border2);
  }
  .act-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 12px; border-radius: 10px; border: none; cursor: pointer;
    background: transparent; color: var(--muted); font-family: var(--font);
    font-size: 0.82rem; font-weight: 600; transition: all 0.15s;
  }
  .act-btn:hover { background: var(--bg); color: var(--text); }
  .act-btn.liked { color: var(--red); }
  .act-btn svg { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
  .act-btn:active svg { transform: scale(1.5); }
  .act-spacer { flex: 1; }

  /* ── HEART ANIMATION ── */
  @keyframes heartBeat {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.6); }
    60%  { transform: scale(0.85); }
    100% { transform: scale(1); }
  }
  .heart-beat svg { animation: heartBeat 0.35s cubic-bezier(0.34,1.56,0.64,1); }

  /* ── COMMENTS ── */
  .comments-wrap {
    padding: 12px 16px 4px;
    animation: expandDown 0.25s ease;
  }
  @keyframes expandDown {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .comment-item { display: flex; gap: 9px; margin-bottom: 10px; }
  .comment-body { flex: 1; }
  .comment-bubble {
    display: inline-block; background: var(--bg); border-radius: 0 12px 12px 12px;
    padding: 8px 13px; max-width: 100%;
  }
  .comment-author { font-size: 0.78rem; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .comment-text   { font-size: 0.85rem; color: var(--text); line-height: 1.5; }
  .comment-time   { font-size: 0.72rem; color: var(--muted); margin-top: 4px; padding-left: 4px; }

  .comment-input-row { display: flex; gap: 8px; align-items: flex-end; padding: 8px 16px 14px; }
  .comment-field {
    flex: 1; background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 22px; padding: 9px 16px; color: var(--text);
    font-family: var(--font); font-size: 0.85rem; outline: none; resize: none;
    min-height: 38px; max-height: 100px; line-height: 1.4; transition: border-color 0.2s;
  }
  .comment-field:focus { border-color: var(--text); }
  .comment-field::placeholder { color: var(--muted); }
  .comment-submit {
    width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
    background: var(--text); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s; color: white;
  }
  .comment-submit:hover { background: #333; transform: scale(1.08); }
  .no-comments { font-size: 0.82rem; color: var(--muted); padding-bottom: 8px; }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: 24px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: var(--text); color: white;
    padding: 11px 22px; border-radius: 50px;
    font-size: 0.85rem; font-weight: 600; z-index: 999;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
    pointer-events: none; opacity: 0; white-space: nowrap;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  }
  .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

  /* ── DIVIDER ── */
  .feed-divider {
    text-align: center; font-size: 0.72rem; font-weight: 700;
    color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px;
    margin: 20px 0 16px; position: relative;
  }
  .feed-divider::before {
    content: ''; position: absolute; left: 0; top: 50%;
    width: 100%; height: 1px; background: var(--border);
  }
  .feed-divider span { background: var(--bg); padding: 0 12px; position: relative; }

  /* ── EMPTY ── */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-state-icon { font-size: 3rem; margin-bottom: 12px; }
  .empty-state h3 { font-family: var(--serif); font-style: italic; font-size: 1.4rem;
    color: var(--text); margin-bottom: 6px; }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .nf-feed { padding: 14px 10px 80px; }
    .compose-footer { flex-wrap: wrap; }
    .attach-btns { order: 2; width: 100%; }
    .post-btn { order: 1; width: 100%; justify-content: center; }
    .nf-nav-logo span { display: none; }
  }
`;

// ═══════════════════════════════════════════════════════════════
//  ICONS
// ═══════════════════════════════════════════════════════════════
const IconHeart = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24"
    fill={filled ? "#e5484d" : "none"}
    stroke={filled ? "#e5484d" : "currentColor"}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconComment = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconShare = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconImage = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconVideo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const IconPDF = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════
//  AVATAR COMPONENT
// ═══════════════════════════════════════════════════════════════
function Avatar({ user, size = "md" }) {
  return (
    <div className={`avatar avatar-${size}`} style={{ background: user.color }}>
      {user.initials}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function NewsFeed() {
  const [currentUser, setCurrentUser] = useState(USERS[0]);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [likedPosts, setLikedPosts] = useState(new Set(["p3"]));
  const [openComments, setOpenComments] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [heartAnim, setHeartAnim] = useState(new Set());
  const [toast, setToast] = useState({ show: false, msg: "" });

  // Compose state
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null); // { url, type, name }
  const [posting, setPosting] = useState(false);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2400);
  };

  // ── Handle file attach
  const handleFile = (file, declaredType) => {
    if (!file) return;
    let type = declaredType;
    if (!type) {
      type = file.type.startsWith("video") ? "video"
           : file.type === "application/pdf" ? "pdf"
           : file.type.startsWith("image") ? "image" : "file";
    }
    const url = (type === "image" || type === "video") ? URL.createObjectURL(file) : null;
    setMedia({ url, type, name: file.name, file });
  };

  // ── Submit post
  const handlePost = () => {
    if (!caption.trim() && !media) return;
    setPosting(true);
    setTimeout(() => {
      const newPost = {
        id: `p${Date.now()}`,
        user: currentUser,
        caption: caption.trim(),
        mediaUrl: media?.url || null,
        mediaType: media?.type || (caption ? "text" : null),
        fileName: media?.name || null,
        timestamp: "just now",
        likes: [],
        comments: [],
        shares: 0,
      };
      setPosts(prev => [newPost, ...prev]);
      setCaption("");
      setMedia(null);
      setPosting(false);
      showToast("✓ Posted successfully");
    }, 400);
  };

  // ── Like
  const toggleLike = (postId) => {
    setHeartAnim(prev => new Set([...prev, postId]));
    setTimeout(() => setHeartAnim(prev => { const n = new Set(prev); n.delete(postId); return n; }), 400);
    const isLiked = likedPosts.has(postId);
    setLikedPosts(prev => { const n = new Set(prev); isLiked ? n.delete(postId) : n.add(postId); return n; });
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p, likes: isLiked ? p.likes.filter(x => x !== currentUser.id) : [...p.likes, currentUser.id]
    }));
  };

  // ── Comment toggle
  const toggleComments = (postId) => {
    setOpenComments(prev => { const n = new Set(prev); n.has(postId) ? n.delete(postId) : n.add(postId); return n; });
  };

  // ── Submit comment
  const submitComment = (postId) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;
    const newComment = { id: `c${Date.now()}`, user: currentUser, text, time: "just now" };
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, comments: [...p.comments, newComment] }));
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  // ── Share
  const handleShare = (post) => {
    if (navigator.share) navigator.share({ title: post.caption, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href).catch(() => {}); showToast("🔗 Link copied!"); }
    setPosts(prev => prev.map(p => p.id !== post.id ? p : { ...p, shares: p.shares + 1 }));
  };

  return (
    <>
      <style>{css}</style>
      <div className="nf-root">

        {/* ── NAV ── */}
        <nav className="nf-nav">
          <div className="nf-nav-logo">
            Pulse
            <span>Community Feed</span>
          </div>
          <div className="nf-user-pill">
            <Avatar user={currentUser} size="sm" />
            <select value={currentUser.id} onChange={e => setCurrentUser(USERS.find(u => u.id === e.target.value))}>
              {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </nav>

        {/* ── FEED ── */}
        <div className="nf-feed">

          {/* ── COMPOSE ── */}
          <div className="compose-card">
            <div className="compose-top">
              <Avatar user={currentUser} size="md" />
              <textarea
                className="compose-input"
                placeholder={`What's on your mind, ${currentUser.name.split(" ")[0]}?`}
                value={caption}
                rows={2}
                onChange={e => setCaption(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handlePost(); }}
              />
            </div>

            {/* Media preview */}
            {media && (
              <div className="compose-media-preview">
                {(media.type === "image" || media.type === "reel") && media.url && (
                  <img src={media.url} alt="preview" />
                )}
                {media.type === "video" && media.url && (
                  <video src={media.url} controls />
                )}
                {(media.type === "pdf" || media.type === "file") && (
                  <div className="compose-file-chip">
                    <div className="compose-file-chip-icon">{media.type === "pdf" ? "📄" : "📎"}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.87rem" }}>{media.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>{media.type.toUpperCase()}</div>
                    </div>
                  </div>
                )}
                <button className="remove-media" onClick={() => setMedia(null)}>✕</button>
              </div>
            )}

            <div className="compose-footer">
              <div className="attach-btns">
                {/* Image */}
                <label className={`attach-btn ${media?.type === "image" ? "active" : ""}`}>
                  <IconImage /> Photo
                  <input type="file" accept="image/*" onChange={e => handleFile(e.target.files[0], "image")} />
                </label>
                {/* Video */}
                <label className={`attach-btn ${media?.type === "video" ? "active" : ""}`}>
                  <IconVideo /> Video
                  <input type="file" accept="video/*" onChange={e => handleFile(e.target.files[0], "video")} />
                </label>
                {/* Reel (short video) */}
                <label className={`attach-btn ${media?.type === "reel" ? "active" : ""}`}>
                  🎬 Reel
                  <input type="file" accept="video/*" onChange={e => handleFile(e.target.files[0], "reel")} />
                </label>
                {/* PDF */}
                <label className={`attach-btn ${media?.type === "pdf" ? "active" : ""}`}>
                  <IconPDF /> PDF
                  <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0], "pdf")} />
                </label>
              </div>
              <button
                className="post-btn"
                disabled={(!caption.trim() && !media) || posting}
                onClick={handlePost}
              >
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>

          {/* ── POSTS ── */}
          <div className="feed-divider"><span>Recent Posts</span></div>

          {posts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">✍️</div>
              <h3>Nothing here yet</h3>
              <p>Be the first to share something!</p>
            </div>
          )}

          {posts.map((post, idx) => {
            const isLiked = likedPosts.has(post.id);
            const commentsOpen = openComments.has(post.id);
            const likeCount = post.likes.length;

            return (
              <div key={post.id} className="post-card" style={{ animationDelay: `${idx * 0.05}s` }}>

                {/* Header */}
                <div className="post-header">
                  <Avatar user={post.user} size="md" />
                  <div className="post-author">
                    <div className="post-author-name">{post.user.name}</div>
                    <div className="post-time">{post.timestamp}</div>
                  </div>
                  <button className="post-more" title="More">···</button>
                </div>

                {/* Caption */}
                {post.caption && <div className="post-caption">{post.caption}</div>}

                {/* Media */}
                {post.mediaUrl && (post.mediaType === "image" || post.mediaType === "reel") && (
                  <div className="post-media-wrap">
                    <img src={post.mediaUrl} alt="" loading="lazy" />
                    {post.mediaType === "reel" && (
                      <div style={{ position: "absolute", top: 10, left: 12, background: "rgba(0,0,0,0.55)", color: "white",
                        padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>🎬 Reel</div>
                    )}
                  </div>
                )}
                {post.mediaUrl && post.mediaType === "video" && (
                  <div className="post-media-wrap">
                    <video src={post.mediaUrl} controls />
                  </div>
                )}
                {post.mediaType === "pdf" && (
                  <div className="post-media-wrap">
                    <div className="post-pdf-chip">
                      <div className="pdf-chip-icon">📄</div>
                      <div>
                        <div className="pdf-chip-name">{post.fileName || "Document.pdf"}</div>
                        <div className="pdf-chip-sub">PDF Document</div>
                      </div>
                      {post.mediaUrl && (
                        <a href={post.mediaUrl} target="_blank" rel="noreferrer">
                          <button className="pdf-open-btn">Open ↗</button>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Like count */}
                {likeCount > 0 && (
                  <div className="like-strip">
                    ❤️ {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </div>
                )}

                {/* Actions */}
                <div className="action-bar">
                  <button
                    className={`act-btn ${isLiked ? "liked" : ""} ${heartAnim.has(post.id) ? "heart-beat" : ""}`}
                    onClick={() => toggleLike(post.id)}
                  >
                    <IconHeart filled={isLiked} />
                    Like
                  </button>
                  <button className="act-btn" onClick={() => toggleComments(post.id)}>
                    <IconComment />
                    Comment {post.comments.length > 0 && `(${post.comments.length})`}
                  </button>
                  <div className="act-spacer" />
                  <button className="act-btn" onClick={() => handleShare(post)}>
                    <IconShare />
                    Share
                  </button>
                </div>

                {/* Comments */}
                {commentsOpen && (
                  <>
                    <div className="comments-wrap">
                      {post.comments.length === 0 && (
                        <div className="no-comments">No comments yet — be the first!</div>
                      )}
                      {post.comments.map(c => (
                        <div key={c.id} className="comment-item">
                          <Avatar user={c.user} size="sm" />
                          <div className="comment-body">
                            <div className="comment-bubble">
                              <div className="comment-author">{c.user.name}</div>
                              <div className="comment-text">{c.text}</div>
                            </div>
                            <div className="comment-time">{c.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="comment-input-row">
                      <Avatar user={currentUser} size="sm" />
                      <textarea
                        className="comment-field"
                        placeholder="Write a comment…"
                        rows={1}
                        value={commentInputs[post.id] || ""}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(post.id); } }}
                      />
                      <button className="comment-submit" onClick={() => submitComment(post.id)}>
                        <IconSend />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── TOAST ── */}
        <div className={`toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
      </div>
    </>
  );
}