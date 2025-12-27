export default text => {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert("Copied Successfully!");
        })
        .catch(err => {
            alert("Copy failed:", err.message);
        });
}