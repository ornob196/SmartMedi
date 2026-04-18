// Frontend-only chat (no backend connected yet)
// Messages are stored in memory for the current session

const form = document.getElementById('chatForm');
const chatBox = document.getElementById('chatBox');
const messages = [];

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const messageInput = form.message;
    const senderInput = form.sender;
    const text = messageInput.value.trim();
    if (!text) return;

    const msg = {
        sender: senderInput ? senderInput.value : 'Guest',
        message: text,
        time: new Date().toLocaleTimeString()
    };
    messages.push(msg);
    renderMessages();
    messageInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
});

function renderMessages() {
    chatBox.innerHTML = messages.map(m =>
        `<p><b>${m.sender}:</b> ${m.message} <small style="color:#aaa">${m.time}</small></p>`
    ).join('');
}
