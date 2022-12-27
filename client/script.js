import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

//loading points when MarIA it's writing the text and you're waiting
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    //it will make sure there's only three points
    if (element.textContent === '....') {
      element.textContent = "";
    }
  }, 300);
}

//creates a typing effect
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) 
    {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else 
    {
      clearInterval(interval);
    }
  }, 20)
}

//generates unique ID for every single message
function generateUniqueId() {
  //we want to make a completly unique id so we'll different resources like

  const timestamp = Date.now(); //current date
  const randomNumber = Math.random(); //random number
  const hexadecimalString = randomNumber.toString(16); // random hexidecimal string

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"/>
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const data = new FormData(form);

  //the user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
 
  //puts new message in view
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server to get bot's response

  const response = await fetch('http://localhost:5000', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Hubo un error";

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {  
    handleSubmit(e);
  }
});