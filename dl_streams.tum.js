const API_ENDPOINT = 'https://streams.tum.de/Mediasite/PlayerService/PlayerService.svc/json/GetPlayerOptions';

const firstWhere = (array, predicate) => {
  for (let element of array) {
    if (predicate(element) === true) return element;
  }
}

export function script_tum(currentTabUrl, callback) {

  const cookieWithName = (cookies, name) => firstWhere(cookies, cookie => cookie.name === name);

  chrome.cookies.getAll({domain: 'streams.tum.de'}, cookies => {
    let mediasiteAuth = cookieWithName(cookies, 'MediasiteAuth');
    let aspNet_SessionId = cookieWithName(cookies, 'ASP.NET_SessionId');

    const body = {
      'getPlayerOptionsRequest': {
        'ResourceId': currentTabUrl.pathname.split('/')[3],
        'QueryString': currentTabUrl.search,
        'UseScreenReader': false,
        'UrlReferrer': ''
      }
    };

    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Cookies": `${aspNet_SessionId.name}=${aspNet_SessionId.value}; ${mediasiteAuth.name}=${mediasiteAuth.value}`
      },
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(json => {
        const videoUrls = json['d']['Presentation']['Streams'].flatMap(stream => {
          if (Array.isArray(stream['VideoUrls']) && stream['VideoUrls'].length > 0) {
            return firstWhere(stream['VideoUrls'], ({Location}) => Location.includes('.mp4')).Location;
          } else {
            return [];
          }
        });

        const slideData = [];
        for (const stream of json['d']['Presentation']['Streams']) {
          if (stream['HasSlideContent']) {
            const slides_base_url = stream['SlideBaseUrl'];
            for (const slide of stream['Slides']) {
              const id = slide['Number'].toString().padStart(4, '0');
              slideData.push({
                index: id,
                timestamp: slide['Time'],
                url: `${slides_base_url}slide_${id}_1920_1080.jpg`
              });
            }
          }
        }
        
        callback({
          title: null, // provided by the main extension script
          urls: videoUrls,
          slides: slideData
        });
      }).catch(err => console.log(err));
  });
}
