import {script_tum} from './dl_streams.tum.js';
import {script_lecturio} from './dl_lecturio.js';

const GITHUB_URL = 'https://github.com/TUM-Dev/lecture-download';

const data = {
  title: null,
  url: null
};

const invalidFilenameCharacters = ['/', ':', '?', '~', '<', '>', '*', '|'];
const createFilenameRegex = () => new RegExp(invalidFilenameCharacters.join('|\\'), 'g');

const handleVideoData = ({title, url}) => {
  data.url = url;

  if (title !== null) {
    data.title = title.replace(createFilenameRegex(), '_');
    document.getElementById('lectureNameInput').value = data.title;
  }
};


chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  const tab = tabs[0];
  const url = new URL(tab.url);

  handleVideoData({url: null, title: tab.title});

  if (url.host === 'streams.tum.de') {
    script_tum(url, handleVideoData);
  
  } else if (url.host === 'www.lecturio.de') {
    chrome.runtime.onConnect.addListener(port => {
      port.onMessage.addListener((message, sender) => {
        handleVideoData(message);
      });
    });

    const code = '(' + script_lecturio.toString() + ')();'
    chrome.tabs.executeScript(null, {code});
  
  } else {
    chrome.tabs.executeScript(null, {
      code: `alert("Unsupported host: '${url.host}'")`
    });
  }
})


const main = () => {
  document.getElementById('btn-download').addEventListener('click', event => {
    const filename = document.getElementById('lectureNameInput').value;
    chrome.downloads.download({
      filename: `${filename}.mp4`,
      url: data.url
    });
  });
  
  document.getElementById('btn-feedback').addEventListener('click', event => {
    chrome.tabs.create({url: GITHUB_URL});
  });
};

document.addEventListener('DOMContentLoaded', main);
