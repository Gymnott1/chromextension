// background.js
// Store selected text in a variable that we can access via messaging
let selectedText = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_panel") {
    // Store the selected text
    selectedText = request.selectedText || '';
    
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 400,
      height: 600,
      left: 100,
      top: 100
    });
  } else if (request.action === "get_selected_text") {
    // Return the stored selected text
    sendResponse({selectedText: selectedText});
    return true; // Keep the message channel open for the async response
  }
});

// Listen for commands (keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
  if (command === "read_selected_text") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: getSelectedText
      }, (results) => {
        if (results && results[0] && results[0].result) {
          // We would read text directly here, but in MV3 it's better to 
          // use the content script or popup for speech synthesis
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "speak_text", 
            text: results[0].result
          });
        }
      });
    });
  }
});

function getSelectedText() {
  return window.getSelection().toString();
}