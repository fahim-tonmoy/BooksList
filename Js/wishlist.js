let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
const loader = document.getElementById("loader");
let books = [];


function showLoader() {
  loader.classList.add("active");
}
function hideLoader() {
  loader.classList.remove("active");
}


async function fetchWishlistBooks() {
  showLoader();
  try {
    const response = await fetch("https://gutendex.com/books");
    if (!response.ok) throw new Error("Failed to fetch data.");
    const data = await response.json();
    books = data.results;

    const wishlistedBooks = books.filter((book) => wishlist.includes(book.id));
    if (wishlistedBooks.length > 0) {
      displayBooks(wishlistedBooks);
    } else {
      document.getElementById("bookList").innerHTML = "<p>Your wishlist is empty!</p>";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("bookList").innerHTML = "<p>Error fetching wishlist books. Please try again later.</p>";
  } finally {
    hideLoader();
  }
}


function displayBooks(booksToShow) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = booksToShow
    .map(
      (book) => `
      <div class="book-item"">
        <div class="book-item-top">
          <img src="${book.formats["image/jpeg"] || 'default-cover.jpg'}" alt="${book.title}" />
        </div>
        <div class="book-item-body">
          <a href="book-details.html?id=${book.id}">${book.title}  <span class="fa fa-external-link" aria-hidden="true"></span> </a>
          <span><strong>Genre: </strong> ${book.bookshelves ? book.bookshelves.join(", ") : "N/A"}</span>
          <div class="wishlist-icon" onclick="toggleWishlist(${book.id})">
          ${wishlist.includes(book.id) ? "🤍" : (`
            <span class="icon-outline">&#9825;</span>
          `)}
          </div>
        </div>
          <div class="book-item-footer">
          <p><strong>By:</strong> ${book.authors.map((author) => author.name).join(", ")}</p>
        </div> 
      </div>`
    )
    .join("");
}


function removeFromWishlist(bookId) {
  wishlist = wishlist.filter((id) => id !== bookId);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  fetchWishlistBooks(); 
}


fetchWishlistBooks();
