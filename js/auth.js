import { supabase } from './supabase.js';

/**
 * Signs in with Supabase auth using email and password.
 * Redirects to dashboard/index.html on success.
 * @param {string} email 
 * @param {string} password 
 * @returns {object} { error } - error object if login fails
 */
export async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Success - redirect to dashboard
        window.location.href = '/dashboard/index.html';
        return { error: null };

    } catch (error) {
        console.error('Login error:', error.message);
        return { error: error.message };
    }
}

/**
 * Signs out the current user and redirects to the login page.
 */
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/dashboard/login.html';
    } catch (error) {
        console.error('Logout error:', error.message);
    }
}

/**
 * Returns the current authenticated user session object.
 * @returns {object|null} The session object or null if not logged in
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Get session error:', error.message);
        return null;
    }
    return session;
}

/**
 * Returns the current user object.
 * @returns {object|null} The user object or null if not logged in
 */
export async function getUser() {
    const session = await getSession();
    return session ? session.user : null;
}

/**
 * Checks for an active session. If none exists, redirects the user to the login page.
 * Call this at the top of EVERY protected dashboard page script.
 * @returns {object|null} Returns user object if authenticated
 */
export async function requireAuth() {
    const user = await getUser();
    if (!user) {
        // Not logged in, redirect to login page
        window.location.replace('/dashboard/login.html');
        return null;
    }
    return user;
}

/**
 * Sends a password reset email to the user.
 * @param {string} email 
 * @returns {object} { error } - error object if request fails
 */
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/dashboard/reset-password.html',
        });
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Password reset error:', error.message);
        return { error: error.message };
    }
}
