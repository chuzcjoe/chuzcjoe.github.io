---
title: Android MediaCodec
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: /img/me.jpeg
    avatar_rounded: false
    gravatar: null
    follow_link: https://github.com/chuzcjoe
    social_links:
      Github:
        icon: fab fa-github
        url: https://github.com/chuzcjoe
      Linkedin:
        icon: fab fa-linkedin
        url: https://www.linkedin.com/in/joe-chu-1784b3179/
      Scholar:
        icon: fab fa-google
        url: https://scholar.google.com/citations?user=DCwJ1qcAAAAJ&hl=en
      Dribbble:
        icon: fab fa-dribbble
        url: https://dribbble.com
      RSS:
        icon: fas fa-rss
        url: /
  - position: left
    type: toc
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2024-12-13 22:03:00
tags: [mediacodec]
categories:
- misc
---

MediaCodec basics and how to decode a video with it.

<!-- more -->

# 1. Introduction

MediaCodec is a low-level API in Android used for encoding and decoding audio and video data. It provides access to hardware-accelerated codecs, allowing developers to process multimedia content efficiently. MediaCodec is a part of the Android framework and can be used for tasks like playing, recording, or streaming media.

**Key Features**:
- Hardware Acceleration: Utilizes the device's hardware for efficient media processing.
- Flexibility: Supports a wide range of media formats and configurations.
- Asynchronous Processing: Allows non-blocking operations with callbacks or a synchronous mode.

<p align="center">
    <img src="mediacodec_intro.png" title="A regular image" width="700px" height="800px">
</p>

1. Client(`left`) requests an empty input buffer from codec, fill it up wtih data and send it back to codec for processing.
2. Codec uses the data and transform it into an output buffer.
3. Client(`right`) receives a filled output buffer, consume its contents and release it back to the codec.

<p align="center">
    <img src="mediacodec_state.png" title="A regular image" width="600px" height="700px">
</p>

MediaCodec exists in one of three states: `stopped`, `executing` and `released`.

**Stopped**
When a MediaCodec is created, it is in Uninitialized state. After we configure it via `configure(...)`, it goes into Configured state. Then we can call `start()` to move it to the Executing state.

**Executing**
The Executing state has three sub-states: Flushed, Running and End-of-Stream. Immediately after `start()` the codec is in the Flushed sub-state, where it holds all the buffers. As soon as the first input buffer is dequeued, the codec moves to the Running sub-state, where it spends most of its life. When you queue an input buffer with the end-of-stream marker, the codec transitions to the End-of-Stream sub-state. In this state the codec no longer accepts further input buffers, but still generates output buffers until the end-of-stream is reached on the output.

**Released**
When you are done using a codec, you must release it by calling `release()`.

# 2. Synchronous Mode

MediaCodec can operate in both synchronous and asynchronous modes. For synchronous mode(blocking mode), each operation blocks the thread until the operation completes or a timeout occurs.

<p align="center">
    <img src="synchronous_mode.png" title="A regular image" width="700px" height="800px">
</p>

```java code example
private void startDecoding() {
    isPlaying = true;
    Thread decodingThread = new Thread(() -> {
        try {
            if (decoder == null || extractor == null) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, 
                    "Decoder or extractor is null", Toast.LENGTH_SHORT).show());
                return;
            }

            MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
            boolean isEOS = false;
            long startMs = System.currentTimeMillis();

            while (!isEOS && isPlaying) {
                // Handle pause state
                synchronized (pauseLock) {
                    while (isPaused && isPlaying) {
                        try {
                            pauseLock.wait();
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }

                if (!isEOS) {
                    int inIndex = decoder.dequeueInputBuffer(10000);
                    if (inIndex >= 0) {
                        ByteBuffer buffer = decoder.getInputBuffer(inIndex);
                        buffer.clear();
                        int sampleSize = extractor.readSampleData(buffer, 0);
                        if (sampleSize < 0) {
                            decoder.queueInputBuffer(inIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                            isEOS = true;
                        } else {
                            long presentationTimeUs = extractor.getSampleTime();
                            decoder.queueInputBuffer(inIndex, 0, sampleSize, presentationTimeUs, 0);
                            extractor.advance();
                        }
                    }
                }

                int outIndex = decoder.dequeueOutputBuffer(info, 10000);
                switch (outIndex) {
                    case MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED:
                    case MediaCodec.INFO_OUTPUT_FORMAT_CHANGED:
                    case MediaCodec.INFO_TRY_AGAIN_LATER:
                        break;
                    default:
                        if (outIndex >= 0) {
                            // Adjust presentation time when paused
                            if (!isPaused) {
                                long sleepTime = info.presentationTimeUs / 1000 - (System.currentTimeMillis() - startMs);
                                if (sleepTime > 0) {
                                    try {
                                        Thread.sleep(sleepTime);
                                    } catch (InterruptedException e) {
                                        e.printStackTrace();
                                    }
                                }
                            }
                            decoder.releaseOutputBuffer(outIndex, !isPaused);
                        }
                }

                if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            runOnUiThread(() -> Toast.makeText(MainActivity.this, 
                "Decoding error: " + e.getMessage(), Toast.LENGTH_SHORT).show());
        } finally {
            releaseResources();
        }
    }, "DecodingThread");
    
    decodingThread.start();
}
```

# 3. Asynchronous Mode

According to the Android official documentation, since `Build.VERSION_CODES.LOLLIPOP`, the preferred method is to process data asynchronously by setting a callback before calling `configure`. Input/output buffers are handled in callback methods.

<p align="center">
    <img src="asynchronous_mode.png" title="A regular image" width="700px" height="800px">
</p>

```java code example
private final MediaCodec.Callback callback = new MediaCodec.Callback() {
  @Override
  public void onInputBufferAvailable(MediaCodec codec, int index) {
      ByteBuffer inputBuffer = codec.getInputBuffer(index);
      if (inputBuffer == null) return;

      int sampleSize = extractor.readSampleData(inputBuffer, 0);
      long presentationTimeUs = 0;

      if (sampleSize < 0) {
          codec.queueInputBuffer(index, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
      } else {
          presentationTimeUs = extractor.getSampleTime();
          codec.queueInputBuffer(index, 0, sampleSize, presentationTimeUs, 0);
          extractor.advance();
      }
  }

  @Override
  public void onOutputBufferAvailable(MediaCodec codec, int index, MediaCodec.BufferInfo info) {
      if (startMs == 0) {
          startMs = System.currentTimeMillis();
      }

      long presentationTimeMs = info.presentationTimeUs / 1000;
      long elapsedTimeMs = System.currentTimeMillis() - startMs;
      long sleepTimeMs = presentationTimeMs - elapsedTimeMs;

      if (sleepTimeMs > 0) {
          try {
              Thread.sleep(sleepTimeMs);
          } catch (InterruptedException e) {
              e.printStackTrace();
          }
      }

      codec.releaseOutputBuffer(index, true);
  }

  @Override
  public void onError(MediaCodec codec, MediaCodec.CodecException e) {
      e.printStackTrace();
  }

  @Override
  public void onOutputFormatChanged(MediaCodec codec, MediaFormat format) {
      // Handle format changes if needed
  }
};

private void configureCodec(Surface surface) throws IOException {
  startMs = 0;
  for (int i = 0; i < extractor.getTrackCount(); i++) {
      MediaFormat format = extractor.getTrackFormat(i);
      String mime = format.getString(MediaFormat.KEY_MIME);
      if (mime != null && mime.startsWith("video/")) {
          extractor.selectTrack(i);
          if (format.containsKey(MediaFormat.KEY_WIDTH) 
                  && format.containsKey(MediaFormat.KEY_HEIGHT)) {
              videoWidth = format.getInteger(MediaFormat.KEY_WIDTH);
              videoHeight = format.getInteger(MediaFormat.KEY_HEIGHT);
              adjustAspectRatio();
          }
          
          decoder = MediaCodec.createDecoderByType(mime);
          decoder.setCallback(callback);
          // decoder mode
          decoder.configure(format, surface, null, 0);
          decoder.start();
          return;
      }
  }
  Toast.makeText(this, "No video track found", Toast.LENGTH_SHORT).show();
}
```

# 4. Demo Link

Source code can be found on my github.
[Synchronous mode](https://github.com/chuzcjoe/MediaCodecDemo/tree/synchronous_mode)
[Asynchronous mode](https://github.com/chuzcjoe/MediaCodecDemo/tree/master)


# References

- https://developer.android.com/reference/android/media/MediaCodec
- https://www.jianshu.com/p/ff65ef5207ce