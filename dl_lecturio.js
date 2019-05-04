/*
What's going on here?

We read the url of the video file from the `window.lecturioJwplayer` object.
However, chrome extension content scripts can't access variables created by another webpage.
To work around that, we create a `<script>` element (which gets esecuted in the
full isolate of the webpage and therefore can access the `lecturioJwplayer` object).
The script then uses `window.postMessage` to relay the object back to the content script
(this works because the content script and the `<script>` element share the same `window`).
We extract the data we're looking for and use the `chrome.runtime.Port` API to send that back to the extension
*/

export function script_lecturio() {
  const filterHdUrl = urls => {
    for (const url of urls) {
      if (url.label === 'HD') return url.file;
    }
    return urls[1].file;
  };

  window.addEventListener('message', event => {
    const courseName = document.getElementsByClassName('breadcrumb_item bc_basic_course')[0].children[0].text.trim();
    const lectureName = document.getElementsByClassName('breadcrumb_item bc_lecture')[0].textContent.trim();

    const port = chrome.runtime.connect(chrome.runtime.id);
    port.postMessage({
      title: `${lectureName} - ${courseName}`,
      urls: [filterHdUrl(event.data)]
    });
  }, false);


  const script = document.createElement('script');
  script.innerHTML = `
  window.postMessage(window.lecturioJwplayer.playerJson.content.media, '*');
  `;
  document.head.appendChild(script);
}
