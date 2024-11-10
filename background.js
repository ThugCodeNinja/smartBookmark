
// Load all bookmarks on startup and organize them by folders
console.log("Background script is running!");

// Load all bookmarks on startup and organize them by folders
chrome.runtime.onStartup.addListener(loadBookmarksByFolder);
chrome.runtime.onInstalled.addListener(loadBookmarksByFolder);

// Function to load bookmarks and organize them by folder
function loadBookmarksByFolder() {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const folderStructure = organizeByFolder(bookmarkTreeNodes);
        chrome.storage.local.set({ folderStructure });
        console.log("Stored folder-structured bookmarks:", folderStructure);
    });
}

// Recursively organize bookmarks by folders
function organizeByFolder(nodes) {
    const result = [];

    nodes.forEach((node) => {
        if (node.children) {
            // If the node has children, it's a folder
            const folder = {
                id: node.id,
                title: node.title,
                children: organizeByFolder(node.children),
                isFolder: true,
            };
            result.push(folder);
        } else {
            // If the node has no children, it's a bookmark
            const bookmark = {
                id: node.id,
                title: node.title,
                url: node.url,
                isFolder: false,
            };
            result.push(bookmark);
        }
    });

    return result;
}

// Reload folder structure whenever a bookmark is created or removed
chrome.bookmarks.onCreated.addListener(loadBookmarksByFolder);
chrome.bookmarks.onRemoved.addListener(loadBookmarksByFolder);


// Reload folder structure whenever a bookmark is created or removed

chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    console.log("New bookmark added:", bookmark.title);
    chrome.runtime.sendMessage({ type: "processBookmark", title: bookmark.title, url: bookmark.url });
});

chrome.bookmarks.onRemoved.addListener((id, removeInfo) => {
    console.log("Bookmark removed:", id);
    // Optionally handle bookmark removal
});