let storeMap = {};

async function fetchStores() {
    try {
        const response = await fetch('https://www.cheapshark.com/api/1.0/stores');
        const stores = await response.json();
        storeMap = stores.reduce((map, store) => {
            map[store.storeID] = store.storeName;
            return map;
        }, {});
    } catch (error) {
        console.error('Error fetching stores:', error);
    }
}

async function fetchDeals() {
    try {
        const url = "https://www.cheapshark.com/api/1.0/deals";
        const storeSelector = document.getElementById('storeSelector');
        const resultCount = document.getElementById('resultCount');
        const searchInput = document.getElementById('searchInput');
        
        if (!storeSelector || !resultCount) {
            throw new Error('Required elements missing');
        }

        const params = {
            'pageSize': resultCount.value
        };

        if (storeSelector.value !== "0") {
            params.storeID = storeSelector.value;
        }

        if (searchInput && searchInput.value.trim() !== '') {
            params.title = searchInput.value.trim();
        }

        const response = await fetch(url + '?' + new URLSearchParams(params));
        const deals = await response.json();
        displayDeals(deals);
    } catch (error) {
        console.error('Error:', error);
    }
}

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


function displayDeals(deals) {
    const container = document.getElementById('dealsContainer');
    container.innerHTML = '';
    deals.forEach(deal => {
        const dealCard = document.createElement('div');
        dealCard.className = 'bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6 border-2 border-yellow-400/60 hover:border-yellow-400 transition-all';
        dealCard.innerHTML = `  
            <img src="${deal.steamAppID === '315210' ? deal.thumb : deal.thumb.replace('capsule_sm_120', 'header')}" alt="${deal.title}" class="w-full h-48 object-contain mb-4 rounded-lg">
            <div class="text-yellow-400 text-xl font-bold mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">${deal.title}</div>
            <a href="${deal.dealID ? `https://www.cheapshark.com/redirect?dealID=${deal.dealID}` : '#'}" target="_blank" class="block hover:scale-105 transition-transform">
                <button class="w-full bg-yellow-400 text-blue-900 py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors font-semibold">Buy Now</button>
            </a>
            <button data-deal-id="${deal.gameID}" class="more-info-btn w-full mt-2 bg-blue-900/30 text-yellow-200 py-2 px-4 rounded-lg hover:bg-blue-900/50 transition-colors border-2 border-yellow-400/50 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20">
                More Info
            </button>
            <div class="text-green-400 text-2xl font-bold mt-3">$${deal.salePrice}</div>
            <div class="text-red-300 text-sm">Save ${Math.round(deal.savings)}%</div>
        `;
        container.appendChild(dealCard);
    });
    // Add event listeners after creating the cards
    document.querySelectorAll('.more-info-btn').forEach(button => {
        button.addEventListener('click', () => {
            const dealId = button.getAttribute('data-deal-id');
            showDealModal(dealId);
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
        }, 1000);
        });
    });

}

async function showDealModal(gameID) {
    const modal = document.createElement('div');
    const deal = await fetchGameInfo(gameID);
    if (!deal) return;
    
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-b from-blue-900/90 to-indigo-900/90 rounded-lg shadow-lg w-full max-w-2xl p-6 relative border-2 border-yellow-200/20">
            <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-yellow-200 hover:text-yellow-400 text-2xl">
                &times;
            </button>
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    ${deal.info.thumb ? `
                        <img src="${deal.info.steamAppID === '315210' ? deal.info.thumb : deal.info.thumb.replace('capsule_sm_120', 'header')}" alt="${deal.info.name}" class="w-full h-64 object-contain rounded-lg">
                    ` : '<div class="w-full h-64 bg-blue-900/20 rounded-lg flex items-center justify-center text-yellow-200">No Image Available</div>'}
                </div>
                <div>
                    <h2 class="text-2xl font-bold mb-4 text-yellow-400">${deal.info.title}</h2>
                    <div class="space-y-2">
                        ${deal.deals[0].retailPrice !== deal.cheapestPriceEver ? `<p class="text-yellow-200">Original Price: $${deal.deals[0].retailPrice}</p>` : ''}
                        ${deal.deals[0].price ? `<p class="text-green-400 font-bold text-xl">Cheapest Price: $${deal.deals[0].price} at ${storeMap[deal.deals[0].storeID] || `Store ${deal.deals[0].storeID}`}</p>` : ''}
                    </div>
                    <br>
                                            <a href="/alerts.html?gameID=${gameID}" class="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-semibold text-center sm:text-left">
                            Set Price Alert
                        </a>
                    ${deal.deals && deal.deals.length > 1 ? `
                    <div class="mt-3">
                        <h3 class="font-semibold mb-2 text-yellow-200">Also at:</h3>
                        <div class="space-y-1">
                            ${deal.deals.slice(1).map(store => `
                                <div class="flex justify-between text-yellow-200">
                                    <span>${storeMap[store.storeID] || `Store ${store.storeID}`}</span>
                                    <a href="https://www.cheapshark.com/redirect?dealID=${store.dealID}" target="_blank" class="text-yellow-400 hover:text-yellow-500 underline">View Deal</a>
                                    <span class="text-green-400">$${store.price}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    <div class="mt-6 flex flex-col sm:flex-row gap-4">
                        ${deal.deals && deal.deals.length > 0 ? `
                        <a href="https://www.cheapshark.com/redirect?dealID=${deal.deals[0].dealID}" target="_blank" class="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-semibold text-center sm:text-left">
                            Buy at ${storeMap[deal.deals[0].storeID]}
                        </a>
                        ` : ''}

                        <button onclick="this.closest('.fixed').remove()" class="bg-blue-900/30 text-yellow-200 px-6 py-2 rounded-lg hover:bg-blue-900/50 transition-colors border-2 border-yellow-200/30 hover:border-yellow-400/50">
                            Close
                        </button>  
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function searchGames() {
    fetchDeals();
}


fetchDeals();
fetchStores(); 