import { supabase } from './supabase.js';

// ==========================================
// POSTS
// ==========================================

export async function getPosts({ categorySlug = null, search = null, limit = null, offset = 0 } = {}) {
    let query = supabase
        .from('posts')
        .select(`
            *,
            categories (name, slug),
            post_tags (
                tags (name, slug)
            )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (categorySlug) {
        // Find category ID first, then filter posts (Supabase makes deep filtering tricky sometimes)
        const { data: category } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
        if (category) {
            query = query.eq('category_id', category.id);
        }
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    if (limit) {
        query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;
    if (error) console.error('Error fetching posts:', error);
    return { data, count, error };
}

export async function getAllPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`*, categories (name)`)
        .order('created_at', { ascending: false });
    if (error) console.error('Error fetching all posts:', error);
    return { data, error };
}

export async function getPost(slug) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            categories (name, slug),
            post_tags (
                tags (name, slug)
            )
        `)
        .eq('slug', slug)
        .single();
    if (error) console.error('Error fetching post:', error);
    return { data, error };
}

export async function getPostById(id) {
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            categories (name, slug)
        `)
        .eq('id', id)
        .single();
    if (error) console.error('Error fetching post by id:', error);
    return { data, error };
}

export async function getFeaturedPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select(`*, categories (name, slug)`)
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false });
    if (error) console.error('Error fetching featured posts:', error);
    return { data, error };
}

export async function createPost(postData) {
    const { data, error } = await supabase.from('posts').insert([postData]).select().single();
    if (error) console.error('Error creating post:', error);
    return { data, error };
}

export async function updatePost(id, postData) {
    postData.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('posts').update(postData).eq('id', id).select().single();
    if (error) console.error('Error updating post:', error);
    return { data, error };
}

export async function deletePost(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) console.error('Error deleting post:', error);
    return { error };
}

export async function trackView(postId) {
    const { error } = await supabase.rpc('increment_views', { post_id: postId });
    if (error) console.error('Error tracking view:', error);
}

export async function trackRead(postId) {
    const { error } = await supabase.rpc('increment_reads', { post_id: postId });
    if (error) console.error('Error tracking read:', error);
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) console.error('Error fetching categories:', error);
    return { data, error };
}

export async function createCategory(categoryData) {
    const { data, error } = await supabase.from('categories').insert([categoryData]).select().single();
    if (error) console.error('Error creating category:', error);
    return { data, error };
}

export async function updateCategory(id, categoryData) {
    const { data, error } = await supabase.from('categories').update(categoryData).eq('id', id).select().single();
    if (error) console.error('Error updating category:', error);
    return { data, error };
}

export async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Error deleting category:', error);
    return { error };
}

// ==========================================
// TAGS
// ==========================================

export async function getTags() {
    const { data, error } = await supabase.from('tags').select('*').order('name');
    if (error) console.error('Error fetching tags:', error);
    return { data, error };
}

export async function createTag(tagData) {
    const { data, error } = await supabase.from('tags').insert([tagData]).select().single();
    if (error) console.error('Error creating tag:', error);
    return { data, error };
}

export async function deleteTag(id) {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) console.error('Error deleting tag:', error);
    return { error };
}

// ==========================================
// COMMENTS
// ==========================================

export async function getComments(postId) {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
    if (error) console.error('Error fetching comments:', error);
    return { data, error };
}

export async function getAllComments() {
    const { data, error } = await supabase
        .from('comments')
        .select('*, posts(title)')
        .order('created_at', { ascending: false });
    if (error) console.error('Error fetching all comments:', error);
    return { data, error };
}

export async function submitComment(commentData) {
    // Defaults to 'pending' as per schema
    const { data, error } = await supabase.from('comments').insert([commentData]).select().single();
    if (error) console.error('Error submitting comment:', error);
    return { data, error };
}

export async function approveComment(id) {
    const { data, error } = await supabase.from('comments').update({ status: 'approved' }).eq('id', id).select().single();
    if (error) console.error('Error approving comment:', error);
    return { data, error };
}

export async function deleteComment(id) {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) console.error('Error deleting comment:', error);
    return { error };
}

// ==========================================
// SUBSCRIBERS
// ==========================================

export async function subscribe(email, name) {
    const { data, error } = await supabase.from('subscribers').insert([{ email, name }]).select().single();
    if (error) console.error('Error subscribing:', error);
    return { data, error };
}

export async function getSubscribers() {
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching subscribers:', error);
    return { data, error };
}

export async function unsubscribe(email) {
    const { error } = await supabase.from('subscribers').update({ status: 'unsubscribed' }).eq('email', email);
    if (error) console.error('Error unsubscribing:', error);
    return { error };
}

// ==========================================
// ANALYTICS (Overview counts for Phase 4)
// ==========================================

export async function getDashboardStats() {
    // Note: In a real heavy-traffic app, you wouldn't compute sums on the fly,
    // but for this blog, querying the tables directly is fine.
    try {
        const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        const { count: subsCount } = await supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active');

        // Summing views requires fetching (alternatively, maintaining a totals counter table)
        const { data: viewsData } = await supabase.from('posts').select('views, reads');
        const totalViews = viewsData ? viewsData.reduce((acc, curr) => acc + (curr.views || 0), 0) : 0;
        const totalReads = viewsData ? viewsData.reduce((acc, curr) => acc + (curr.reads || 0), 0) : 0;

        return {
            posts: postsCount || 0,
            subscribers: subsCount || 0,
            views: totalViews,
            reads: totalReads,
            error: null
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { error };
    }
}

export async function getTopPosts(limit = 5) {
    const { data, error } = await supabase
        .from('posts')
        .select('title, slug, views, reads')
        .order('views', { ascending: false })
        .limit(limit);
    if (error) console.error('Error fetching top posts:', error);
    return { data, error };
}

// ==========================================
// KEYWORDS
// ==========================================

export async function getKeywords() {
    const { data, error } = await supabase.from('keywords').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching keywords:', error);
    return { data, error };
}

export async function addKeyword(keywordData) {
    const { data, error } = await supabase.from('keywords').insert([keywordData]).select().single();
    if (error) console.error('Error adding keyword:', error);
    return { data, error };
}

export async function updateKeyword(id, keywordData) {
    const { data, error } = await supabase.from('keywords').update(keywordData).eq('id', id).select().single();
    if (error) console.error('Error updating keyword:', error);
    return { data, error };
}

export async function deleteKeyword(id) {
    const { error } = await supabase.from('keywords').delete().eq('id', id);
    if (error) console.error('Error deleting keyword:', error);
    return { error };
}

// ==========================================
// CALENDAR
// ==========================================

export async function getCalendarEntries(month, year) {
    // Simplistic approach: fetch all for now, filter in memory if small, 
    // or use range queries for exact months
    const { data, error } = await supabase.from('calendar').select('*');
    if (error) console.error('Error fetching calendar:', error);
    return { data, error };
}

export async function createCalendarEntry(entryData) {
    const { data, error } = await supabase.from('calendar').insert([entryData]).select().single();
    if (error) console.error('Error creating calendar entry:', error);
    return { data, error };
}

export async function updateCalendarEntry(id, entryData) {
    const { data, error } = await supabase.from('calendar').update(entryData).eq('id', id).select().single();
    if (error) console.error('Error updating calendar entry:', error);
    return { data, error };
}

export async function deleteCalendarEntry(id) {
    const { error } = await supabase.from('calendar').delete().eq('id', id);
    if (error) console.error('Error deleting calendar entry:', error);
    return { error };
}

// ==========================================
// AI INTEGRATIONS (Claude & Gemini)
// ==========================================

export async function generateClaudeResponse(prompt, content) {
    const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, content })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Claude API request failed');
    }

    const data = await response.json();
    return data.text;
}

export async function generateGeminiSEO(keyword, content) {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, content })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Gemini API request failed');
    }

    return await response.json();
}
