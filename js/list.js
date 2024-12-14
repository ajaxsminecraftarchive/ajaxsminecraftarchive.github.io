document.addEventListener("DOMContentLoaded", async function () {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const repository = urlParams.get("repo")

  let data = undefined

  if (urlParams.has("data")) {
    const dataAttribute = urlParams.get("data")
    const plainData = window.atob(dataAttribute)
    data = JSON.parse(plainData)
  } else {
    const dataUrl = `https://raw.githubusercontent.com/ajaxsminecraftarchive/${repository}/refs/heads/master/data/repository-info.json`
    const dataContents = await fetchWebsiteContent(dataUrl)
    data = JSON.parse(dataContents)
  }

  const header = data.displayName
  const under = data.description

  const container = document.getElementsByClassName("container")[0]
  const sub = document.createElement("div");

  const availableUrl = `https://raw.githubusercontent.com/ajaxsminecraftarchive/${repository}/refs/heads/master/data/available`
  const availableContents = await fetchWebsiteContent(availableUrl);

  if (availableContents.status != 200) {
    const label = document.createElement("h4")
    label.innerHTML = "There was an error fetching repository details. Please report this."
    sub.appendChild(label)
  } else {
    const allAvailable = availableContents.text.split("\n")

    allAvailable.forEach((available) => {
      // To future me who will absolutely forget how gOoD JS is, if a string is empty, it is a "falsy" value (fuck this 😭)
      if (!available)
        return

      const form = document.createElement("form");

      const button = document.createElement("button");
      button.className = "entry";
      button.innerHTML = available;
      form.appendChild(button);

      sub.appendChild(form);

      const encodedData = window.btoa(JSON.stringify(data));

      button.addEventListener('click', (event) => {
        event.preventDefault();

        if (data.rawDownload) {
          window.location.href = `https://github.com/ajaxsminecraftarchive/${repository}/raw/refs/heads/master/entries/${encodeURI(available)}`;
        } else {
          window.location.href = `https://github.com/ajaxsminecraftarchive/${repository}/tree/master/entires/${encodeURI(available)}`;
        }
      });
    })
  }

  const headerElement = document.createElement("h2");
  headerElement.innerHTML = header;

  const underElement = document.createElement("h3");
  underElement.innerHTML = under;

  container.innerHTML = ""

  container.appendChild(headerElement)
  container.appendChild(underElement)
  container.appendChild(sub)
})

async function fetchWebsiteContent(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const text = await response.text()
    return {text: text, status: response.status}
  } catch (error) {
    console.error(`Error fetching contents of "${url}": ${error}`)
    return {text: "Error", status: -1}
  }
}
