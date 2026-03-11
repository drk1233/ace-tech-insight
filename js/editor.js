// Tiptap is imported and initialized directly inside dashboard/editor.html 
// to keep component scope and UI logic closely tied together. 
// See dashboard/editor.html script section for the full Editor integration.

export const editorConfig = {
    // Placeholder configuration file
    toolbar: ['bold', 'italic', 'strike', 'h2', 'h3', 'bulletList', 'orderedList', 'blockquote', 'undo', 'redo'],
    autosaveIntervalMs: 30000 
};
