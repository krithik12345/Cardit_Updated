// Fetch the userId from the server dynamically
async function getUserId() {
    try {
        const response = await fetch('/get-user-id');
        const data = await response.json();

        if (response.ok) {
            return data.userId;  // Return the fetched userId
        } else {
            console.error('Failed to fetch user ID:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user ID:', error);
        return null;
    }
}

// Function to get the user's saved cards from the database
async function getSavedCards(userId) {
    try {
        const response = await fetch(`/get-saved-cards?userId=${userId}`);
        const data = await response.json();

        if (response.ok) {
            return data.savedCards;  // Return saved cards array
        } else {
            console.error('Failed to fetch saved cards:', data.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching saved cards:', error);
        return [];
    }
}

// referencing input vals
let authorinp = document.getElementById("AuthorInput");
let taglineinp = document.getElementById("TaglineInput");
let contentinp = document.getElementById("CardContentInput");

// referencing buttons
const submitcard = document.getElementById("cardbtn");

// referencing body alert
const alertbody = document.getElementById("alertplaceactual");

// referencing card body for active and saved cards
const cardbody = document.getElementById("active-cards");
const savedCardBody = document.getElementById("saved-cards");

function Card(author, tag, content) {
    this.author = author;
    this.tag = tag;
    this.content = content;

    this.getAuthor = function() {
        return this.author;
    }

    this.getTag = function() {
        return this.tag;
    }

    this.getContent = function() {
        return this.content;
    }

    // To compare cards easily
    this.isEqualTo = function(otherCard) {
        return this.author === otherCard.author &&
               this.tag === otherCard.tag &&
               this.content === otherCard.content;
    }
}

function AddCard(cardobj, targetBody) {
    let currauthor = cardobj.getAuthor();
    let currtag = cardobj.getTag();
    let currcontent = cardobj.getContent();
    
    let tempcard = document.createElement('li');
    let tempcardcontent = `<p>${currauthor} states "${currtag}" because "${currcontent}"</p>`;
    tempcard.innerHTML = tempcardcontent;
    targetBody.appendChild(tempcard);
}

// Function to display saved cards from the database on page load
async function displaySavedCards() {
    let userId = await getUserId();

    if (!userId) {
        console.error('No user ID found. Unable to display saved cards.');
        return;
    }

    let savedCards = await getSavedCards(userId);

    savedCards.forEach(card => {
        let savedCard = new Card(card.author, card.tag, card.content);
        AddCard(savedCard, savedCardBody);  // Append saved card to the "Saved Cards" section
    });
}

// Function to send the card to MongoDB
async function saveCardToDB(card, userId) {
    try {
        const response = await fetch('/save-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, card }) 
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log(data.message);
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error('Error saving card:', error);
    }
}

// Function to check if a card already exists in the user's saved cards
function isDuplicateCard(newCard, savedCards) {
    return savedCards.some(savedCard => {
        return newCard.author === savedCard.author &&
               newCard.tag === savedCard.tag &&
               newCard.content === savedCard.content;
    });
}

// Function to show custom confirmation prompt
function showConfirmationPrompt(onYes, onNo) {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
    confirmationDiv.setAttribute('role', 'alert');
    
    const questionText = document.createElement('p');
    questionText.textContent = 'Do you want to save the card to the database?';

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes';
    yesButton.classList.add('btn', 'btn-success', 'mx-2');
    yesButton.onclick = function() {
        onYes();
        confirmationDiv.remove(); 
    };

    const noButton = document.createElement('button');
    noButton.textContent = 'No';
    noButton.classList.add('btn', 'btn-danger', 'mx-2');
    noButton.onclick = function() {
        onNo();
        confirmationDiv.remove(); 
    };

    confirmationDiv.appendChild(questionText);
    confirmationDiv.appendChild(yesButton);
    confirmationDiv.appendChild(noButton);
    alertbody.appendChild(confirmationDiv);
}

let activecards = [];
submitcard.addEventListener('click', async function(event) {
    event.preventDefault();
    
    if (!authorinp.value || !taglineinp.value || !contentinp.value) {
        alert("Please fill out all fields for the card.");
    } else {
        let tempCard = new Card(authorinp.value, taglineinp.value, contentinp.value);

        let userId = await getUserId();

        if (!userId) {
            alert('Unable to save the card. Please try logging in again.');
            return;
        }

        let savedCards = await getSavedCards(userId);

        if (isDuplicateCard(tempCard, savedCards)) {
            alert('This card already exists in your saved cards and won\'t be saved.');
            return;
        }

        AddCard(tempCard, cardbody);  // Add the card to the "Active Cards" section

        showConfirmationPrompt(async function() {
            await saveCardToDB(tempCard, userId);

            let alertelem = document.createElement('div');
            alertelem.classList.add('alert', 'alert-success', 'alert-dismissible', 'fade', 'show');
            alertelem.setAttribute('role', 'alert');
            const strongElement = document.createElement('strong');
            strongElement.textContent = 'You have successfully created and saved the card!';
            const messageElement = document.createTextNode(' Scroll below to access the dashboard. ');
            const closeButton = document.createElement('button');
            closeButton.setAttribute('type', 'button');
            closeButton.classList.add('btn-close');
            closeButton.setAttribute('data-bs-dismiss', 'alert');
            closeButton.setAttribute('aria-label', 'Close');
            alertelem.appendChild(strongElement);
            alertelem.appendChild(messageElement);
            alertelem.appendChild(closeButton);
            alertbody.appendChild(alertelem);

            setTimeout(function() {
                alertbody.removeChild(alertelem);
            }, 3000);
        }, function() {
            console.log('Card not saved to MongoDB, but it was added to the dashboard.');
        });
    }
});

// Call the function to display saved cards on page load
document.addEventListener('DOMContentLoaded', displaySavedCards);
