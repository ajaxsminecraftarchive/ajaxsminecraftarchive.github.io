const repositories = [
  "client-jars", "client-sources", "resource-packs"
]

document.addEventListener("DOMContentLoaded", async function () {
  const buttonGrid = document.getElementsByClassName("buttons")[0]

  let repositoriesData = new Map();

  for (let repository of repositories) {
    const dataUrl = `https://raw.githubusercontent.com/ajaxsminecraftarchive/${repository}/refs/heads/master/data/repository-info.json`
    const dataContents = await fetchWebsiteContent(dataUrl)

    const parsedData = JSON.parse(dataContents);

    repositoriesData.set(repository, parsedData);
  }

  buttonGrid.innerHTML = ""

  repositoriesData.forEach((data, repository) => {
    const form = document.createElement("form");

    const button = document.createElement("button");
    button.className = "entry";
    button.innerHTML = data.displayName;
    form.appendChild(button);

    buttonGrid.appendChild(form);

    const encodedData = window.btoa(JSON.stringify(data));

    button.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = `list.html?data=${encodedData}&repo=${repository}`;
    });
  });
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
