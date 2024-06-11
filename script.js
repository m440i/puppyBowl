const playerContainer = document.getElementById("all-players-container");
const newPlayerFormContainer = document.getElementById("new-player-form");

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = "2401-ftb-et-web-pt";
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${APIURL}/players`);
    const result = await response.json();

    return result.data.players;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

const fetchSinglePlayer = async (playerId) => {
  try {
    const response = await fetch(`${APIURL}/players/${playerId}`);
    const result = await response.json();
    if (result.success) {
      return result.data.player;
    }
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

const addNewPlayer = async (playerObj) => {
  try {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    };

    const response = await fetch(`${APIURL}/players`, requestOptions);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `Failed to add player. Status code: ${response.status}. Error message: ${errorMessage}`
      );
    }

    console.log("Player added successfully!");
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

// example
const newPlayer = {
  id: "1234",
  name: "BigPapa",
  breed: "GSD",
  status: "bench",
};

const removePlayer = async (playerId) => {
  try {
    const requestOptions = {
      method: "DELETE",
    };

    const response = await fetch(
      `${APIURL}/players/${playerId}`,
      requestOptions
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(
        `Failed to remove player ${playerId}. Status code: ${response.status}. Error message: ${errorMessage}`
      );
    }
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

// Example
const playerIdToRemove = 1234;

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players.
 *
 * Then it takes that larger string of HTML and adds it to the DOM.
 *
 * It also adds event listeners to the buttons in each player card.
 *
 * The event listeners are for the "See details" and "Remove from roster" buttons.
 *
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player.
 *
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster.
 *
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
  try {
    // Container to hold the HTML for all players
    let playerContainerHTML = "";

    // Loop through each player in the playerList array
    playerList.forEach((player) => {
      // HTML for the player card
      const playerCardHTML = `
        <div class="player-card">
          <h2>${player.name}</h2>
          <p>Id: ${player.id}</p>
          <p>Breed: ${player.breed}</p>
          <p>Status: ${player.status}</p>
          <button class="see-details-btn" data-player-id="${player.id}">See details</button>
          <button class="remove-btn" data-player-id="${player.id}">Remove from roster</button>
        </div>
      `;

      // Add event listener for "See details" button
      const seeDetailsBtn = document.querySelector(
        `.see-details-btn[data-player-id="${player.id}"]`
      );
      seeDetailsBtn.addEventListener("click", () => {
        fetchSinglePlayer(player.id);
      });

      // Add event listener for "Remove from roster" button
      const removeBtn = document.querySelector(
        `.remove-btn[data-player-id="${player.id}"]`
      );
      removeBtn.addEventListener("click", () => {
        removePlayer(player.id);
      });

      // Append player card HTML to the container
      playerContainerHTML += playerCardHTML;
    });

    // Add the player container HTML to the DOM
    const playerContainer = document.querySelector("#all-players-container");
    playerContainer.innerHTML = playerContainerHTML;

    return playerContainerHTML;
  } catch (err) {
    console.error("Uh oh, trouble rendering players!", err);
  }
};

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
    const formHTML = `
      <form id="new-player-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required><br>
        
        <label for="id">Id:</label>
        <input type="number" id="id" name="id" required><br>
        
        <label for="breed">Breed:</label>
        <input type="text" id="breed" name="breed" required><br>
        
        <label for="status">Status:</label>
        <input type="text" id="status" name="status" required><br>
        
        <button type="submit">Add Player</button>
      </form>
    `;

    // Render the form to the DOM
    const formContainer = document.querySelector("#new-player-form");
    formContainer.innerHTML = formHTML;

    // Add event listener for form submission
    const newPlayerForm = document.querySelector("#new-player-form");
    newPlayerForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent the default form submission behavior

      const formData = new FormData(newPlayerForm);
      const newPlayer = {
        name: formData.get("name"),
        id: formData.get("id"),
      };

      try {
        // Add the new player to the database
        await addNewPlayer(newPlayer);

        // Fetch all players from the database
        const players = await fetchAllPlayers();

        // Render all players to the DOM
        renderAllPlayers(players);
      } catch (error) {
        console.error("Error adding new player:", error);
      }
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const init = async () => {
  const players = await fetchAllPlayers();

  // Check if players array is empty or undefined
  if (!players || players.length === 0) {
    console.log("No players found.");
    return;
  }
  renderAllPlayers(players);

  renderNewPlayerForm();
};

init();
