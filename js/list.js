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

  if (data.rawDownload) {
    const allAvailable = availableContents.split("\n")

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
        window.location.href = `https://github.com/ajaxsminecraftarchive/${repository}/raw/refs/heads/master/entries/${encodeURI(available)}`;
      });
    })

    sub.className = "buttons"
  } else {
    const label = document.createElement("h3")
    label.innerHTML = "Coming soon!"
    sub.appendChild(label)
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
    return text
  } catch (error) {
    console.error("Error fetching website content:", error)
    return "Error! View console for logs."
  }
}
