const repositories = [
  "resource-packs"
]

document.addEventListener("DOMContentLoaded", async function () {
  const buttonGrid = document.getElementsByClassName("buttons")[0]

  let repositoriesData = []

  for (let repository of repositories) {
    const dataUrl = `https://raw.githubusercontent.com/ajaxsminecraftarchive/${repository}/refs/heads/master/data/repository-info.json`
    const dataContents = await fetchWebsiteContent(dataUrl)

    const parsedData = JSON.parse(dataContents);

    repositoriesData.push(parsedData);
  }

  buttonGrid.innerHTML = ""

  for (let data of repositoriesData) {
    const button = document.createElement("button")
    button.className = "entry"
    button.innerHTML = data.displayName
    buttonGrid.appendChild(button)
  }
})

async function fetchWebsiteContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Error fetching website content:", error);
    return "Error! View console for logs.";
  }
}
