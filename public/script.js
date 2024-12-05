document.addEventListener("DOMContentLoaded", () => {
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    profileButton.addEventListener("click", () => {
        profileDropdown.classList.toggle("active");
        profileDropdown.classList.toggle("hidden");
    });

    // Close the dropdown if clicked outside
    document.addEventListener("click", (event) => {
        if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.classList.add("hidden");
            profileDropdown.classList.remove("active");
        }
    });
});
