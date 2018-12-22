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
        const videoUrls = json['d']['Presentation']['Streams'][0]['VideoUrls'];
        let mp4Url = firstWhere(videoUrls, ({Location}) => Location.includes('.mp4')).Location;
        
        callback({
          title: null, // provided by the main extension script
          url: mp4Url
        });
      }).catch(err => console.log(err));
  });
}
