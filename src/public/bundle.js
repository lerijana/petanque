(() => {
  // src/public/script.js
  var map;
  var marker;
  var defaultPosition = [51.1657, 10.4515];
  document.addEventListener("DOMContentLoaded", function() {
    initMap();
    loadPlaces();
    loadActiveGames();
    loadFinishedGames();
    const showAddPlaceFormButton = document.getElementById("showAddPlaceForm");
    const addPlaceForm = document.getElementById("addPlaceForm");
    if (showAddPlaceFormButton && addPlaceForm) {
      showAddPlaceFormButton.addEventListener("click", () => {
        addPlaceForm.classList.toggle("hidden");
      });
    }
    const showNewGameFormButton = document.getElementById("showNewGameForm");
    const gameForm = document.getElementById("gameForm");
    if (showNewGameFormButton && gameForm) {
      showNewGameFormButton.addEventListener("click", () => {
        gameForm.classList.toggle("hidden");
      });
    }
    const addPlaceButton = document.getElementById("addPlaceButton");
    if (addPlaceButton) {
      addPlaceButton.addEventListener("click", addPlace);
    }
  });
  function initMap() {
    if (!document.getElementById("map")) {
      console.error("Map container not found");
      return;
    }
    map = L.map("map").setView(defaultPosition, 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: " OpenStreetMap contributors"
    }).addTo(map);
    map.on("click", function(e) {
      const addPlaceForm = document.getElementById("addPlaceForm");
      if (!addPlaceForm.classList.contains("hidden")) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        document.getElementById("latitude").value = lat.toFixed(6);
        document.getElementById("longitude").value = lng.toFixed(6);
        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = L.marker(e.latlng).addTo(map);
        }
      }
    });
  }
  async function loadPlaces() {
    try {
      const response = await fetch("/api/places");
      const data = await response.json();
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      const platzSelect = document.getElementById("platz");
      platzSelect.innerHTML = '<option value="">Bitte w\xE4hlen Sie einen Platz</option>';
      data.places.forEach((place) => {
        const option = document.createElement("option");
        option.value = place._id;
        option.textContent = place.name;
        platzSelect.appendChild(option);
        if (map && place.latitude && place.longitude) {
          const marker2 = L.marker([place.latitude, place.longitude]);
          const popupContent = document.createElement("div");
          popupContent.className = "place-popup";
          popupContent.innerHTML = `
                    <h3>${place.name}</h3>
                    <p><strong>Typ:</strong> ${place.type}</p>
                    <p><strong>Zugang:</strong> ${place.access}</p>
                    <p><strong>Felder:</strong> ${place.field_count}</p>
                    ${place.notes ? `<p><strong>Notizen:</strong> ${place.notes}</p>` : ""}
                    <div class="popup-actions">
                        <button class="edit-button">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button class="delete-button">
                            <i class="fas fa-trash"></i> L\xF6schen
                        </button>
                    </div>
                `;
          const editButton = popupContent.querySelector(".edit-button");
          const deleteButton = popupContent.querySelector(".delete-button");
          editButton.addEventListener("click", () => {
            editPlace(place._id);
          });
          deleteButton.addEventListener("click", () => {
            deletePlace(place._id);
          });
          marker2.bindPopup(popupContent);
          marker2.addTo(map);
        }
      });
    } catch (error) {
      console.error("Fehler beim Laden der Pl\xE4tze:", error);
    }
  }
  async function addPlace() {
    const name = document.getElementById("name").value;
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const access = document.getElementById("access").value;
    const type = document.getElementById("type").value;
    const field_count = parseInt(document.getElementById("field_count").value);
    const notes = document.getElementById("notes").value;
    if (!name || isNaN(latitude) || isNaN(longitude) || !access || !type || isNaN(field_count)) {
      alert("Bitte f\xFCllen Sie alle Pflichtfelder aus");
      return;
    }
    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          latitude,
          longitude,
          access,
          type,
          field_count,
          notes
        })
      });
      if (!response.ok) {
        throw new Error("Fehler beim Hinzuf\xFCgen des Platzes");
      }
      document.getElementById("name").value = "";
      document.getElementById("latitude").value = "";
      document.getElementById("longitude").value = "";
      document.getElementById("access").value = "\xD6ffentlich";
      document.getElementById("type").value = "Outdoor";
      document.getElementById("field_count").value = "1";
      document.getElementById("notes").value = "";
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      loadPlaces();
      alert("Platz erfolgreich hinzugef\xFCgt");
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Hinzuf\xFCgen des Platzes");
    }
  }
  async function editPlace(placeId) {
    try {
      const response = await fetch(`/api/places/${placeId}`);
      if (!response.ok) {
        throw new Error("Fehler beim Laden des Platzes");
      }
      const place = await response.json();
      document.getElementById("edit-name").value = place.name;
      document.getElementById("edit-latitude").value = place.latitude;
      document.getElementById("edit-longitude").value = place.longitude;
      document.getElementById("edit-access").value = place.access;
      document.getElementById("edit-type").value = place.type;
      document.getElementById("edit-field_count").value = place.field_count;
      document.getElementById("edit-notes").value = place.notes || "";
      const editPlaceForm = document.getElementById("editPlaceForm");
      editPlaceForm.classList.remove("hidden");
      editPlaceForm.classList.add("edit-mode");
      editPlaceForm.scrollIntoView({ behavior: "smooth" });
      const updateButton = document.getElementById("updatePlaceButton");
      const cancelButton = document.getElementById("cancelEditButton");
      const newUpdateButton = updateButton.cloneNode(true);
      const newCancelButton = cancelButton.cloneNode(true);
      updateButton.parentNode.replaceChild(newUpdateButton, updateButton);
      cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
      newUpdateButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await updatePlace(placeId);
      });
      newCancelButton.addEventListener("click", (e) => {
        e.preventDefault();
        cancelEdit();
      });
      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker([place.latitude, place.longitude]).addTo(map);
      map.setView([place.latitude, place.longitude], 13);
      map.closePopup();
    } catch (error) {
      console.error("Fehler beim Laden des Platzes:", error);
      alert("Fehler beim Laden des Platzes");
    }
  }
  function cancelEdit() {
    const editPlaceForm = document.getElementById("editPlaceForm");
    editPlaceForm.classList.add("hidden");
    editPlaceForm.classList.remove("edit-mode");
    document.getElementById("edit-name").value = "";
    document.getElementById("edit-latitude").value = "";
    document.getElementById("edit-longitude").value = "";
    document.getElementById("edit-access").value = "\xD6ffentlich";
    document.getElementById("edit-type").value = "Outdoor";
    document.getElementById("edit-field_count").value = "1";
    document.getElementById("edit-notes").value = "";
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
  }
  async function updatePlace(placeId) {
    const name = document.getElementById("edit-name").value;
    const latitude = parseFloat(document.getElementById("edit-latitude").value);
    const longitude = parseFloat(document.getElementById("edit-longitude").value);
    const access = document.getElementById("edit-access").value;
    const type = document.getElementById("edit-type").value;
    const field_count = parseInt(document.getElementById("edit-field_count").value);
    const notes = document.getElementById("edit-notes").value;
    if (!name || isNaN(latitude) || isNaN(longitude) || !access || !type || isNaN(field_count)) {
      alert("Bitte f\xFCllen Sie alle Pflichtfelder aus");
      return;
    }
    try {
      const response = await fetch(`/api/places/${placeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          latitude,
          longitude,
          access,
          type,
          field_count,
          notes
        })
      });
      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren des Platzes");
      }
      const editPlaceForm = document.getElementById("editPlaceForm");
      editPlaceForm.classList.add("hidden");
      editPlaceForm.classList.remove("edit-mode");
      document.getElementById("edit-name").value = "";
      document.getElementById("edit-latitude").value = "";
      document.getElementById("edit-longitude").value = "";
      document.getElementById("edit-access").value = "\xD6ffentlich";
      document.getElementById("edit-type").value = "Outdoor";
      document.getElementById("edit-field_count").value = "1";
      document.getElementById("edit-notes").value = "";
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      loadPlaces();
      alert("Platz erfolgreich aktualisiert");
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Aktualisieren des Platzes");
    }
  }
  async function deletePlace(placeId) {
    if (!confirm("M\xF6chten Sie diesen Platz wirklich l\xF6schen?")) {
      return;
    }
    try {
      const response = await fetch(`/api/places/${placeId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Fehler beim L\xF6schen des Platzes");
      }
      loadPlaces();
      alert("Platz erfolgreich gel\xF6scht");
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim L\xF6schen des Platzes");
    }
  }
  async function startGame() {
    const team1 = document.getElementById("team1").value.trim();
    const team2 = document.getElementById("team2").value.trim();
    const platzId = document.getElementById("platz").value;
    if (!team1 || !team2) {
      alert("Bitte geben Sie beide Teamnamen ein");
      return;
    }
    if (!platzId) {
      alert("Bitte w\xE4hlen Sie einen Platz aus");
      return;
    }
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teams: [team1, team2],
          platz: platzId
        })
      });
      if (!response.ok) {
        throw new Error("Fehler beim Erstellen des Spiels");
      }
      document.getElementById("team1").value = "";
      document.getElementById("team2").value = "";
      document.getElementById("platz").value = "";
      loadActiveGames();
    } catch (error) {
      console.error("Fehler beim Starten des Spiels:", error);
      alert("Fehler beim Starten des Spiels");
    }
  }
  async function updateScore(gameId, team, points) {
    try {
      const response = await fetch(`/api/games/${gameId}/score`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ team, change: points })
      });
      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren des Spielstands");
      }
      loadActiveGames();
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Aktualisieren des Spielstands");
    }
  }
  async function endGame(gameId) {
    if (!confirm("M\xF6chten Sie das Spiel wirklich beenden?")) {
      return;
    }
    try {
      const response = await fetch(`/api/games/${gameId}/end`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error("Fehler beim Beenden des Spiels");
      }
      loadActiveGames();
      loadFinishedGames();
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim Beenden des Spiels");
    }
  }
  async function deleteGame(gameId) {
    if (!confirm("M\xF6chten Sie das Spiel wirklich l\xF6schen?")) {
      return;
    }
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Fehler beim L\xF6schen des Spiels");
      }
      loadActiveGames();
      loadFinishedGames();
    } catch (error) {
      console.error("Fehler:", error);
      alert("Fehler beim L\xF6schen des Spiels");
    }
  }
  async function loadActiveGames() {
    try {
      const response = await fetch("/api/games?status=laufend");
      const data = await response.json();
      const activeGamesContainer = document.getElementById("activeGames");
      activeGamesContainer.innerHTML = "";
      if (!data.spiele || data.spiele.length === 0) {
        activeGamesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dice"></i>
                    <p>Keine aktiven Spiele</p>
                </div>
            `;
        return;
      }
      const gamesSection = document.createElement("div");
      gamesSection.className = "games-section";
      gamesSection.innerHTML = `
            <h2><i class="fas fa-play-circle"></i> Aktive Spiele</h2>
        `;
      const gamesContainer = document.createElement("div");
      gamesContainer.className = "games-container";
      data.spiele.forEach((game) => {
        const gameElement = document.createElement("div");
        gameElement.className = "game-item active";
        const currentScore = game.punkteVerlauf[game.punkteVerlauf.length - 1];
        gameElement.innerHTML = `
                <div class="game-header">
                    <div class="game-title">
                        <div class="teams">${game.teams[0]} vs. ${game.teams[1]}</div>
                        <div class="score">${currentScore.mannschaft1Punkte}:${currentScore.mannschaft2Punkte}</div>
                    </div>
                </div>
                ${game.platz ? `
                    <div class="game-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${game.platz.name}
                    </div>
                ` : ""}
                <div class="score-controls">
                    <div class="team-score">
                        <div class="team-name">${game.teams[0]}</div>
                        <div class="score-buttons">
                            <button onclick="updateScore('${game._id}', 1, 1)" class="score-btn plus">+1</button>
                            <button onclick="updateScore('${game._id}', 1, 2)" class="score-btn plus">+2</button>
                            <button onclick="updateScore('${game._id}', 1, 3)" class="score-btn plus">+3</button>
                            <button onclick="updateScore('${game._id}', 1, -1)" class="score-btn minus">-1</button>
                        </div>
                    </div>
                    <div class="team-score">
                        <div class="team-name">${game.teams[1]}</div>
                        <div class="score-buttons">
                            <button onclick="updateScore('${game._id}', 2, 1)" class="score-btn plus">+1</button>
                            <button onclick="updateScore('${game._id}', 2, 2)" class="score-btn plus">+2</button>
                            <button onclick="updateScore('${game._id}', 2, 3)" class="score-btn plus">+3</button>
                            <button onclick="updateScore('${game._id}', 2, -1)" class="score-btn minus">-1</button>
                        </div>
                    </div>
                </div>
                <div class="game-actions">
                    <button onclick="endGame('${game._id}')" class="control-button finish">
                        <i class="fas fa-flag-checkered"></i>
                        Spiel beenden
                    </button>
                    <button onclick="deleteGame('${game._id}')" class="control-button delete">
                        <i class="fas fa-trash"></i>
                        L\xF6schen
                    </button>
                </div>
            `;
        gamesContainer.appendChild(gameElement);
      });
      gamesSection.appendChild(gamesContainer);
      activeGamesContainer.appendChild(gamesSection);
    } catch (error) {
      console.error("Fehler beim Laden der aktiven Spiele:", error);
      const activeGamesContainer = document.getElementById("activeGames");
      activeGamesContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Fehler beim Laden der Spiele</p>
            </div>
        `;
    }
  }
  async function loadFinishedGames(page = 1) {
    try {
      const response = await fetch(`/api/games?status=beendet&page=${page}&limit=6`);
      const data = await response.json();
      const finishedGamesContainer = document.getElementById("finishedGames");
      finishedGamesContainer.innerHTML = "";
      if (!data.spiele || data.spiele.length === 0) {
        finishedGamesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>Keine beendeten Spiele</p>
                </div>
            `;
        return;
      }
      const gamesSection = document.createElement("div");
      gamesSection.className = "games-section";
      gamesSection.innerHTML = `
            <h2><i class="fas fa-flag-checkered"></i> Beendete Spiele</h2>
        `;
      const gamesContainer = document.createElement("div");
      gamesContainer.className = "games-container";
      data.spiele.forEach((game) => {
        const gameElement = document.createElement("div");
        gameElement.className = "game-item finished";
        const finalScore = game.punkteVerlauf[game.punkteVerlauf.length - 1];
        const winner = finalScore.mannschaft1Punkte > finalScore.mannschaft2Punkte ? game.teams[0] : game.teams[1];
        const endDate = new Date(game.endZeit);
        const formattedDate = endDate.toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        const punkteVerlauf = game.punkteVerlauf.map((score, index) => `
                <div class="round">
                    <div class="round-number">Runde ${index + 1}</div>
                    <div class="round-score">${score.mannschaft1Punkte}:${score.mannschaft2Punkte}</div>
                </div>
            `).join("");
        gameElement.innerHTML = `
                <div class="game-header">
                    <div class="game-title">
                        <div class="teams">${game.teams[0]} vs. ${game.teams[1]}</div>
                        <div class="final-score">${finalScore.mannschaft1Punkte}:${finalScore.mannschaft2Punkte}</div>
                    </div>
                    <div class="winner-badge">
                        <i class="fas fa-trophy"></i>
                        ${winner}
                    </div>
                </div>
                ${game.platz ? `
                    <div class="game-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${game.platz.name}
                    </div>
                ` : ""}
                <div class="game-info">
                    <div class="end-time">
                        <i class="far fa-clock"></i>
                        Beendet am ${formattedDate}
                    </div>
                    <div class="rounds-history">
                        ${punkteVerlauf}
                    </div>
                </div>
                <button onclick="deleteGame('${game._id}')" class="control-button delete">
                    <i class="fas fa-trash"></i>
                    L\xF6schen
                </button>
            `;
        gamesContainer.appendChild(gameElement);
      });
      gamesSection.appendChild(gamesContainer);
      const totalPages = Math.ceil(data.total / data.limit);
      if (totalPages > 1) {
        const pagination = document.createElement("div");
        pagination.className = "pagination";
        let paginationHTML = "";
        paginationHTML += `
                <button class="page-button${page <= 1 ? " disabled" : ""}" 
                        onclick="${page <= 1 ? "" : `loadFinishedGames(${page - 1})`}"
                        ${page <= 1 ? "disabled" : ""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        for (let i = 1; i <= totalPages; i++) {
          if (i === 1 || // Первая страница
          i === totalPages || // Последняя страница
          i >= page - 1 && i <= page + 1) {
            paginationHTML += `
                        <button class="page-button${i === page ? " active" : ""}" 
                                onclick="loadFinishedGames(${i})">
                            ${i}
                        </button>
                    `;
          } else if (i === page - 2 || // Многоточие перед текущей страницей
          i === page + 2) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
          }
        }
        paginationHTML += `
                <button class="page-button${page >= totalPages ? " disabled" : ""}" 
                        onclick="${page >= totalPages ? "" : `loadFinishedGames(${page + 1})`}"
                        ${page >= totalPages ? "disabled" : ""}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        pagination.innerHTML = paginationHTML;
        gamesSection.appendChild(pagination);
      }
      finishedGamesContainer.appendChild(gamesSection);
    } catch (error) {
      console.error("Fehler beim Laden der beendeten Spiele:", error);
      const finishedGamesContainer = document.getElementById("finishedGames");
      finishedGamesContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Fehler beim Laden der Spiele</p>
            </div>
        `;
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    loadActiveGames();
    loadFinishedGames();
  });
  window.startGame = startGame;
  window.updateScore = updateScore;
  window.endGame = endGame;
  window.deleteGame = deleteGame;
  window.loadFinishedGames = loadFinishedGames;
  window.editPlace = editPlace;
  window.deletePlace = deletePlace;
})();
