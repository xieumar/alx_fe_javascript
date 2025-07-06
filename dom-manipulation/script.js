const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 15000;

let quotesArray = JSON.parse(localStorage.getItem('quotesData')) || [
    { text: "Stay hungry, stay foolish.", category: "Inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "Design" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function showRandomQuote() {
    const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
    const filtered = selectedCategory === 'all'
        ? quotesArray
        : quotesArray.filter(q => q.category === selectedCategory);

    if (filtered.length === 0) {
        document.getElementById('quoteDisplay').innerHTML = "<p>No quotes in this category.</p>";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];

    const quoteDiv = document.getElementById('quoteDisplay');
    quoteDiv.innerHTML = `<p>'${quote.text}'</p><small>${quote.category}</small>`;

    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function populateCategories() {
    const dropdown = document.getElementById('categoryFilter');
    const categories = [...new Set(quotesArray.map(q => q.category))];

    dropdown.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        dropdown.appendChild(option);
    });

    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        dropdown.value = savedCategory;
    }
}

function filterQuotes() {
    const selected = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selected);
    showRandomQuote();
}

function createAddQuoteForm() {
    const form = document.createElement('form');

    const quoteInput = document.createElement('input');
    quoteInput.type = 'text';
    quoteInput.required = true;
    quoteInput.placeholder = 'Enter quote text';

    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.required = true;
    categoryInput.placeholder = 'Enter category';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Add Quote';
    submitBtn.style.marginTop = '15px';

    quoteInput.classList.add('custom-placeholder');
    categoryInput.classList.add('custom-placeholder');

    form.appendChild(quoteInput);
    form.appendChild(categoryInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const newQuote = {
            text: quoteInput.value.trim(),
            category: categoryInput.value.trim()
        };

        quotesArray.push(newQuote);
        localStorage.setItem('quotesData', JSON.stringify(quotesArray));
        await postQuoteToServer(newQuote);

        quoteInput.value = "";
        categoryInput.value = "";

        populateCategories();
        showRandomQuote();
    });

    document.querySelector('.container').appendChild(form);
}

async function postQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category
            })
        });
        if (!response.ok) throw new Error("Failed to post quote.");
        console.log("Quote posted to server.");
    } catch (err) {
        console.error("Error posting to server:", err.message);
    }
}

function setupExportButton() {
    const exportBtn = document.getElementById('exportQuotes');
    exportBtn.addEventListener('click', function () {
        const dataStr = JSON.stringify(quotesArray, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'quotes.json';
        downloadLink.click();
        URL.revokeObjectURL(url);
    });
}

function setupImportQuotes() {
    document.getElementById('importQuotes').addEventListener('change', function () {
        const file = this.files[0];
        if (!file || file.type !== "application/json") {
            alert("Please upload a valid JSON file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                if (!Array.isArray(importedQuotes)) throw new Error("Invalid file format.");

                let updated = 0, skipped = 0;
                const existing = new Set(quotesArray.map(q => q.text.toLowerCase().trim()));

                importedQuotes.forEach(q => {
                    const key = q.text?.toLowerCase().trim();
                    if (q.text && q.category && !existing.has(key)) {
                        quotesArray.push({ text: q.text.trim(), category: q.category.trim() });
                        updated++;
                    } else {
                        skipped++;
                    }
                });

                localStorage.setItem('quotesData', JSON.stringify(quotesArray));
                populateCategories();
                showRandomQuote();

                alert(`Import complete!\nAdded: ${updated} new quote(s)\nSkipped: ${skipped} duplicate(s).`);
            } catch (err) {
                alert("Error importing quotes: " + err.message);
            }
        };

        reader.readAsText(file);
    });
}

// ✅ Notification for syncs
function notifyUser(message) {
    const note = document.createElement('div');
    note.textContent = message;
    note.style.backgroundColor = "#ffe58f";
    note.style.padding = "8px";
    note.style.border = "1px solid #999";
    note.style.marginBottom = "10px";
    note.style.textAlign = "center";
    document.querySelector('.container').prepend(note);
    setTimeout(() => note.remove(), 4000);
}

// ✅ Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const serverPosts = await response.json();
        if (!Array.isArray(serverPosts)) throw new Error("Server response not an array.");

        const existing = new Set(quotesArray.map(q => q.text.toLowerCase().trim()));
        let added = 0;

        serverPosts.slice(0, 10).forEach(post => {
            const text = post.title?.trim();
            const category = 'ServerSync';
            const key = text?.toLowerCase();

            if (text && !existing.has(key)) {
                quotesArray.push({ text, category });
                added++;
            }
        });

        if (added > 0) {
            localStorage.setItem('quotesData', JSON.stringify(quotesArray));
            populateCategories();
            showRandomQuote();
            notifyUser(`${added} quote(s) synced from server.`);
        }
    } catch (error) {
        console.error("Failed to fetch from server:", error.message);
    }
}

// ✅ Sync function wrapper
function syncQuotes() {
    fetchQuotesFromServer();
}

// ✅ Periodic syncing
setInterval(syncQuotes, SYNC_INTERVAL);

document.addEventListener("DOMContentLoaded", function () {
    populateCategories();
    showRandomQuote();
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
    createAddQuoteForm();
    setupExportButton();
    setupImportQuotes();
    fetchQuotesFromServer(); // initial sync
});
