/* demo.js - landing page demo. Simulated mode switching only; no page access. */

const shell = document.getElementById('demoShell');
const preview = document.getElementById('demoPreview');

if (shell && preview) {
  const buttons = document.querySelectorAll('.mode-btn');

  const calmMarkup = `
    <p class="demo-label">Example article</p>
    <h4>When the feed moves too fast, the brain needs a pause.</h4>
    <p>
      Sensory Shield reduces visual noise and rewrites dense text so the key points are easier to follow.
    </p>
    <div class="tag-row">
      <span>neutral language</span>
      <span>bullet summary</span>
      <span>low stimulation</span>
    </div>
  `;

  const overloadMarkup = `
    <p class="demo-label">Overload simulation</p>
    <h4>Too many signals. Too much contrast. Too much movement.</h4>
    <p>
      This mode illustrates the kind of page the extension is meant to calm down: dense layout, stronger motion and a
      noisy visual field.
    </p>
    <div class="tag-row">
      <span>jitter</span>
      <span>noise</span>
      <span>alert state</span>
    </div>
  `;

  function setMode(mode) {
    shell.dataset.mode = mode;
    buttons.forEach((button) => {
      button.classList.toggle('active', button.dataset.mode === mode);
    });

    if (mode === 'overload') {
      preview.classList.add('preview-overload');
      preview.innerHTML = overloadMarkup;
      return;
    }

    preview.classList.remove('preview-overload');
    preview.innerHTML = calmMarkup;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      setMode(mode === 'reset' ? 'calm' : mode);
    });
  });

  setMode('calm');
}
