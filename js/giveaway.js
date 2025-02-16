let API_CONFIG = {
    RAPIDAPI_KEY: window.env.RAPIDAPI_KEY || 'default-key',
    RAPIDAPI_HOST: window.env.RAPIDAPI_HOST || 'default-host'
};

async function fetchGiveaway() {
    const platform = document.getElementById('platformSelector').value;
    const url = `https://gamerpower.p.rapidapi.com/api/filter?platform=${platform === 'all' ? 'any' : platform}&type=game.loot`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_CONFIG.RAPIDAPI_KEY,
            'x-rapidapi-host': API_CONFIG.RAPIDAPI_HOST
        }
    };
    
    try {
        const response = await fetch(url, options);
        const giveaways = await response.json();
        displayGiveaways(giveaways);
    } catch (error) {
        console.error(error);
    }
}

async function fetchDealInfo(dealId) {
    try {
        if (!dealId) {
            throw new Error('Invalid deal ID');
        }

        const url = `https://www.cheapshark.com/api/1.0/games?id=${dealId}`;
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

function displayGiveaways(giveaways) {
    const container = document.getElementById('dealsContainer');
    container.innerHTML = '';
    
    giveaways.forEach(giveaway => {
        const card = document.createElement('div');
        card.className = 'bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-yellow-400/60 hover:border-yellow-400 transition-all';
        
        card.innerHTML = `  
            <img src="${giveaway.image}" 
                 alt="${giveaway.title}" 
                 class="w-full h-48 object-contain mb-4 rounded-lg">
            <div class="text-yellow-400 text-xl font-bold mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">${giveaway.title}</div>
            <a href="${giveaway.open_giveaway_url}" 
               target="_blank" 
               class="block hover:scale-105 transition-transform">
                <button class="w-full bg-yellow-400 text-blue-900 py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">
                    Get It Free
                </button>
            </a>
            <div class="text-green-400 text-2xl font-bold mt-3">Worth:${giveaway.worth}</div>
            <div class="text-yellow-200 text-sm mt-2">Platforms: ${giveaway.platforms}</div>
            <div class="text-yellow-200 text-sm">Status: ${giveaway.status}</div>
            <div class="text-yellow-200 text-sm mt-2">Published: ${giveaway.published_date}</div>
            <div class="text-yellow-200 text-sm">Ends: ${giveaway.end_date}</div>
        `;
        container.appendChild(card);
    });
}

fetchGiveaway();

