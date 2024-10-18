const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    document.getElementById("backButton").addEventListener("click", () => {
      history.back();
    });

    const bookDetailContainer = document.getElementById('bookDetail');

    async function fetchBookDetail() {
      try {
        const response = await fetch(`https://gutendex.com/books/${bookId}`);
        if (!response.ok) throw new Error('Book not found');
        const book = await response.json();

        bookDetailContainer.innerHTML = `
          <div class="book-item-details">
            <div class="book-item-details-top">
              <div class="book-item-details-top-left">
                <img src="${book.formats['image/jpeg']}" alt="${book.title}">
              </div>
              <div class="book-item-details-top-right">
                <h2 class="book-item-details-title">${book.title}</h2>
                <p class="book-item-details-author"><strong>Author:</strong> ${book.authors.map(author => author.name).join(', ')}</p>
                <p class="book-item-details-subject"><strong>Subjects:</strong> ${book.subjects.join(', ')}</p>
                <p class="book-item-details-shelves"><strong>Bookshelves:</strong> ${book.bookshelves.join(', ')}</p>
              </div>
            </div>
          </div>
        `;
      } catch (error) {
        bookDetailContainer.innerHTML = `<p>Error: ${error.message}</p>`;
      }
    }

    fetchBookDetail();