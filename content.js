
// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "processBookmark") {
        categorizeBookmark(request.title).then((category) => {
            console.log(`Bookmark: ${request.title} - Category: ${category}`);
            // Display or update the bookmark in the UI with its category
        });
    }
});


// Populate dropdown with folder names
function populateFolderDropdown(folders, dropdown) {
    folders.forEach((folder) => {
        if (folder.isFolder) {
            const option = document.createElement("option");
            option.value = folder.id;
            option.textContent = folder.title;
            dropdown.appendChild(option);

            // Recursively add subfolders
            if (folder.children) {
                populateFolderDropdown(folder.children, dropdown);
            }
        }
    });
}

// Display bookmarks from the selected folder
function displayBookmarksFromFolder(folderId) {
    chrome.storage.local.get("folderStructure", (data) => {
        const bookmarksContainer = document.getElementById("bookmarks");
        bookmarksContainer.innerHTML = ""; // Clear existing content

        const folder = findFolderById(data.folderStructure, folderId);
        if (folder) {
            createFolderView(folder.children, bookmarksContainer);
        } else {
            bookmarksContainer.textContent = "No bookmarks found for this folder.";
        }
    });
}

// Helper function to find folder by ID in the folder structure
function findFolderById(items, folderId) {
    for (const item of items) {
        if (item.isFolder && item.id === folderId) {
            return item;
        } else if (item.isFolder && item.children) {
            const found = findFolderById(item.children, folderId);
            if (found) return found;
        }
    }
    return null;
}

// Recursive function to create bookmark structure in DOM
function createFolderView(items, container) {
    items.forEach((item) => {
        if (!item.isFolder) {
            // Create bookmark element
            const bookmarkElement = document.createElement("div");
            bookmarkElement.classList.add("bookmark");

            const title = document.createElement("p");
            title.textContent = item.title;

            const link = document.createElement("a");
            link.href = item.url;
            link.textContent = item.url;
            link.target = "_blank";

            bookmarkElement.appendChild(title);
            bookmarkElement.appendChild(link);
            container.appendChild(bookmarkElement);
        }
    });
}

// Run on popup load to populate dropdown and add event listener
document.addEventListener("DOMContentLoaded", () => {
    const folderDropdown = document.getElementById("folderDropdown");

    // Fetch and populate folder dropdown
    chrome.storage.local.get("folderStructure", (data) => {
        if (data.folderStructure) {
            populateFolderDropdown(data.folderStructure, folderDropdown);
        }
    });

    // Event listener to display bookmarks from selected folder
    folderDropdown.addEventListener("change", (event) => {
        const selectedFolderId = event.target.value;
        displayBookmarksFromFolder(selectedFolderId);
    });
});



