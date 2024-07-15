function searchOnClick(event) {
  event.preventDefault(); // Prevent form submission
  fetchAndDisplayOrders();
}

// Attach searchOnClick function to search button click event
document
  .getElementById("searchButton")
  .addEventListener("click", searchOnClick);

// Function to fetch data and display portfolio items
async function fetchAndDisplayOrders() {
  const portfolioItemsContainer = document.getElementById("portfolioItems");
  portfolioItemsContainer.innerHTML = ""; // Clear previous portfolio items

  // Get input values from form fields
  const itemCodeInput = document
    .getElementById("input1")
    .value.trim()
    .toLowerCase();
  const descriptionInput = document
    .getElementById("input2")
    .value.trim()
    .toLowerCase();
  const barcodeInput = document
    .getElementById("input3")
    .value.trim()
    .toLowerCase();
  const weeCostInput = document
    .getElementById("input4")
    .value.trim()
    .toLowerCase();
  const priceFromInput = parseInt(
    document.getElementById("input5").value.trim(),
    10
  );
  const priceToInput = parseInt(
    document.getElementById("input6").value.trim(),
    10
  );

  const searchBarInput = document.getElementById("search").value;

  try {
    // Fetch items data from API
    const response = await fetch(
      "https://extcatalog-mq-server.onrender.com/items"
    );
    const data = await response.json();

    console.log(data);

    // Iterate over each item and filter based on search criteria
    data.forEach((item) => {
      const itemCode = item.identifier.id;
      const barcode = item.identifier.barcode;
      const description = item.description;
      const price = item.price.taxIncludedPrice;
      const imgUrl = item.imgUrl;
      const warehouseId = item.warehouse.id;
      const onStock = item.warehouse.availableQty;
      const userFields = item.userFields;
      const weeCost = userFields[0].value.text; // Safely access weeCost
      //  console.log(userFields[1].value.text);
      const userFields2 = parseFloat(userFields[1].value.number); // Safely access userFields2
      console.log(userFields[1]);
      // console.log(userFields2);
      // console.log(barcodeInput);
      // Apply filters based on input values
      if (
        (itemCodeInput !== "" &&
          !itemCode.toLowerCase().includes(itemCodeInput.toLowerCase())) ||
        (descriptionInput !== "" &&
          !description
            .toLowerCase()
            .includes(descriptionInput.toLowerCase())) ||
        (barcodeInput !== "" && !barcode.includes(barcodeInput)) ||
        (weeCostInput !== "" &&
          weeCost.toLowerCase() !== weeCostInput.toLowerCase()) ||
        (!isNaN(priceFromInput) && price < priceFromInput) ||
        (!isNaN(priceToInput) && price > priceToInput)
      ) {
        return; // Skip this iteration if any filter condition fails
      }

      if (
        searchBarInput == "" ||
        itemCode.toLowerCase().includes(searchBarInput) ||
        description.toLowerCase().includes(searchBarInput) ||
        barcode.includes(searchBarInput) ||
        weeCost.toLowerCase().includes(searchBarInput)
      ) {
        generatePortfolioItem(
          itemCode,
          description,
          imgUrl,
          price,
          userFields2,
          warehouseId,
          onStock
        );
      }

      // Generate portfolio item HTML if all filters pass
    });
  } catch (error) {
    console.error("Error fetching or generating items:", error);
  }

  // Set timeouts for additional functions
  setTimeout(initiateFastBuy, 500);
  setTimeout(initiateAddToCart, 500);
  setTimeout(initiateRemove, 500);
}

function addToCart(
  itemCodeVar,
  quantityVar,
  unitPrice,
  priceWithDiscount,
  warehouseIdVar,
  finalPrice
) {
  const existingItems = localStorage.getItem("cartItems");
  const cartItems = existingItems ? JSON.parse(existingItems) : [];
  const existingItemIndex = cartItems.findIndex(
    (item) => item.item.itemCode === itemCodeVar
  );
  if (existingItemIndex !== -1) {
    cartItems[existingItemIndex].quantity++;
  } else {
    const item = {
      itemCode: itemCodeVar,
    };

    const cartItem = {
      itemLineId: itemLineIdCounter++,
      item: item,
      quantity: quantityVar,
      price: {
        basePrice: unitPrice,
        currentPrice: priceWithDiscount,
      },
      lineAmount: {
        currency: "EUR",
        value: finalPrice,
      },
      inventoryOrigin: {
        warehouseId: warehouseIdVar,
      },
    };

    cartItems.push(cartItem);
  }
  console.log(cartItems);

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function generateUniqueId() {
  return "portfolioModal" + Math.random().toString(36).substring(7);
}

// Function to generate portfolio item HTML
function generatePortfolioItem(
  itemCode,
  description,
  imageUrl,
  price,
  userF1,
  userF2,
  warehouseId,
  onStock
) {
  const croppedDescription = description.includes("(")
    ? description.substring(0, description.indexOf("("))
    : description;
  const portfolioItemsContainer = document.getElementById("portfolioItems");
  const portfolioModalId = generateUniqueId();

  const portfolioItemHTML = `
        <div class="col-lg-4 col-sm-6 mb-4">
            <div class="portfolio-item">
                <a class="portfolio-link" data-bs-toggle="modal" href="#${portfolioModalId}">
                    <div class="portfolio-hover">
                        <div class="portfolio-hover-content"><i class="fas fa-eye fa-3x"></i></div>
                    </div>
                    <img class="img-fluid" src=${imageUrl} alt="..." />
                </a>
                <div class="caption-hoster">

                <div class='hoster'>
                        <button onclick="addToCart('${itemCode}', 1, ${price}, ${price}, '${warehouseId}', ${price} , '${description}')"  id="addToCart" class="adtocart ">
                          <i class="fa fa-cart-plus"></i>
                        </button>
                        <button href="#" id="fastBuy" item="${itemCode}" class="fastBuy adtocart postButtonDemo">
                          <i class="fa fa-shopping-cart"></i>
                        </button>
                    </div>  
                <div class="portfolio-caption">
                    <div class="section-heading text-uppercase">${croppedDescription}</div>
                    <div class="portfolio-caption-subheading text-muted">€${price}</div>

                    
                    <div class="right-corner" > onStock: ${onStock} items </div>
                </div>
                </div>
                
            </div>
            
        </div>
    `;
  portfolioItemsContainer.innerHTML += portfolioItemHTML;

  const portfolioModalContainer = document.createElement("div");
  portfolioModalContainer.innerHTML = `
    <div class="portfolio-modal modal fade" id="${portfolioModalId}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="close-modal" data-bs-dismiss="modal"><img src="assets/close-icon.svg" alt="Close modal" /></div>
                <div class="container">
                    <div class="row justify-content-center">
                        <img class="img" src=${imageUrl} alt="..." />
                        <div class="col-lg-8">    
                            <div class="modal-body">
                                <h2 class="text-uppercase">${description}</h2>
                                <h3>Item Code: ${itemCode}</h3>
                                <p>Price: ${price}</p>
                                <p>WEEE Cost: ${userF1}</p>
                                <p>WEEE Amount: ${userF2}</p>
                                <p>On Stock: ${onStock}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <button  onclick="addToCart('${itemCode}', 1, ${price}, ${price}, '${warehouseId}', ${price} , '${description}' )"  id="addToCart" class="adtocart ">
                          <i class="fa fa-cart-plus"></i>
                        </button>
                               <button href="#" id="fastBuy" item="${itemCode}" class="fastBuy adtocart postButtonDemo">
                          <i class="fa fa-shopping-cart"></i>
                        </button>
                            </div>
                            <div class="d-flex justify-content-between">
                              <button item-value="${price}" item-name="${description}" item="${itemCode}"  id="addToCart" class="adtocart removeFromBasket">
                          <i class="fa fa-minus"></i>
                        </button>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

  document.body.appendChild(portfolioModalContainer.firstElementChild);
}

var postButtonDemoElements;

// Loop through each button and attach event listener

function initiateFastBuy() {
  postButtonDemoElements = document.querySelectorAll(".postButtonDemo");

  postButtonDemoElements.forEach(function (button) {
    button.addEventListener("click", function (event) {
      var urlStart = "https://retail-services.cegid.cloud/et/pos/additem/";
      var item = button.getAttribute("item");
      var newUrl = urlStart + item + "/1";

      window.location.href = newUrl;
    });
  });
}

function redirectToUrl() {
  window.location.href = "https://retail-services.cegid.cloud/et/pos/";
}

document.getElementById("return").addEventListener("click", redirectToUrl);

document.addEventListener("DOMContentLoaded", function () {
  localStorage.setItem("cartItems", "");

  document.getElementById("return").addEventListener("click", (event) => {
    event.preventDefault();
    redirectToUrl();
  });
  const searchInput = document.getElementById("search");
  let debounceTimeout;

  searchInput.addEventListener("input", (event) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchAndDisplayOrders();
    }, 500); // 500 milliseconds debounce time
  });
  // fetch('data.csv') // Replace with your CSV file path
  // .then(response => response.text())
  // .then(data => processCSV(data))
  // .catch(error => console.error('Error fetching CSV:', error));
});

let uniqueCodes = new Set();
async function fetchAndGeneratePortfolioItems() {
  try {
    const response = await fetch(
      "https://extcatalog-mq-server.onrender.com/items"
    );
    const data = await response.json();

    console.log(data);
    await Promise.all(
      data.map(async (item) => {
        const itemCode = item.identifier.id;
        const title = item.description;
        const price = item.price.taxIncludedPrice;
        const imgUrl = item.imgUrl;
        const productList = document.getElementById("products");
        const warehouseId = item.warehouse.id;
        const onStock = item.warehouse.availableQty;
        const userFields = item.userFields;
        const userFields1 = userFields[0].value.text;
        const userFields2 = userFields[1].value.number;

        generatePortfolioItem(
          itemCode,
          title,
          imgUrl,
          price,
          userFields1,
          userFields2,
          warehouseId,
          onStock
        );
      })
    );
  } catch {
    console.log("error on generate");
  }

  setTimeout(initiateFastBuy, 1000);
  setTimeout(initiateAddToCart, 2000);
  setTimeout(initiateRemove, 500);
}

// Immediately fetch and generate the first 9 portfolio items
fetchAndGeneratePortfolioItems();

function fetchAndGenerateRemainingItems() {
  fetch("data.csv") // Replace with your CSV file path
    .then((response) => response.text())
    .then((data) => {
      const rows = data.split("\n");
      let counter = 31; // Start from 10 as we've already processed the first 9

      // Process the remaining rows
      for (let index = 31; index < rows.length; index++) {
        const row = rows[index];
        const columns = row.split("#");
        if (columns.length >= 5) {
          const unCode = columns[0].substring(0, 7); // First 8 characters of the first column
          const code = columns[0];
          if (!uniqueCodes.has(unCode)) {
            uniqueCodes.add(unCode);
            generatePortfolioItem(
              counter++,
              code,
              columns[2],
              columns[4].replace(/,/g, ".")
            );
          }
        }
      }
    })
    .catch((error) => console.error("Error fetching CSV:", error));
}

//fetchAndGenerateRemainingItems();

let itemLineIdCounter = 1; // Initialize item line ID counter
let finalItems = "";

window.onload = function () {
  localStorage.setItem("cartItems", JSON.stringify([]));
};
let accessToken;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    accessToken = await getToken(); // Assign access token retrieved from getToken to the global accessToken variable
    console.log("Access token:", accessToken);
    // Use the access token for subsequent requests
  } catch (error) {
    console.error("Failed to get access token:", error);
  }
});

var addToCartButtonElements;

function initiateAddToCart() {
  addToCartButtonElements = document.querySelectorAll(".addToCartButton");
  addToCartButtonElements.forEach(function (button) {
    button.addEventListener("click", function (event) {
      const itemCode = event.target.getAttribute("item");
      const basePrice = parseFloat(event.target.getAttribute("item-value"));
      const itemName = event.target.getAttribute("item-name");
      addToCart(itemCode, basePrice);
      updateRemoveButton(itemCode);
      openPopup("successfully added item: " + itemName, 3000);
    });
  });
}

function addToCart(
  itemCodeVar,
  quantityVar,
  unitPrice,
  priceWithDiscount,
  warehouseIdVar,
  finalPrice,
  description
) {
  const existingItems = localStorage.getItem("cartItems");
  const cartItems = existingItems ? JSON.parse(existingItems) : [];
  const existingItemIndex = cartItems.findIndex(
    (item) => item.item.itemCode === itemCodeVar
  );
  if (existingItemIndex !== -1) {
    cartItems[existingItemIndex].quantity++;
  } else {
    const item = {
      itemCode: itemCodeVar,
    };

    const cartItem = {
      itemLineId: itemLineIdCounter++,
      item: item,
      quantity: quantityVar,
      price: {
        basePrice: unitPrice,
        currentPrice: priceWithDiscount,
      },
      lineAmount: {
        currency: "EUR",
        value: finalPrice,
      },
      inventoryOrigin: {
        warehouseId: warehouseIdVar,
      },
    };

    cartItems.push(cartItem);
  }
  console.log(cartItems);
  openPopup("successfully added item: " + description, 3000);

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}
function initiateRemove() {
  var removeFromCartButtonElements =
    document.querySelectorAll(".removeFromBasket");
  removeFromCartButtonElements.forEach(function (button) {
    button.addEventListener("click", function (event) {
      const itemCode = event.target.getAttribute("item"); // Get item code from button attribute
      const basePrice = parseFloat(event.target.getAttribute("item-value")); // Get base price from button attribute
      const itemName = event.target.getAttribute("item-name");
      removeFromCart(itemCode, basePrice);
      updateRemoveButton(itemCode); // Update the state of remove buttons after removing an item
      openPopup("successfully removed item: " + itemName, 3000);
    });
  });
}

function removeFromCart(itemCode, basePrice) {
  const existingItems = localStorage.getItem("cartItems");
  const cartItems = existingItems ? JSON.parse(existingItems) : [];
  const existingItemIndex = cartItems.findIndex(
    (item) => item.item.itemCode === itemCode
  );

  // If the item exists in the cart and its quantity is greater than 0, decrease the quantity by 1
  if (existingItemIndex !== -1) {
    if (cartItems[existingItemIndex].quantity > 0) {
      cartItems[existingItemIndex].quantity--;
    }

    // If the quantity becomes 0, remove the item from the cart
    if (cartItems[existingItemIndex].quantity === 0) {
      cartItems.splice(existingItemIndex, 1);
    }

    // Update localStorage with the updated cart items
    console.log(cartItems);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }
}

// Function to update the state of a specific remove button based on cart items
function updateRemoveButton(itemCode) {
  // Retrieve cart items from localStorage
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  // Find the item in cartItems
  const cartItem = cartItems.find((item) => item.item.itemCode === itemCode);

  // Get the remove button with the matching item code
  const removeButton = document.querySelector(
    `.removeFromBasket[item="${itemCode}"]`
  );

  // Check if the remove button exists
  if (removeButton) {
    // Check if the item exists in the cart and its quantity is greater than 0
    const itemExistsAndHasQuantity = cartItem && cartItem.quantity > 0;

    // Enable or disable the button based on item existence and quantity
    removeButton.disabled = !itemExistsAndHasQuantity;
  } else {
    console.error(`Remove button for item ${itemCode} not found.`);
  }
}

function openPopup(message, duration) {
  const popup = document.getElementById("popup");
  const popupMessage = document.getElementById("popupMessage");

  popupMessage.textContent = message;
  popup.style.animation = "fadeIn 0.5s forwards"; // Apply fade in animation
  popup.style.display = "block";
  // Automatically close the popup after the specified duration
  setTimeout(function () {
    popup.style.animation = "fadeOut 0.5s forwards"; // Apply fade out animation
    setTimeout(function () {
      popup.style.display = "none"; // Hide the popup after animation completes
    }, 500); // Wait for fade out animation duration
  }, duration);
}

async function getToken() {
  return new Promise((resolve, reject) => {
    var tokenRequest = new XMLHttpRequest();
    // var tokenUrl = 'https://proxyserver-z74x.onrender.com/et/as/connect/token'; // Proxy server URL
    var tokenUrl = "http://localhost:3000/et/as/connect/token"; // Proxy server URL
    var tokenData =
      "client_id=CegidRetailResourceFlowClient&username=AI@90478305_003_TEST&password=1234&grant_type=password&scope=RetailBackendApi offline_access"; // Construct x-www-form-urlencoded body

    tokenRequest.open("POST", tokenUrl, true);
    tokenRequest.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );

    tokenRequest.onreadystatechange = function () {
      if (tokenRequest.readyState === 4) {
        if (tokenRequest.status === 200) {
          var tokenResponse = JSON.parse(tokenRequest.responseText);
          accessToken = tokenResponse.access_token;
          resolve(accessToken); // Resolve the promise with the access token
        } else {
          console.error("Error:", "error with token");
          reject("Failed to get access token"); // Reject the promise if there's an error
        }
      }
    };

    tokenRequest.send(tokenData);
  });
}

function closeAllModalsOnClickOutside() {
  document.addEventListener("click", function (event) {
    const body = document.body;

    // Check if the clicked element is outside any modal
    if (!event.target.closest(".modal-dialog")) {
      // Find all modals that are currently shown
      const shownModals = document.querySelectorAll(
        ".portfolio-modal.modal.fade.show"
      );

      // Iterate over each shown modal and remove the 'show' class
      shownModals.forEach(function (modal) {
        modal.classList.remove("show");
        modal.style.display = "none"; // Ensure modal is hidden
        modal.removeAttribute("role");
        modal.removeAttribute("aria-modal");
        modal.setAttribute("aria-hidden", "true");
      });

      const backdrop = document.querySelector(".modal-backdrop.fade.show");
      if (backdrop) {
        backdrop.parentNode.removeChild(backdrop);
      }
      // Remove the modal-backdrop if exists

      // Remove 'modal-open' class from body
      body.classList.remove("modal-open");
      body.setAttribute("style", "");
    }
  });
}
// Call the function to initialize the click outside modal close functionality
closeAllModalsOnClickOutside();

document.getElementById("viewBasketAll").addEventListener("click", function () {
  var xhr = new XMLHttpRequest();

  // var postUrl = 'https://proxyserver-z74x.onrender.com/et/pos/external-basket/v1'; // Proxy server URL
  var postUrl = "http://localhost:3000/et/pos/external-basket/v1"; // Proxy server URL
  //var postUrl = 'https://retail-services.cegid.cloud/t/pos/external-basket/v1'; // Proxy server URL
  xhr.open("POST", postUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken); // Include access token in the request headers

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log("POST request successful");
        var response = JSON.parse(xhr.responseText);
        if (response.externalBasketUrl) {
          window.location.href = response.externalBasketUrl;
        }
      } else {
        console.error("Error:", xhr.status);
        // Handle error if needed
      }
    }
  };

  // Retrieve cart items from localStorage
  var cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

  // Filter out items with quantity greater than 0
  cartItems = cartItems.filter((item) => item.quantity > 0);

  // Re-enumerate itemLineId
  cartItems.forEach((item, index) => {
    item.itemLineId = index + 1; // Increment index by 1
  });

  var customerId = "BR00100002";
  var postData = {
    externalReference: "SimpleSale",
    basketType: "RECEIPT",
    customer: {
      customerCode: customerId, // Change the value dynamically here
    },
    itemLines: cartItems,
    store: {
      storeId: "FR004",
    },
  };

  // Convert postData to JSON string
  var postDataString = JSON.stringify(postData);

  console.log(postDataString);

  // this code will run after 5 seconds
  setTimeout(function () {
    console.log("World");
  }, 100000);
  xhr.send(postDataString);
});
