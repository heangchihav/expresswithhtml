
const myToken = localStorage.getItem("token");
if (myToken) {
  window.location.href = 'admin.html';
} else {
  document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/csrf-token')
      .then(response => response.json())
      .then(data => {
        document.getElementById('csrfToken').value = data.csrfToken;
      });

    document.getElementById('loginForm').addEventListener('submit', function (event) {
      event.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const csrfToken = document.getElementById('csrfToken').value;

      fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, _csrf: csrfToken })
      })
        .then(response => response.json())
        .then(data => {
          const token = data.accessToken;
          localStorage.setItem("token", token)
          if (data.success) {
            window.location.href = 'admin.html';
          } else {
            document.getElementById('response').textContent = data.message;
          }
        })
        .catch(error => console.error('Error:', error));
    });


    const googleLoginButton = document.getElementById('googleLoginButton');

    if (googleLoginButton) {
      googleLoginButton.addEventListener('click', () => {
        console.log("Login with Google button clicked");
        window.location.href = "http://127.0.0.1:3000/api/auth/google";
      });
    }
  });
}
