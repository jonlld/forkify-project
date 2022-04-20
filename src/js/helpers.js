import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} seconds!`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    // whichever resolves first wins
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = await res.json();
    // 'throw' once to catch

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
    //
  } catch (err) {
    // 'rethrow' to reject and handle upstream
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    // 'race' the timeout and fetch - whichever resolves first wins!
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    // 'throw' once to catch
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    // return data from async function (will need to be 'awaited' on the other side)
    return data;
  } catch (err) {
    // 'rethrow' to reject the promise and handle upstream
    throw err;
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    // to send post request, also pass in options object
    const opt = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    };

    // extra 'opt' parameter
    const res = await Promise.race([fetch(url, opt), timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);

    return data;
  } catch (err) {
    throw err;
  }
};

*/
