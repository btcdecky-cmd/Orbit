const root = document.querySelector("#app");

root.innerHTML = `
  <main class="preview-shell">
    <nav class="preview-nav">
      <strong>orbit</strong>
      <span class="preview-pill">workspace preview</span>
    </nav>
    <section class="preview-hero">
      <p class="eyebrow">Persistent project</p>
      <h1>Build something worth shipping.</h1>
      <p class="lede">This page is served directly from the workspace files Orbit edits.</p>
      <div class="preview-actions">
        <button id="primary-action">Explore workspace</button>
        <span id="action-status">Ready for your next change.</span>
      </div>
    </section>
    <section class="preview-grid">
      <article><span class="metric">01</span><h2>Inspect</h2><p>Every file stays visible in the Orbit editor.</p></article>
      <article><span class="metric">02</span><h2>Change</h2><p>Ask the agent for a focused implementation.</p></article>
      <article><span class="metric">03</span><h2>Verify</h2><p>Run safe checks and inspect the rendered result.</p></article>
    </section>
  </main>
`;

document.querySelector("#primary-action").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = "The workspace is live and editable.";
});
