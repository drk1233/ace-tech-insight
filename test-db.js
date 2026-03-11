const url = "https://ubtkfudpvgebgdbwymde.supabase.co/rest/v1/posts?select=*";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGtmdWRwdmdlYmdkYnd5bWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjQ0MDAsImV4cCI6MjA4ODc0MDQwMH0.SaLSOXsxhwlaoG4mabCLp_48r1VSJBiJNgYOKna6f1c";

fetch(url, {
    method: 'GET',
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
})
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("SUCCESS! Connection verified.");
        console.log("Posts table retrieved count:", data.length);
    })
    .catch(err => {
        console.error("FAILED TO CONNECT TO SUPABASE:");
        console.error(err);
    });
