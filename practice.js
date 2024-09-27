document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('.btn-ready');

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent any default behavior, such as following a link
            alert("The backend for this button has not been applied yet");
        });
    }
});
