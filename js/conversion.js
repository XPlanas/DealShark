async function getCurrencyRates() {
    try {
        // Check for cached rates in cookies
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('currentExchange='))
            ?.split('=')[1];
        
        if (cookieValue) {
            try {
                return JSON.parse(decodeURIComponent(cookieValue));
            } catch (e) {
                console.warn('Invalid cookie data, fetching fresh rates');
                // If cookie is corrupted, remove it
                document.cookie = 'currentExchange=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }

        // Fetch new rates if not in cache
        const response = await fetch('https://api.fxfeed.io/v1/latest?base=USD&currencies=USD,EUR,GBP,JPY&api_key=fxf_a5GTOrKRQfY96hWwyysl');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate response structure
        if (!data?.success || !data?.rates) {
            throw new Error('Invalid API response structure');
        }

        // Cache the rates in cookies for 1 day
        const cookieString = `currentExchange=${encodeURIComponent(JSON.stringify(data.rates))}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = cookieString;
        
        return data.rates;
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        return null;
    }
}




