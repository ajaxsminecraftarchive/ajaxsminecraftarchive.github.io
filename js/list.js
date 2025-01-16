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

      let drawName = available;
      if (drawName.endsWith(".zip"))
        drawName = drawName.substring(0, drawName.length - 4);
      button.innerHTML = parseMinecraftFormatting(drawName);

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

  sub.className = "buttons"

  container.innerHTML = ""

  container.appendChild(headerElement)
  container.appendChild(underElement)
  container.appendChild(sub)
})

async function fetchWebsiteContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    let encoding = 'windows-1252';

    const encodingMatch = contentType?.match(/charset=([^;]+)/i);
    if (encodingMatch) {
      encoding = encodingMatch[1];
    }

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder(encoding);
    const text = decoder.decode(buffer);
    return { text: text, status: response.status };
  } catch (error) {
    console.error(`Error fetching contents of "${url}": ${error}`);
    return { text: "Error", status: -1 };
  }
}

function parseMinecraftFormatting(text) {
  let html = "";
  let currentStyles = {
    color: null,
    bold: false,
    italic: false,
    underlined: false,
    strikethrough: false,
    obfuscated: false,
    reset: false,
  };

  // Helper function to apply (or remove) styles
  function applyStyles() {
    let styleString = "";
    if (currentStyles.color) {
      styleString += `color: ${getColorCode(currentStyles.color)};`;
    }
    if (currentStyles.bold) {
      styleString += "font-weight: bold;";
    }
    if (currentStyles.italic) {
      styleString += "font-style: italic;";
    }
    if (currentStyles.underlined) {
      styleString += "text-decoration: underline;";
    }
    if (currentStyles.strikethrough) {
      styleString += "text-decoration: line-through;";
    }
    if (currentStyles.obfuscated) {
      // Obfuscation is a bit tricky; we use a CSS animation for a simple effect.
      styleString += "animation: obfuscate 0.5s linear infinite;";
      // Add the keyframes for the animation
       if (!document.getElementById('obfuscate-style')) {
            const style = document.createElement('style');
            style.id = 'obfuscate-style';
            style.textContent = `
                @keyframes obfuscate {
                    0% { content: "█"; }
                    25% { content: "▓"; }
                    50% { content: "▒"; }
                    75% { content: "░"; }
                    100% { content: "█"; }
                }
            `;
           document.head.appendChild(style);
      }
    }

    if (styleString) {
      html += `<span style="${styleString}">`;
    } else if (currentStyles.reset) { //handle reset
        html += '</span>'.repeat(html.split('<span').length -1 );
    } else {
      // No styles, potentially closing a previous span if one exists
       if (html.slice(-7) === "</span>") { // avoid adding span if none
          //do nothing.  no styles to apply.
       }
       else {
          if (html.includes("<span")) { // close any existing spans if no styles.
            html += '</span>';
          }
       }
    }
  }


   // Helper function to map Minecraft color codes to CSS color values
  function getColorCode(code) {
    const colorMap = {
      '0': 'black',
      '1': 'dark_blue',
      '2': 'dark_green',
      '3': 'dark_aqua',
      '4': 'dark_red',
      '5': 'dark_purple',
      '6': 'gold',
      '7': 'gray',
      '8': 'dark_gray',
      '9': 'blue',
      'a': 'green',
      'b': 'aqua',
      'c': 'red',
      'd': 'light_purple',
      'e': 'yellow',
      'f': 'white',
      // Add more color mappings if needed (e.g., custom resource packs)
    };

    // Convert Minecraft color names to standard CSS color names
    const cssColor = colorMap[code];
    if (cssColor) {
        const colorNames = {  // convert minecraft's to actual css names.
          dark_blue: '#0000AA',
          dark_green: '#00AA00',
          dark_aqua: '#00AAAA',
          dark_red: '#AA0000',
          dark_purple: '#AA00AA',
          gold: '#FFAA00',
          gray: '#AAAAAA',
          dark_gray: '#555555',
          blue: '#5555FF',
          green: '#55FF55',
          aqua: '#55FFFF',
          red: '#FF5555',
          light_purple: '#FF55FF',
          yellow: '#FFFF55',
          white: '#FFFFFF',
        };

        return colorNames[cssColor] || cssColor;
    }

    return null; // Invalid color code
  }

  // Iterate through the text, handling formatting codes
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '§' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      i++; // Skip the formatting code character


       // handle close span
      if (html.includes("<span")) { // if there is an opening span tag.
        html += '</span>';
      }

      switch (code) {
        case '0': case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9': case 'a': case 'b':
        case 'c': case 'd': case 'e': case 'f':
          currentStyles.color = code;
          currentStyles.reset = false; //remove reset tag if a color was found.
          break;
        case 'k':
          currentStyles.obfuscated = true;
           currentStyles.reset = false; //remove reset tag if a style was found.
          break;
        case 'l':
          currentStyles.bold = true;
           currentStyles.reset = false; //remove reset tag if a style was found.
          break;
        case 'm':
          currentStyles.strikethrough = true;
           currentStyles.reset = false; //remove reset tag if a style was found.
          break;
        case 'n':
          currentStyles.underlined = true;
           currentStyles.reset = false; //remove reset tag if a style was found.
          break;
        case 'o':
          currentStyles.italic = true;
           currentStyles.reset = false; //remove reset tag if a style was found.
          break;
        case 'r':
          // Reset all styles
          Object.keys(currentStyles).forEach(key => currentStyles[key] = false);
          currentStyles.reset = true;
          break;
        default:
          // Unknown formatting code, ignore it
          break;
      }
     applyStyles();

    } else {
       // handle close span.  Only close if there is not a style.
      if (!html.includes("<span") && (currentStyles.color || currentStyles.bold || currentStyles.italic || currentStyles.underlined || currentStyles.strikethrough || currentStyles.obfuscated))
      {
        applyStyles();  //apply styles *before* adding the character.
      }
      html += text[i]; // regular character
    }
  }
    // Close any remaining open spans at the end of string.
   html += '</span>'.repeat(html.split('<span').length -1 );
  return html;
}
