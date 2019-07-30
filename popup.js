import {script_tum} from './dl_streams.tum.js';
import {script_lecturio} from './dl_lecturio.js';

const GITHUB_URL = 'https://github.com/TUM-Dev/lecture-download';

const data = {
  title: null,
  urls: null,
  slides: null
};

const lectureNameInputTextField = document.getElementById('lectureNameInput');
const slidesNotice = document.getElementById('slides-notice');
const slidesNoticeText = document.getElementById('slides-notice-text');

const invalidFilenameCharacters = ['/', ':', '?', '~', '<', '>', '*', '|'];
const createFilenameRegex = () => new RegExp(invalidFilenameCharacters.join('|\\'), 'g');


const setupLink = (id, url) => {
  document.getElementById(id).addEventListener('click', () => {
    chrome.tabs.create({ url });
  });
};
setupLink('btn-feedback', GITHUB_URL);
setupLink('btn-slides-info', `${GITHUB_URL}#lecture-slides`);



const handleVideoData = ({title, urls, slides}) => {
  data.urls = urls;
  data.slides = slides;

  if (title !== null) {
    data.title = title.replace(createFilenameRegex(), '_');
    lectureNameInputTextField.value = data.title;
  }
  updateSlidesNotice();
};


const updateSlidesNotice = () => {
  if (!data.slides) {
    slidesNotice.style.display = 'none';
    return;
  } else if (data.slides.length === 0){
    return;
  }
  const shouldIncludeSlides = lectureNameInputTextField.value.charAt(0) === '!';
  slidesNoticeText.textContent = shouldIncludeSlides ? 'will include slides' : 'slides available'
  slidesNotice.style.display = 'inline';
};

lectureNameInputTextField.addEventListener('input', updateSlidesNotice);


document.getElementById('btn-download').addEventListener('click', () => {
  const filename = lectureNameInputTextField.value;

  const shouldIncludeSlides = filename.charAt(0) === '!';
  if (shouldIncludeSlides) filename = filename.substring(1);

  for (let i = 0; i < data.urls.length; i++) {
    const destName = data.urls.length > 1
      ? `${filename}_${i}.mp4`
      : `${filename}.mp4`;

      chrome.downloads.download({
        filename: destName,
        url: data.urls[i]
      });
  }

  if (data.slides.length > 0 && shouldIncludeSlides) {
    for (const slide of data.slides) {
      chrome.downloads.download({
        filename: `${filename}_slides/${slide.index}_${slide.timestamp}.jpg`,
        url: slide.url
      })
    }
  }
});



chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  const tab = tabs[0];
  const url = new URL(tab.url);

  handleVideoData({urls: null, title: tab.title});

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
