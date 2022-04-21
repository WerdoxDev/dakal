const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener("activate", async () => {
  // This will be called only once when the service worker is activated.
  console.log("service worker activate");

  try {
    const applicationServerKey = urlB64ToUint8Array("BEl6KGGxHGLUvZ8oQO6ZJH9lrXNyHq53HwtxY__LfQN2mDLTBNK0nQEjILTDcZ2FJEaFLaR729H8HyLOigcGraY");
    const options: PushSubscriptionOptionsInit = { applicationServerKey, userVisibleOnly: true };
    const subscription = await sw.registration.pushManager.subscribe(options);
    const response = await saveSubscription(subscription);
    console.log(response);
  } catch (err) {
    console.log("Error", err);
  }
});

self.addEventListener("push", (event) => {
  const pushEvent = event as PushEvent;
  if (pushEvent.data) {
    console.log("Push event!! ", pushEvent.data.text());
    showLocalNotification("Yoho!!", pushEvent.data.text(), sw.registration);
  } else {
    console.log("Push event but no data");
  }
});

function showLocalNotification(title: string, body: string, swRegistration: ServiceWorkerRegistration) {
  const options = {
    body,
  };
  swRegistration.showNotification(title, options);
}

async function saveSubscription(subscription: PushSubscription) {
  const serverUrl = "http://localhost:3002/save-subscription";
  const response = await fetch(serverUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
  return response.json();
}

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  //                        if broke place \ here ^
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
