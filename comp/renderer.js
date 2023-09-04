navigator.mediaDevices.getDisplayMedia = async () => {
  if ("function" == typeof globalThis.ctGetDisplayMedia) {
    const a = await globalThis.ctGetDisplayMedia();
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: a.id }
      }
    });
  }
};
