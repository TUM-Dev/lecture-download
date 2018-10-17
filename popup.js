import {script_tum} from './dl_streams.tum.js';
import {script_lecturio} from './dl_lecturio.js';

const contentScripts = {
  'streams.tum.de': script_tum,
  'www.lecturio.de': script_lecturio
}

const data = {};

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((message, sender) => {
    data.videoUrls = message.videoUrls
    data.initialFilename = message.title.replace(/\//g, '-');
    document.getElementById('lectureNameInput').value = data.initialFilename;
  });
});


chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  const {host} = new URL(tabs[0].url);

  if (host in contentScripts) {
    const code = '(' + contentScripts[host].toString() + ')();'
    chrome.tabs.executeScript(null, {code});
  } else {
    chrome.tabs.executeScript(null, {
      code: `alert("Unsupported host: '${host}'")`
    });
  }
})


const download = (filename, ...sources) => {
  const downloads = [];
  if (sources.length === 1) {
    downloads.push({
      filename: `${filename}.mp4`,
      url: sources[0]
    })
  } else {
    for (var i = 0; i < sources.length; i++) {
      downloads.push({
        url: sources[i],
        filename: `${filename}_0${i}.mp4`
      })
    }
  }

  downloads.forEach(e => chrome.downloads.download(e));
}

const handleClick = (event) => {
  const filename = document.getElementById('lectureNameInput').value;

  const tag = event.target.getAttribute('tag');
  if (tag === '0') {
    download(filename, data.videoUrls[0])
  } else {
    download(filename, ...data.videoUrls)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button').forEach(e => e.addEventListener('click', handleClick));
});
