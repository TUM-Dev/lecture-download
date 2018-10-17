export function script_tum() {
  const port = chrome.runtime.connect(chrome.runtime.id);
  port.postMessage({
    title: document.title,
    videoUrls: Array.from(document.getElementsByTagName('video')).map(e => e.children[0].getAttribute('src'))
  });
}
