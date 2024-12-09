document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript geladen und bereit!");

    // Überprüfen, ob der Kartenbereich existiert
    const mapDiv = document.getElementById("map");
    if (mapDiv) {
        console.log("Kartenbereich gefunden.");

        // Initialisiere die Leaflet-Karte
        const map = L.map("map").setView([51.1657, 10.4515], 6); // Beispielkoordinaten für Deutschland

        // Füge eine Karte von OpenStreetMap hinzu
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(map);

        console.log("Karte erfolgreich geladen!");
    } else {
        console.error("Kartenbereich fehlt!");
    }
});