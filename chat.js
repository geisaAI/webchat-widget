document.addEventListener("DOMContentLoaded", function () {
  var ws; // WebSocket connection
  var visitorID = localStorage.getItem("visitorID") || generateVisitorID();
  localStorage.setItem("visitorID", visitorID);
  var chatWidget = document.getElementById("chat-widget");

  chatWidget.innerHTML = `
    <div id="chat-box" class="closed">
        <div id="chat-header">
            <span>Chat with Us!</span>
            <button id="close-chat" style="float: right;">X</button>
        </div>
        <div id="messages"></div>
        <div id="message-input-container">
            <textarea id="message-input" placeholder="Type a message..."></textarea>
            <button id="send-button" style="display:block;"><svg width="20px" height="20px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
                    stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg></button>
        </div>
    </div>
    <button id="toggle-chat">
        <span id="chat-icon" ><svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" width="30px" height="30px" viewBox="0 0 45.779 45.779"
        xml:space="preserve">
        <g>
            <g>
                <path d="M37.426,2.633H8.362C3.746,2.633,0,6.369,0,10.985v17.003c0,4.615,3.747,8.344,8.362,8.344h18.48l3.902,5.604
    			c0.527,0.756,1.39,1.209,2.311,1.211c0.92,0.002,1.785-0.443,2.314-1.197l4.129-5.865c3.611-0.924,6.281-4.198,6.281-8.098V10.985
    			C45.779,6.369,42.042,2.633,37.426,2.633z M15.431,22.203c-1.505,0-2.726-1.215-2.726-2.717c0-1.499,1.221-2.716,2.726-2.716
    			c1.506,0,2.726,1.217,2.726,2.716C18.157,20.988,16.937,22.203,15.431,22.203z M22.894,22.203c-1.505,0-2.726-1.215-2.726-2.717
    			c0-1.499,1.221-2.716,2.726-2.716c1.506,0,2.725,1.217,2.725,2.716C25.619,20.988,24.4,22.203,22.894,22.203z M30.357,22.203
    			c-1.506,0-2.727-1.215-2.727-2.717c0-1.499,1.221-2.716,2.727-2.716s2.726,1.217,2.726,2.716
    			C33.083,20.988,31.863,22.203,30.357,22.203z" />
            </g>
        </g>
    </svg></span>
        <span id="minimize-icon" style="display: none;"><svg width="30px" height="30px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path fill="#ffffff" fill-rule="evenodd"
                d="M11 8a1 1 0 001 1h6a1 1 0 100-2h-3.586l3.793-3.793a1 1 0 00-1.414-1.414L13 5.586V2a1 1 0 10-2 0v6zm-2 4a1 1 0 00-1-1H2a1 1 0 100 2h3.586l-3.793 3.793a1 1 0 101.414 1.414L7 14.414V18a1 1 0 102 0v-6z" />
        </svg></span></button>
  `;

  var chatBox = document.getElementById("chat-box");
  var toggleButton = document.getElementById("toggle-chat");
  var sendButton = document.getElementById("send-button");
  var messageInput = document.getElementById("message-input");
  var messagesDiv = document.getElementById("messages");
  var chatIcon = document.getElementById("chat-icon");
  var minimizeIcon = document.getElementById("minimize-icon");

  // Read the unique values from the data-* attributes
  var websiteID = chatWidget.getAttribute("data-website-domain");
  var aid = chatWidget.getAttribute("data-aid");
  var gid = chatWidget.getAttribute("data-gid");

  // Load and display chat history
  var chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistory.forEach(function (message) {
    displayMessage(message);
  });

  var closeButton = document.getElementById("close-chat");

  // Close chat event
  closeButton.onclick = function () {
    chatBox.style.display = "none";
    toggleButton.style.display = "block"; // Show the toggle button again
  };

  // Toggle chat widget visibility
  toggleButton.onclick = function () {
    if (chatBox.classList.contains("closed")) {
      chatBox.classList.remove("closed");
      chatBox.classList.add("open");
      chatBox.style.display = "flex"; // Show chat box
      chatIcon.style.display = "none"; // Hide chat icon
      minimizeIcon.style.display = "block"; // Show minimize icon

      // Initialize WebSocket connection if not already established
      if (!ws || ws.readyState === WebSocket.CLOSED) {
        initializeWebSocket();
      }
    } else {
      chatBox.classList.remove("open");
      chatBox.classList.add("closed");
      chatBox.style.display = "none"; // Hide chat box
      chatIcon.style.display = "block"; // Show chat icon
      minimizeIcon.style.display = "none"; // Hide minimize icon
    }
  };

  // Add a hover effect for the chat button
  toggleButton.onmouseover = function () {
    // When the mouse is over the button, we increase the transparency
    this.style.opacity = "0.7";
  };

  toggleButton.onmouseleave = function () {
    // When the mouse leaves the button, we return the opacity to normal
    this.style.opacity = "1";
  };

  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default action to stop from actually inserting a newline
      sendButton.click(); // Trigger the send button click event
    }
  });

  var messageId = 0; // A counter to assign a unique ID to each message

  // Send a message
  sendButton.onclick = function () {
    var message = messageInput.value.trim();
    if (message && ws && ws.readyState === WebSocket.OPEN) {
      var uniqueMessageId = generateMessageId();
      var messageData = {
        websiteID,
        visitorID,
        aid,
        gid,
        message,
        fromVisitor: true, // Identify that this message is from the visitor
        messageId: uniqueMessageId,
        status: "sent",
      };
      ws.send(JSON.stringify(messageData));
      addMessageToHistory(messageData); // Add the sent message to chat history
      displayMessage(messageData, "sent"); // Display the sent message
      messageInput.value = ""; // Clear input after sending
    }
  };

  function initializeWebSocket() {
    // Replace "your_websocket_server_url" with your WebSocket server URL
    ws = new WebSocket("wss://webchat.geisa.cloud");
    //ws = new WebSocket("wss://localhost");

    ws.onopen = function () {
      // Send visitorID and websiteID as the first message
      ws.send(JSON.stringify({ visitorID, websiteID }));
      console.log("WebSocket connection established");
      reconnectAttempt = 0; // Reset reconnect attempts on a successful connection
    };

    ws.onmessage = function (event) {
      var message = JSON.parse(event.data);

      // If the message is a status update
      if (
        message.status === "Message received and processed" &&
        message.messageId
      ) {
        console.log("Processing status from server...");
        // Find the message element with the corresponding data-message-id attribute
        var messageToUpdate = document.querySelector(
          `div.message[data-message-id="${message.messageId}"]`
        );
        if (messageToUpdate) {
          // Find the status element within the message element
          var statusElement = messageToUpdate.querySelector(".status-icon");
          if (statusElement) {
            //statusElement.textContent = "✓✓"; // Add the double checkmark
            statusElement.innerHTML = getStatusIconSVG("received");
          }
        }

        // Update the status in chat history
        chatHistory.forEach(function (msg) {
          if (msg.messageId === message.messageId) {
            msg.status = "received";
          }
        });
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      } else if (message.text) {
        // Normal message handling
        addMessageToHistory(message); // Add received message to chat history
        displayMessage(message, "received");
      }
    };

    ws.onclose = function () {
      console.log(
        "WebSocket connection closed unexpectedly. Attempting to reconnect..."
      );
      reconnectWebSocket();
    };

    ws.onerror = function (error) {
      console.log("WebSocket error:", error);
    };
  }

  // Function to generate a simple UUID-like visitor ID
  function generateVisitorID() {
    return "xxxx-xxxx-4xxx-yxxx-xxxx-xxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function displayMessage(message, status) {
    if (message.text && message.text.trim() !== "") {
      var messageElement = document.createElement("div");
      messageElement.classList.add("message");

      // This span will contain the text content of the message
      var messageText = document.createElement("span");
      messageText.textContent = message.text;
      messageElement.appendChild(messageText);

      if (message.fromVisitor) {
        messageElement.classList.add("visitor");

        // Create the status span and add the single checkmark
        var statusElement = document.createElement("span");
        messageText.textContent = message.text;
        messageElement.appendChild(messageText);

        var statusElement = document.createElement("span");
        statusElement.classList.add("status-icon");
        statusElement.innerHTML = getStatusIconSVG(message.status);
        messageElement.appendChild(statusElement);
      } else {
        messageElement.classList.add("receiver");
      }

      // Attach a unique identifier to the message element if it's from the visitor
      if (message.messageId) {
        messageElement.setAttribute("data-message-id", message.messageId);
      }

      if (message.text !== "Connection acknowledged") {
        messagesDiv.appendChild(messageElement);
      }

      // Scroll to the bottom of the message container
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  function generateMessageId() {
    // Use a combination of the current timestamp and a random number
    var timestamp = new Date().getTime();
    var randomComponent = Math.floor(Math.random() * 1000);
    return timestamp.toString() + "-" + randomComponent.toString();
  }

  function addMessageToHistory(message) {
    chatHistory.push(message);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }

  function getStatusIconSVG(status) {
    var checkSVG = "";
    if (status === "sent") {
      checkSVG =
        '<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5821 5.54289C21.9726 5.93342 21.9726 6.56658 21.5821 6.95711L10.2526 18.2867C9.86452 18.6747 9.23627 18.6775 8.84475 18.293L2.29929 11.8644C1.90527 11.4774 1.89956 10.8443 2.28655 10.4503C2.67354 10.0562 3.30668 10.0505 3.70071 10.4375L9.53911 16.1717L20.1679 5.54289C20.5584 5.15237 21.1916 5.15237 21.5821 5.54289Z" fill="#000000"/></svg>';
    } else if (status === "received") {
      checkSVG =
        '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 74.46"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>double-tick</title><path class="cls-1" d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"/></svg>';
    }
    // status === "sent"
    //   ? '<path fill-rule="evenodd" clip-rule="evenodd" d="M21.5821 5.54289C21.9726 5.93342 21.9726 6.56658 21.5821 6.95711L10.2526 18.2867C9.86452 18.6747 9.23627 18.6775 8.84475 18.293L2.29929 11.8644C1.90527 11.4774 1.89956 10.8443 2.28655 10.4503C2.67354 10.0562 3.30668 10.0505 3.70071 10.4375L9.53911 16.1717L20.1679 5.54289C20.5584 5.15237 21.1916 5.15237 21.5821 5.54289Z" fill="#000000"/>' // Include the path data for the single check
    //   : '<path class="cls-1" d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"/>'; // Include the path data for the double check

    return (
      // '<svg aria-hidden="true" focusable="false" class="status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
      // checkSVG +
      // "</svg>"
      checkSVG
    );
  }

  // Function to handle reconnection with exponential backoff
  function reconnectWebSocket() {
    // If already connecting or open, do nothing
    if (
      ws &&
      (ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    // Try to reconnect with exponential backoff
    var timeout = Math.min(30000, reconnectAttempt * 1000); // Cap the timeout at 30 seconds
    setTimeout(function () {
      console.log("Attempting to reconnect WebSocket...");
      initializeWebSocket();
      reconnectAttempt++;
    }, timeout);
  }
});
