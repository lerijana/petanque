(()=>{var r,u,w=[51.1657,10.4515],f=L.divIcon({className:"custom-marker",html:'<div class="marker-pin"></div>',iconSize:[30,42],iconAnchor:[15,42]});document.addEventListener("DOMContentLoaded",function(){P(),h(),m(),p();let e=document.getElementById("showAddPlaceForm"),s=document.getElementById("addPlaceForm");e&&s&&e.addEventListener("click",()=>{s.classList.toggle("hidden")});let n=document.getElementById("showNewGameForm"),t=document.getElementById("gameForm");n&&t&&n.addEventListener("click",()=>{t.classList.toggle("hidden")});let i=document.getElementById("addPlaceButton");i&&i.addEventListener("click",F)});function P(){if(!document.getElementById("map")){console.error("Map container not found");return}r=L.map("map").setView(w,6),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:" OpenStreetMap contributors"}).addTo(r),r.on("click",function(e){if(!document.getElementById("addPlaceForm").classList.contains("hidden")){let n=e.latlng.lat,t=e.latlng.lng;document.getElementById("latitude").value=n.toFixed(6),document.getElementById("longitude").value=t.toFixed(6),u?u.setLatLng(e.latlng):u=L.marker(e.latlng,{icon:f}).addTo(r)}})}async function h(){try{let s=await(await fetch("/api/places")).json();r.eachLayer(t=>{t instanceof L.Marker&&r.removeLayer(t)});let n=document.getElementById("platz");n.innerHTML='<option value="">Bitte w\xE4hlen Sie einen Platz</option>',s.places.forEach(t=>{let i=document.createElement("option");if(i.value=t._id,i.textContent=t.name,n.appendChild(i),r&&t.latitude&&t.longitude){let a=L.marker([t.latitude,t.longitude],{icon:f}),l=document.createElement("div");l.className="place-popup",l.innerHTML=`
                    <h3>${t.name}</h3>
                    <p><strong>Typ:</strong> ${t.type}</p>
                    <p><strong>Zugang:</strong> ${t.access}</p>
                    <p><strong>Felder:</strong> ${t.fieldCount}</p>
                    ${t.notes?`<p><strong>Notizen:</strong> ${t.notes}</p>`:""}
                    <div class="popup-actions">
                        <button class="edit-button">
                            <i class="fas fa-edit"></i> Bearbeiten
                        </button>
                        <button class="delete-button">
                            <i class="fas fa-trash"></i> L\xF6schen
                        </button>
                    </div>
                `;let o=l.querySelector(".edit-button"),c=l.querySelector(".delete-button");o.addEventListener("click",()=>{y(t._id)}),c.addEventListener("click",()=>{g(t._id)}),a.bindPopup(l),a.addTo(r)}})}catch(e){console.error("Fehler beim Laden der Pl\xE4tze:",e)}}async function F(){let e=document.getElementById("name").value,s=parseFloat(document.getElementById("latitude").value),n=parseFloat(document.getElementById("longitude").value),t=document.getElementById("access").value,i=document.getElementById("type").value,a=parseInt(document.getElementById("field_count").value),l=document.getElementById("notes").value;if(!e||isNaN(s)||isNaN(n)||!t||!i||isNaN(a)){alert("Bitte f\xFCllen Sie alle Pflichtfelder aus");return}try{if(!(await fetch("/api/places",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,latitude:s,longitude:n,access:t,type:i,fieldCount:a,notes:l})})).ok)throw new Error("Fehler beim Hinzuf\xFCgen des Platzes");document.getElementById("name").value="",document.getElementById("latitude").value="",document.getElementById("longitude").value="",document.getElementById("access").value="\xD6ffentlich",document.getElementById("type").value="Outdoor",document.getElementById("field_count").value="1",document.getElementById("notes").value="",u&&(r.removeLayer(u),u=null),h(),alert("Platz erfolgreich hinzugef\xFCgt")}catch(o){console.error("Fehler:",o),alert("Fehler beim Hinzuf\xFCgen des Platzes")}}async function y(e){try{let s=await fetch(`/api/places/${e}`);if(!s.ok)throw new Error("Fehler beim Laden des Platzes");let n=await s.json();document.getElementById("edit-name").value=n.name,document.getElementById("edit-latitude").value=n.latitude,document.getElementById("edit-longitude").value=n.longitude,document.getElementById("edit-access").value=n.access,document.getElementById("edit-type").value=n.type,document.getElementById("edit-field_count").value=n.fieldCount,document.getElementById("edit-notes").value=n.notes||"";let t=document.getElementById("editPlaceForm");t.classList.remove("hidden"),t.classList.add("edit-mode"),t.scrollIntoView({behavior:"smooth"});let i=document.getElementById("updatePlaceButton"),a=document.getElementById("cancelEditButton"),l=i.cloneNode(!0),o=a.cloneNode(!0);i.parentNode.replaceChild(l,i),a.parentNode.replaceChild(o,a),l.addEventListener("click",async c=>{c.preventDefault(),await $(e)}),o.addEventListener("click",c=>{c.preventDefault(),S()}),u&&r.removeLayer(u),u=L.marker([n.latitude,n.longitude],{icon:f}).addTo(r),r.setView([n.latitude,n.longitude],13),r.closePopup()}catch(s){console.error("Fehler beim Laden des Platzes:",s),alert("Fehler beim Laden des Platzes")}}function S(){let e=document.getElementById("editPlaceForm");e.classList.add("hidden"),e.classList.remove("edit-mode"),document.getElementById("edit-name").value="",document.getElementById("edit-latitude").value="",document.getElementById("edit-longitude").value="",document.getElementById("edit-access").value="\xD6ffentlich",document.getElementById("edit-type").value="Outdoor",document.getElementById("edit-field_count").value="1",document.getElementById("edit-notes").value="",u&&(r.removeLayer(u),u=null)}async function $(e){let s=document.getElementById("edit-name").value,n=parseFloat(document.getElementById("edit-latitude").value),t=parseFloat(document.getElementById("edit-longitude").value),i=document.getElementById("edit-access").value,a=document.getElementById("edit-type").value,l=parseInt(document.getElementById("edit-field_count").value),o=document.getElementById("edit-notes").value;if(!s||isNaN(n)||isNaN(t)||!i||!a||isNaN(l)){alert("Bitte f\xFCllen Sie alle Pflichtfelder aus");return}try{if(!(await fetch(`/api/places/${e}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:s,latitude:n,longitude:t,access:i,type:a,fieldCount:l,notes:o})})).ok)throw new Error("Fehler beim Aktualisieren des Platzes");let d=document.getElementById("editPlaceForm");d.classList.add("hidden"),d.classList.remove("edit-mode"),document.getElementById("edit-name").value="",document.getElementById("edit-latitude").value="",document.getElementById("edit-longitude").value="",document.getElementById("edit-access").value="\xD6ffentlich",document.getElementById("edit-type").value="Outdoor",document.getElementById("edit-field_count").value="1",document.getElementById("edit-notes").value="",u&&(r.removeLayer(u),u=null),h(),alert("Platz erfolgreich aktualisiert")}catch(c){console.error("Fehler:",c),alert("Fehler beim Aktualisieren des Platzes")}}async function g(e){if(confirm("M\xF6chten Sie diesen Platz wirklich l\xF6schen?"))try{if(!(await fetch(`/api/places/${e}`,{method:"DELETE"})).ok)throw new Error("Fehler beim L\xF6schen des Platzes");h(),alert("Platz erfolgreich gel\xF6scht")}catch(s){console.error("Fehler:",s),alert("Fehler beim L\xF6schen des Platzes")}}async function z(){let e=document.getElementById("team1").value.trim(),s=document.getElementById("team2").value.trim(),n=document.getElementById("platz").value;if(!e||!s){alert("Bitte geben Sie beide Teamnamen ein");return}if(!n){alert("Bitte w\xE4hlen Sie einen Platz aus");return}try{if(!(await fetch("/api/games",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({teams:[e,s],platz:n})})).ok)throw new Error("Fehler beim Erstellen des Spiels");document.getElementById("team1").value="",document.getElementById("team2").value="",document.getElementById("platz").value="",m()}catch(t){console.error("Fehler beim Starten des Spiels:",t),alert("Fehler beim Starten des Spiels")}}async function C(e,s,n){try{let t=await fetch(`/api/games/${e}/score`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({team:s,change:n})});if(!t.ok)throw new Error("Fehler beim Aktualisieren des Spielstands");let i=await t.json(),a=i.punkteVerlauf[i.punkteVerlauf.length-1];(a.mannschaft1Punkte>=13||a.mannschaft2Punkte>=13)&&a.mannschaft1Punkte!==a.mannschaft2Punkte?await E(e,!0):m()}catch(t){console.error("Fehler:",t),alert("Fehler beim Aktualisieren des Spielstands")}}async function E(e,s=!1){if(!(!s&&!confirm("M\xF6chten Sie das Spiel wirklich beenden?")))try{if(!(await fetch(`/api/games/${e}/end`,{method:"PATCH",headers:{"Content-Type":"application/json"}})).ok)throw new Error("Fehler beim Beenden des Spiels");m(),p(),s&&alert("Spiel automatisch beendet - 13 Punkte erreicht!")}catch(n){console.error("Fehler:",n),alert("Fehler beim Beenden des Spiels")}}async function N(e){if(confirm("M\xF6chten Sie das Spiel wirklich l\xF6schen?"))try{if(!(await fetch(`/api/games/${e}`,{method:"DELETE"})).ok)throw new Error("Fehler beim L\xF6schen des Spiels");m(),p()}catch(s){console.error("Fehler:",s),alert("Fehler beim L\xF6schen des Spiels")}}async function m(){try{let s=await(await fetch("/api/games?status=laufend")).json(),n=document.getElementById("activeGames");if(n.innerHTML="",!s.spiele||s.spiele.length===0){n.innerHTML=`
                <div class="empty-state">
                    <i class="fas fa-dice"></i>
                    <p>Keine aktiven Spiele</p>
                </div>
            `;return}let t=document.createElement("div");t.className="games-section",t.innerHTML=`
            <h2><i class="fas fa-play-circle"></i> Aktive Spiele</h2>
        `;let i=document.createElement("div");i.className="games-container",s.spiele.forEach(a=>{let l=document.createElement("div");l.className="game-item active";let o=a.punkteVerlauf[a.punkteVerlauf.length-1];l.innerHTML=`
                <div class="game-header">
                    <div class="game-title">
                        <div class="teams">${a.teams[0]} vs. ${a.teams[1]}</div>
                        <div class="score">${o.mannschaft1Punkte}:${o.mannschaft2Punkte}</div>
                    </div>
                </div>
                ${a.platz?`
                    <div class="game-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${a.platz.name}
                    </div>
                `:""}
                <div class="score-controls">
                    <div class="team-score">
                        <div class="team-name">${a.teams[0]}</div>
                        <div class="score-buttons">
                            <button onclick="updateScore('${a._id}', 1, 1)" class="score-btn plus">+1</button>
                            <button onclick="updateScore('${a._id}', 1, 2)" class="score-btn plus">+2</button>
                            <button onclick="updateScore('${a._id}', 1, 3)" class="score-btn plus">+3</button>
                            <button onclick="updateScore('${a._id}', 1, -1)" class="score-btn minus">-1</button>
                        </div>
                    </div>
                    <div class="team-score">
                        <div class="team-name">${a.teams[1]}</div>
                        <div class="score-buttons">
                            <button onclick="updateScore('${a._id}', 2, 1)" class="score-btn plus">+1</button>
                            <button onclick="updateScore('${a._id}', 2, 2)" class="score-btn plus">+2</button>
                            <button onclick="updateScore('${a._id}', 2, 3)" class="score-btn plus">+3</button>
                            <button onclick="updateScore('${a._id}', 2, -1)" class="score-btn minus">-1</button>
                        </div>
                    </div>
                </div>
                <div class="game-actions">
                    <button onclick="endGame('${a._id}')" class="control-button finish">
                        <i class="fas fa-flag-checkered"></i>
                        Spiel beenden
                    </button>
                    <button onclick="deleteGame('${a._id}')" class="control-button delete">
                        <i class="fas fa-trash"></i>
                        L\xF6schen
                    </button>
                </div>
            `,i.appendChild(l)}),t.appendChild(i),n.appendChild(t)}catch(e){console.error("Fehler beim Laden der aktiven Spiele:",e);let s=document.getElementById("activeGames");s.innerHTML=`
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Fehler beim Laden der Spiele</p>
            </div>
        `}}async function p(e=1){try{let n=await(await fetch(`/api/games?status=beendet&page=${e}&limit=6`)).json(),t=document.getElementById("finishedGames");if(t.innerHTML="",!n.spiele||n.spiele.length===0){t.innerHTML=`
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>Keine beendeten Spiele</p>
                </div>
            `;return}let i=document.createElement("div");i.className="games-section",i.innerHTML=`
            <h2><i class="fas fa-flag-checkered"></i> Beendete Spiele</h2>
        `;let a=document.createElement("div");a.className="games-container",n.spiele.forEach(o=>{let c=document.createElement("div");c.className="game-item finished";let d=o.punkteVerlauf[o.punkteVerlauf.length-1],b=d.mannschaft1Punkte>d.mannschaft2Punkte?o.teams[0]:o.teams[1],B=new Date(o.endZeit).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}),k=o.punkteVerlauf.map((v,I)=>`
                <div class="round">
                    <div class="round-number">Runde ${I+1}</div>
                    <div class="round-score">${v.mannschaft1Punkte}:${v.mannschaft2Punkte}</div>
                </div>
            `).join("");c.innerHTML=`
                <div class="game-header">
                    <div class="game-title">
                        <div class="teams">${o.teams[0]} vs. ${o.teams[1]}</div>
                        <div class="final-score">${d.mannschaft1Punkte}:${d.mannschaft2Punkte}</div>
                    </div>
                    <div class="winner-badge">
                        <i class="fas fa-trophy"></i>
                        ${b}
                    </div>
                </div>
                ${o.platz?`
                    <div class="game-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${o.platz.name}
                    </div>
                `:""}
                <div class="game-info">
                    <div class="end-time">
                        <i class="far fa-clock"></i>
                        Beendet am ${B}
                    </div>
                    <div class="rounds-history">
                        ${k}
                    </div>
                </div>
                <button onclick="deleteGame('${o._id}')" class="control-button delete">
                    <i class="fas fa-trash"></i>
                    L\xF6schen
                </button>
            `,a.appendChild(c)}),i.appendChild(a);let l=Math.ceil(n.total/n.limit);if(l>1){let o=document.createElement("div");o.className="pagination";let c="";c+=`
                <button class="page-button${e<=1?" disabled":""}" 
                        onclick="${e<=1?"":`loadFinishedGames(${e-1})`}"
                        ${e<=1?"disabled":""}>
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;for(let d=1;d<=l;d++)d===1||d===l||d>=e-1&&d<=e+1?c+=`
                        <button class="page-button${d===e?" active":""}" 
                                onclick="loadFinishedGames(${d})">
                            ${d}
                        </button>
                    `:(d===e-2||d===e+2)&&(c+='<span class="page-ellipsis">...</span>');c+=`
                <button class="page-button${e>=l?" disabled":""}" 
                        onclick="${e>=l?"":`loadFinishedGames(${e+1})`}"
                        ${e>=l?"disabled":""}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            `,o.innerHTML=c,i.appendChild(o)}t.appendChild(i)}catch(s){console.error("Fehler beim Laden der beendeten Spiele:",s);let n=document.getElementById("finishedGames");n.innerHTML=`
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Fehler beim Laden der Spiele</p>
            </div>
        `}}document.addEventListener("DOMContentLoaded",()=>{m(),p()});window.startGame=z;window.updateScore=C;window.endGame=E;window.deleteGame=N;window.loadFinishedGames=p;window.editPlace=y;window.deletePlace=g;})();
