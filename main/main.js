document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt');
    const outputDiv = document.getElementById('output');
    const generateButton = document.getElementById('generate');

    generateButton.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            outputDiv.textContent = 'Please enter a prompt';
            return;
        }

        // Show loading state
        generateButton.disabled = true;
        outputDiv.textContent = 'Generating...';

        try {
            // Get the current server origin or default to localhost:3000
            const serverUrl = window.location.origin.includes('5500') ? 
                'http://localhost:3000' : window.location.origin;
                
            // Use fetch with the correct server URL
            const response = await fetch(`${serverUrl}/generate-content?prompt=${encodeURIComponent(prompt)}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            outputDiv.textContent = text;
        } catch (error) {
            console.error('Error:', error);
            outputDiv.textContent = `Error: ${error.message}`;
        } finally {
            // Re-enable button
            generateButton.disabled = false;
        }
    });

    // Add ability to press Enter to submit
    promptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            generateButton.click();
        }
    });
});