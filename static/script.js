const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const statusDiv = document.getElementById('status');
const transcribedTextSpan = document.getElementById('transcribedText');
const sentimentScoreSpan = document.getElementById('sentimentScore');
const moodSpan = document.getElementById('mood');

// This is your new backend API URL from Render.com
const RENDER_API_BASE_URL = 'https://voiceanalyzerflaskapp.onrender.com';

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    statusDiv.textContent = 'Speech Recognition is not supported in this browser. Please use Chrome or Edge.';
    startButton.disabled = true;
    stopButton.disabled = true;
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Only get a single result per utterance
    recognition.lang = 'en-US'; // Set recognition language
    recognition.interimResults = false; // Only return final results
    recognition.maxAlternatives = 1; // Get only the most probable transcription

    // Event handler for when speech is recognized
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('1. Speech recognized:', transcript);
        statusDiv.textContent = 'Speech recognized. Analyzing mood...';
        transcribedTextSpan.textContent = transcript; // Display recognized text immediately

        try {
            // Send the transcribed text to Flask for sentiment analysis
            // IMPORTANT: Now using the full Render API URL
            const response = await fetch(`${RENDER_API_BASE_URL}/analyze_text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: transcript })
            });

            const result = await response.json();
            console.log('2. Received analysis result from server:', result);

            if (response.ok) {
                sentimentScoreSpan.textContent = result.sentiment_score !== undefined ? result.sentiment_score.toFixed(2) : 'N/A';
                moodSpan.textContent = result.mood || 'N/A';
                statusDiv.textContent = 'Analysis complete!';
            } else {
                statusDiv.textContent = `Error from server: ${result.error || 'Unknown error.'}`;
                sentimentScoreSpan.textContent = '';
                moodSpan.textContent = '';
                console.error('3. Server error response:', result.error);
            }
        } catch (error) {
            statusDiv.textContent = `Network Error: ${error.message}`;
            sentimentScoreSpan.textContent = '';
            moodSpan.textContent = '';
            console.error('4. Fetch/Network error:', error);
        } finally {
            startButton.disabled = false; // Re-enable start button
            stopButton.disabled = true;
        }
    };

    // Event handler for errors
    recognition.onerror = (event) => {
        console.error('5. Speech Recognition Error:', event.error);
        statusDiv.textContent = `Speech Recognition Error: ${event.error}. Please try again.`;
        startButton.disabled = false;
        stopButton.disabled = true;
        if (event.error === 'not-allowed') {
            statusDiv.textContent = 'Microphone access denied. Please allow microphone access for this site.';
        } else if (event.error === 'no-speech') {
            statusDiv.textContent = 'No speech detected. Please speak clearly into the microphone.';
        } else if (event.error === 'network') {
            statusDiv.textContent = 'Network error during speech recognition. Check your internet connection.';
        }
    };

    // Event handler for when recognition starts
    recognition.onstart = () => {
        statusDiv.textContent = 'Listening... Speak now.';
        startButton.disabled = true;
        stopButton.disabled = false;
        // Clear previous results
        transcribedTextSpan.textContent = '';
        sentimentScoreSpan.textContent = '';
        moodSpan.textContent = '';
        console.log('6. Speech recognition started.');
    };

    // Event handler for when recognition ends
    recognition.onend = () => {
        console.log('7. Speech recognition ended.');
        if (statusDiv.textContent === 'Listening... Speak now.') {
            // If it ended without recognizing speech, update status
            statusDiv.textContent = 'Speech recognition ended. No speech detected or processed. Click Start Recording.';
            startButton.disabled = false;
            stopButton.disabled = true;
        }
    };

    // Start button logic
    startButton.addEventListener('click', () => {
        recognition.start();
    });

    // Stop button logic (useful if continuous=true, but here just ends current listening)
    stopButton.addEventListener('click', () => {
        recognition.stop();
        statusDiv.textContent = 'Stopping recognition...';
    });
}

// Initial state
document.addEventListener('DOMContentLoaded', () => {
    if (SpeechRecognition) {
        startButton.disabled = false; // Enable if API supported
        statusDiv.textContent = 'Ready to record. Click Start Recording.';
    }
});