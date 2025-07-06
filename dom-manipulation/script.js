const quotesArray = JSON.parse(localStorage.getItem('quotesData')) || [
    { text: "Stay hungry, stay foolish.", category: "Inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "Design" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" }
];

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotesArray.length);
    const quote = quotesArray[randomIndex];

    const quoteDiv = document.getElementById('quoteDisplay');
    quoteDiv.innerHTML = `<p>'${quote.text}'</p>
                          <small>${quote.category}</small>`;

    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
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

        showRandomQuote();
    });

   document.querySelector('.container').appendChild(form);

}

function createExportImportButtons() {
    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('controls'); // apply your CSS styles

    // Export Button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Quotes as JSON';

    exportBtn.addEventListener('click', function () {
        const blob = new Blob([JSON.stringify(quotesArray, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'quotes.json';
        a.click();

        URL.revokeObjectURL(url);
    });

    // Import File Input
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';

    importInput.addEventListener('change', function () {
        const file = importInput.files[0];
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
                    alert("Quotes imported successfully!");
                    showRandomQuote();
                } else {
                    alert("Invalid file format.");
                }
            } catch (err) {
                alert("Error reading file: " + err.message);
            }
        };

        reader.readAsText(file);
    });

    controlsDiv.appendChild(exportBtn);
    controlsDiv.appendChild(importInput);

    // Inject inside the .container
    const container = document.querySelector('.container');
    container.appendChild(controlsDiv);
}

document.addEventListener("DOMContentLoaded", function () {
    showRandomQuote();
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    createAddQuoteForm();
    createExportImportButtons();
});
