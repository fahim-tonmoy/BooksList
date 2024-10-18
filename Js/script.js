let books = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let currentPage = 1;
const booksPerPage = 10;
const loader = document.getElementById("loader");

const savedSearchQuery = localStorage.getItem("searchQuery") || "";
const savedGenre = localStorage.getItem("selectedGenre") || "";

  function showLoader() {
    loader.classList?.add("active");
  }
  function hideLoader() {
    loader.classList?.remove("active");
  }

async function fetchBooks() {
  showLoader();
  try {
    const response = await fetch("https://gutendex.com/books");
    if (!response.ok) throw new Error("Failed to fetch books.");
    const data = await response.json();
    books = data.results;

    const uniqueGenres = getUniqueGenres(books);
    populateGenreDropdown(uniqueGenres); 

    applySavedFilters(); 
    setupPagination(); 
  } catch (error) {
    console.error(error);
    document.getElementById("bookList").innerHTML = "<p>Error fetching books. Please try again later.</p>";
  } finally {
    hideLoader();
  }
}


function getUniqueGenres(books) {
  const genres = books.flatMap((book) => book.bookshelves || []);
  return [...new Set(genres)]; 
}


function populateGenreDropdown(genres) {
  const dropdown = document.getElementById("genreDropdown");
  dropdown.innerHTML = `<option value="">All Genres</option>`; 

  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    dropdown.appendChild(option);
  });

  
  dropdown.value = savedGenre;
}

function displayBooks(booksToShow) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = booksToShow
    .map(
      (book) => `
      <div class="book-item">
        <div class="book-item-top">
          <img src="${book.formats["image/jpeg"] || 'default-cover.jpg'}" alt="${book.title}" />
        </div>
        <div class="book-item-body">
          <a href="book-details.html?id=${book.id}" >${book.title}  <span class="fa fa-external-link" aria-hidden="true"></span> </a>
          <span><strong>Genre: </strong>${book.bookshelves ? book.bookshelves.join(", ") : "N/A"}</span>
          <div class="wishlist-icon" onclick="toggleWishlist(event, ${book.id})">
          ${wishlist.includes(book.id) ? "🤍" : (`
            <span class="icon-outline">&#9825;</span>
          `) }
          </div>
        </div>
          <div class="book-item-footer">
          <p><strong>By:</strong> ${book.authors.map((author) => author.name).join(", ")}</p>
        </div> 
      </div>`
    )
    .join("");
}


function paginateBooks() {
  const start = (currentPage - 1) * booksPerPage;
  const paginatedBooks = books.slice(start, start + booksPerPage);
  displayBooks(paginatedBooks);
  setupPagination()
}


function toggleWishlist(event, bookId) {
  event.stopPropagation(); 
  event.preventDefault();
  if (wishlist.includes(bookId)) {
    wishlist = wishlist.filter((id) => id !== bookId);
  } else {
    wishlist.push(bookId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  paginateBooks(); 
}



function setupPagination() {
  const pagination = document.getElementById("pagination");
  const totalPages = Math.ceil(books.length / booksPerPage);

  pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
    <button class="${i + 1 === currentPage ? 'active' : ''}"  onclick="changePage(${i + 1})">${i + 1}</button>
  `).join("");
}


function changePage(page) {
  currentPage = page;
  paginateBooks();
}


function savePreferences(searchQuery, genre) {
  localStorage.setItem("searchQuery", searchQuery);
  localStorage.setItem("selectedGenre", genre);
}


function applySavedFilters() {
  document.getElementById("searchBar").value = savedSearchQuery;
  document.getElementById("genreDropdown").value = savedGenre;

  let filteredBooks = books;

  
  if (savedSearchQuery) {
    filteredBooks = filteredBooks.filter((book) =>
      book.title.toLowerCase().includes(savedSearchQuery.toLowerCase())
    );
  }

  
  if (savedGenre) {
    filteredBooks = filteredBooks.filter((book) =>
      book.bookshelves && book.bookshelves.includes(savedGenre)
    );
    document.getElementById("pagination").style.display = "none"; 
    displayBooks(filteredBooks); 
  } else {
    document.getElementById("pagination").style.display = "block"; 
    paginateBooks(); 
  }
}

document.getElementById("searchBar")?.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    savePreferences(searchValue, document.getElementById("genreDropdown").value);
  
    
    if (searchValue === "") {
      currentPage = 1; 
      paginateBooks(); 
    } else {
      const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchValue)
      );
      displayBooks(filteredBooks); 
    }
  });


document.getElementById("genreDropdown")?.addEventListener("change", (e) => {
  const selectedGenre = e.target.value;
  savePreferences(document.getElementById("searchBar").value, selectedGenre);

  if (selectedGenre) {
    const filteredBooks = books.filter(
      (book) => book.bookshelves && book.bookshelves.includes(selectedGenre)
    );
    document.getElementById("pagination").style.display = "none"; 
    displayBooks(filteredBooks); 
  } else {
    document.getElementById("pagination").style.display = "block"; 
    currentPage = 1; 
    paginateBooks(); 
  }
});


fetchBooks();
