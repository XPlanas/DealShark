async function fetchGameInfo(gameID) {
    try {
        if (!gameID) {
            throw new Error('Invalid gameID');
        }

        const url = `https://www.cheapshark.com/api/1.0/games?id=${gameID}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const deal = await response.json();
        
        return deal;
    } catch (error) {
        console.error('Error fetching deal info:', error);
    }
}

const API_BASE = 'https://www.cheapshark.com/api/1.0/alerts';

async function createAlert() {
    const email = document.getElementById('email').value;
    const gameID = document.getElementById('gameID').value;
    const price = document.getElementById('price').value;
    
    const response = await fetch(`${API_BASE}?action=set&email=${email}&gameID=${gameID}&price=${price}`);
    const data = await response.json();
}
async function deleteAlert() {
    const email = document.getElementById('email').value;
    const gameID = document.getElementById('gameID').value;
    
    const response = await fetch(`${API_BASE}?action=delete&email=${email}&gameID=${gameID}`);
    const data = await response.json();
}

async function ManageAlert() {
    const email = document.getElementById('statusEmail').value;
    
    const response = await fetch(`${API_BASE}?action=manage&email=${email}`);
    const data = await response.json();
}
 
async function getDealAlerts() {
    const key = document.getElementById('alertID').value;
    
    const response = await fetch(`${API_BASE}?action=get&key=${key}`);
    const data = await response.json();
    
    const alertsContainer = document.getElementById('alertsContainer');
    alertsContainer.innerHTML = '';

    if (data && data.length > 0) {
        const gameInfoPromises = data.map(alert => fetchGameInfo(alert.gameID));
        
        const gameInfos = await Promise.all(gameInfoPromises);
        
        data.forEach((alert, index) => {
            const gameInfo = gameInfos[index];
            const alertCard = document.createElement('div');
            alertCard.className = 'bg-blue-900/20 p-3 rounded-lg border border-yellow-400/30';
            
            alertCard.innerHTML = `
                <div class="text-yellow-200">Game: ${gameInfo?.info?.title || 'Unknown'}</div>
                <div class="text-yellow-200">Game ID: ${alert.gameID}</div>
                ${gameInfo?.info?.thumb ? `
                    <img src="${gameInfo.info.thumb}" alt="${gameInfo.info.title}" class="w-full h-48 object-contain mt-2 rounded-lg">
                ` : ''}
                <div class="text-green-400">Price Alert: $${alert.price}</div>
                
            `;
            alertsContainer.appendChild(alertCard);
        });
    } else {
        alertsContainer.innerHTML = '<div class="text-yellow-200/80">No alerts found for this email</div>';
    }
    
    const form = document.getElementById('getAlertsForm');
    form.insertAdjacentElement('afterend', alertsContainer);
}

function initializeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const gameID = urlParams.get('gameID');
    if (gameID) {
        document.getElementById('gameID').value = gameID;
    }
}

window.addEventListener('load', initializeForm);
