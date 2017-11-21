
// The code we run in the player tab to get the name of the lecture and the urls of the actual video files
const code =
`
(() => {
  return {
    title: document.title,
    videoUrls: Array.from(document.getElementsByTagName('video')).map(e => e.children[0].getAttribute('src'))
  };
})();
`;

const data = {};

chrome.tabs.executeScript(null, {code}, response => {
  data.initialFilename = response[0]['title'].replace(/\//g, '-');
  data.videoUrls = response[0]['videoUrls'];
  //document.getElementById('lectureNameInput').setAttribute('value', data.initialFilename);
  document.getElementById('lectureNameInput').value = data.initialFilename;
});


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
