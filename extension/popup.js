// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const voiceSelect = document.getElementById('voiceSelect');
  const rate = document.getElementById('rate');
  const volume = document.getElementById('volume');
  const pitch = document.getElementById('pitch');
  const transcribeBtn = document.getElementById('transcribeBtn');
  const stopBtn = document.getElementById('stopBtn');
  const extractBtn = document.getElementById('extractBtn');
  const extractSelectedBtn = document.getElementById('extractSelectedBtn');
  const rateValueSpan = document.getElementById('rateValue');
  const volumeValueSpan = document.getElementById('volumeValue');
  const pitchValueSpan = document.getElementById('pitchValue');
  
  // Initialize sliders with current values
  rateValueSpan.textContent = rate.value;
  volumeValueSpan.textContent = volume.value;
  pitchValueSpan.textContent = pitch.value;
  
  // Update value displays when sliders change
  rate.addEventListener('input', () => rateValueSpan.textContent = rate.value);
  volume.addEventListener('input', () => volumeValueSpan.textContent = volume.value);
  pitch.addEventListener('input', () => pitchValueSpan.textContent = pitch.value);

  // Populate voice options using the Web Speech API
  let voices = [];
  function populateVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    
    // Try to select a default voice
    const preferredVoice = voices.findIndex(voice => 
      voice.default || 
      voice.lang.startsWith('en-') || 
      voice.name.includes('Google') || 
      voice.name.includes('English')
    );
    
    if (preferredVoice !== -1) {
      voiceSelect.value = preferredVoice;
    }
  }
  
  populateVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Check if there's any text passed from the background script
  chrome.runtime.sendMessage({action: "get_selected_text"}, function(response) {
    if (response && response.selectedText) {
      inputText.value = response.selectedText;
    }
  });

  // Extract text from current page
  extractBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "read_content", selectedOnly: false}, function(response) {
        if (response && response.content) {
          inputText.value = response.content;
        } else {
          inputText.value = "Could not extract text from this page. Try selecting text manually.";
        }
      });
    });
  });

  // Extract selected text from current page
  extractSelectedBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "read_content", selectedOnly: true}, function(response) {
        if (response && response.content && response.content.trim() !== '') {
          inputText.value = response.content;
        } else {
          inputText.value = "No text selected. Please select some text on the page first.";
        }
      });
    });
  });

  // Transcription handler: converts text to audio using Web Speech API
  transcribeBtn.addEventListener('click', () => {
    const text = inputText.value;
    if (!text) {
      alert("Please enter some text to transcribe.");
      return;
    }
    
    // Stop any currently playing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoiceIndex = voiceSelect.value;
    
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }
    
    utterance.rate = parseFloat(rate.value);
    utterance.volume = parseFloat(volume.value);
    utterance.pitch = parseFloat(pitch.value);
    
    // Event handling
    utterance.onstart = () => {
      transcribeBtn.disabled = true;
      stopBtn.disabled = false;
      updateStatus("Speaking...");
    };
    
    utterance.onend = () => {
      transcribeBtn.disabled = false;
      stopBtn.disabled = true;
      updateStatus("Finished speaking.");
      
      // Save settings to Chrome storage
      saveSettings();
    };
    
    utterance.onerror = (event) => {
      transcribeBtn.disabled = false;
      stopBtn.disabled = true;
      updateStatus(`Error: ${event.error}`);
    };
    
    // Use the browser's TTS to speak the text
    speechSynthesis.speak(utterance);
  });
  
  // Stop speaking
  stopBtn.addEventListener('click', () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      transcribeBtn.disabled = false;
      stopBtn.disabled = true;
      updateStatus("Stopped speaking.");
    }
  });
  
  // Helper function to update status
  function updateStatus(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }
  
  // Save user settings
  function saveSettings() {
    const settings = {
      voiceIndex: voiceSelect.value,
      rate: rate.value,
      volume: volume.value,
      pitch: pitch.value
    };
    
    chrome.storage.sync.set({ttsSettings: settings}, () => {
      console.log('Settings saved');
    });
  }
  
  // Load user settings
  function loadSettings() {
    chrome.storage.sync.get('ttsSettings', (data) => {
      if (data.ttsSettings) {
        // Need to wait for voices to load before setting voice
        setTimeout(() => {
          if (data.ttsSettings.voiceIndex && voices.length > data.ttsSettings.voiceIndex) {
            voiceSelect.value = data.ttsSettings.voiceIndex;
          }
        }, 100);
        
        if (data.ttsSettings.rate) {
          rate.value = data.ttsSettings.rate;
          rateValueSpan.textContent = data.ttsSettings.rate;
        }
        
        if (data.ttsSettings.volume) {
          volume.value = data.ttsSettings.volume;
          volumeValueSpan.textContent = data.ttsSettings.volume;
        }
        
        if (data.ttsSettings.pitch) {
          pitch.value = data.ttsSettings.pitch;
          pitchValueSpan.textContent = data.ttsSettings.pitch;
        }
      }
    });
  }
  
  // Load settings on startup
  loadSettings();
});