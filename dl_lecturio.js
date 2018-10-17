export function script_lecturio() {
  const replaceAll = (target, pattern, replacement) => {
    return target.replace(new RegExp(pattern, 'g'), replacement);
  };

  const filterHdUrl = urls => {
    for (const url of urls) {
      if (url.label === 'HD') return url.file;
    }
    return urls[1].file;
  };

  window.addEventListener('message', event => {
    const courseName = document.getElementsByClassName('breadcrumb_item bc_basic_course')[0].children[0].text.trim();
    const lectureName = document.getElementsByClassName('breadcrumb_item bc_lecture')[0].textContent.trim();

    const title = replaceAll(`${lectureName} - ${courseName}`, '/', '-');

    const port = chrome.runtime.connect(chrome.runtime.id);
    port.postMessage({
      title,
      videoUrls: [filterHdUrl(event.data)]
    });
  }, false);


  const script = document.createElement('script');
  script.innerHTML = `
  window.postMessage(window.lecturioJwplayer.playerJson.content.media, '*');
  `;
  document.head.appendChild(script);
}
