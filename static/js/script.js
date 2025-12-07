function toggleTopicInput() {
  var checkbox = document.getElementById("deep_search");
  var box = document.getElementById("topic_box");
  box.style.display = checkbox.checked ? "block" : "none";
}

function showLoading() {
  let deepSearch = document.getElementById("deep_search").checked;
  document.getElementById("loading").style.display = "flex";
  let text = deepSearch
    ? "Deep Search enabled… downloading papers, updating index, analyzing…"
    : "Uploading paper, extracting content, running analysis…";
  document.getElementById("loading-text").innerText = text;
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

async function handleSubmit(event) {
  event.preventDefault();
  showLoading();

  const form = document.getElementById("reviewForm");
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/review", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      // Display results
      const resultsDiv = document.querySelector(".results");
      if (!resultsDiv) {
        const newDiv = document.createElement("div");
        newDiv.className = "results";
        newDiv.innerHTML = '<h2>📊 Review Results</h2><div class="grid"></div>';
        document.querySelector(".container").appendChild(newDiv);
      }

      const gridDiv = document.querySelector(".grid");
      gridDiv.innerHTML = "";

      for (const [title, content] of Object.entries(data.review)) {
        const card = document.createElement("div");
        card.className = "card";
        
        // Format content: convert em-dashes and newlines to proper HTML
        let formattedContent = content
          .replace(/—/g, "\n• ")  // Replace em-dash with newline and bullet
          .split("\n")
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => `<div style="margin: 8px 0; line-height: 1.5;">${line}</div>`)
          .join("");
        
        card.innerHTML = `<h3>${title}</h3><div>${formattedContent}</div>`;
        gridDiv.appendChild(card);
      }
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    hideLoading();
  }
}
