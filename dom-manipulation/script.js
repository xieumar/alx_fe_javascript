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

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const newQuote = {
            text: quoteInput.value.trim(),
            category: categoryInput.value.trim()
        };

        quotesArray.push(newQuote);
        localStorage.setItem('quotesData', JSON.stringify(quotesArray));

        quoteInput.value = "";
        categoryInput.value = "";

        populateCategories();
        showRandomQuote();
    });

    document.querySelector('.container').appendChild(form);
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
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                if (Array.isArray(importedQuotes)) {
                    importedQuotes.forEach(q => {
                        if (q.text && q.category) {
                            quotesArray.push(q);
                        }
                    });
                    localStorage.setItem('quotesData', JSON.stringify(quotesArray));
                    populateCategories();
                    showRandomQuote();
                    alert("Quotes imported successfully!");
                } else {
                    alert("Invalid file format.");
                }
            } catch (err) {
                alert("Error reading file: " + err.message);
            }
        };

        reader.readAsText(file);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    populateCategories();
    showRandomQuote();
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    createAddQuoteForm();
    setupExportButton();
    setupImportQuotes();
});
