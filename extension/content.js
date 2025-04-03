// content.js
// Create a floating icon button
const floatBtn = document.createElement('div');
floatBtn.id = 'tts-floating-icon';
floatBtn.style.position = 'fixed';
floatBtn.style.bottom = '20px';
floatBtn.style.right = '20px';
floatBtn.style.width = '50px';
floatBtn.style.height = '50px';
floatBtn.style.backgroundColor = '#007bff';
floatBtn.style.borderRadius = '50%';
floatBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
floatBtn.style.cursor = 'pointer';
floatBtn.style.zIndex = '10000';
floatBtn.style.display = 'flex';
floatBtn.style.alignItems = 'center';
floatBtn.style.justifyContent = 'center';
floatBtn.title = 'Click to transcribe';

// Add an icon to the button
const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
iconSvg.setAttribute("width", "24");
iconSvg.setAttribute("height", "24");
iconSvg.setAttribute("viewBox", "0 0 24 24");
iconSvg.style.fill = "white";

const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
iconPath.setAttribute("d", "M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z");
const iconPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
iconPath2.setAttribute("d", "M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z");

iconSvg.appendChild(iconPath);
iconSvg.appendChild(iconPath2);
floatBtn.appendChild(iconSvg);

// Append to the body of the page
document.body.appendChild(floatBtn);

// Send a message to the background script to open the transcription panel
floatBtn.addEventListener('click', () => {
  const selectedText = window.getSelection().toString();
  
  // If text is selected, read it directly
  if (selectedText) {
    readTextWithSavedSettings(selectedText);
  } else {
    // Otherwise, open the panel
    chrome.runtime.sendMessage({ 
      action: "open_panel",
      selectedText: selectedText 
    });
  }
});

// Function to read text with saved settings
function readTextWithSavedSettings(text) {
  if (!text) return;
  
  // Get saved settings
  chrome.storage.sync.get('ttsSettings', (data) => {
    // Stop any current speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (data.ttsSettings) {
      // Apply saved settings
      const voices = speechSynthesis.getVoices();
      
      // Wait for voices to load if needed
      if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = function() {
          const availableVoices = speechSynthesis.getVoices();
          if (availableVoices[data.ttsSettings.voiceIndex]) {
            utterance.voice = availableVoices[data.ttsSettings.voiceIndex];
          }
          applySpeechSettings();
        };
      } else if (voices[data.ttsSettings.voiceIndex]) {
        utterance.voice = voices[data.ttsSettings.voiceIndex];
        applySpeechSettings();
      } else {
        applySpeechSettings();
      }
      
      function applySpeechSettings() {
        utterance.rate = parseFloat(data.ttsSettings.rate) || 1;
        utterance.volume = parseFloat(data.ttsSettings.volume) || 1;
        utterance.pitch = parseFloat(data.ttsSettings.pitch) || 1;
        
        // Use the browser's TTS to speak the text
        speechSynthesis.speak(utterance);
      }
    } else {
      // No saved settings, use defaults
      speechSynthesis.speak(utterance);
    }
  });
}

// Listen for messages from popup and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "read_content") {
    // Read the entire page content or selected area
    let content = "";
    if (request.selectedOnly && window.getSelection().toString()) {
      content = window.getSelection().toString();
    } else {
      // Get main content, avoiding navigation, headers, etc.
      const mainContent = document.querySelector('main') || 
                         document.querySelector('article') || 
                         document.querySelector('.content') || 
                         document.body;
      content = mainContent.textContent.trim();
    }
    sendResponse({content: content});
  } else if (request.action === "speak_text") {
    // Directly speak text sent from elsewhere
    readTextWithSavedSettings(request.text);
  }
  return true;
});

// Add a context menu option
document.addEventListener('contextmenu', function(e) {
  const selectedText = window.getSelection().toString();
  if (selectedText) {
    // We could store this information if needed
    chrome.runtime.sendMessage({ 
      action: "context_menu_selection",
      selectedText: selectedText 
    });
  }
});