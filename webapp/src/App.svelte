<script>
  import Chat from './Chat.svelte';
  import Circuit from './Circuit.svelte';

  // Simple hash-based router -- equivalent to the old multi-page nav in
  // index.html, just without a full page reload for the ported demos.
  let route = (location.hash || '#/').slice(1) || '/';
  const defaultTitle = 'GuardianNet — Svelte Demos';
  window.addEventListener('hashchange', () => {
    route = (location.hash || '#/').slice(1) || '/';
    // Chat/Circuit set document.title themselves once mounted; reset it on the
    // way out so it doesn't bleed into whichever route loads next.
    document.title = defaultTitle;
  });

  const staticDemos = [
    ['Mission Ctrl', '/index.html'],
    ['Quests', '/onboard.html'],
    ['Globe', '/guardian-globe.html'],
    ['Chain', '/chain.html'],
    ['Witness', '/witness.html'],
    ['Admin', '/manage.html'],
    ['Pin', '/pin.html'],
    ['Roadmap', '/roadmap.html']
  ];
</script>

{#if route === '/chat'}
  <Chat />
{:else if route === '/circuit'}
  <Circuit />
{:else}
  <main class="home">
    <h1>GuardianNet — Svelte Demos</h1>
    <p>Ported, interactive demos. Everything else in the ecosystem still lives in the static site.</p>
    <div class="cards">
      <a class="card" href="#/chat">
        <span class="card-icon">💬</span>
        <span class="card-title">Guardian Chat</span>
        <span class="card-desc">AIM/AOL-style P2P chat room (Gun.js)</span>
      </a>
      <a class="card" href="#/circuit">
        <span class="card-icon">🛠</span>
        <span class="card-title">Circuit Lab</span>
        <span class="card-desc">d3-driven hardware/circuit schematic builder</span>
      </a>
    </div>
    <h2>Rest of the site</h2>
    <ul class="static-links">
      {#each staticDemos as [label, href]}
        <li><a href={href}>{label} ↗</a></li>
      {/each}
    </ul>
  </main>
{/if}

<style>
  .home {
    max-width: 760px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Open Sans', 'Segoe UI', sans-serif;
    color: #cbd5e1;
  }
  h1 { color: #38bdf8; }
  .cards { display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; }
  .card {
    display: flex; flex-direction: column; gap: 4px;
    background: #0c1422; border: 1px solid #1a2840; padding: 16px;
    text-decoration: none; color: #cbd5e1; width: 220px;
  }
  .card:hover { border-color: #38bdf8; }
  .card-icon { font-size: 28px; }
  .card-title { color: #f59e0b; font-weight: bold; }
  .card-desc { font-size: 13px; color: #64748b; }
  .static-links { columns: 2; }
  .static-links a { color: #38bdf8; }
</style>
