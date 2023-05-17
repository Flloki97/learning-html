let audioContext;
    let mediaRecorder;
    let chunks = [];
    let animationInterval;
    const animationElement = document.getElementById('animation');
    const recordingsListElement = document.getElementById('recordingsList');
    let recordedAudio;
    const recordings = [];

    function startRecording() {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          audioContext = new AudioContext();
          mediaRecorder = new MediaRecorder(stream);

          mediaRecorder.addEventListener('dataavailable', function (e) {
            chunks.push(e.data);
          });

          mediaRecorder.addEventListener('stop', function () {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            recordedAudio = new Audio(URL.createObjectURL(blob));
            recordings.push(recordedAudio);

            // Reset animation
            clearInterval(animationInterval);
            animationElement.innerHTML = '';

            // Add recording to the list
            const recordingItem = document.createElement('div');
            recordingItem.innerHTML = `<audio src="${recordedAudio.src}" controls></audio>
              <button onclick="deleteRecording(${recordings.length - 1})">Delete</button>`;
            recordingsListElement.appendChild(recordingItem);
          });

          mediaRecorder.start();
          startAnimation();
        })
        .catch(function (err) {
          console.log('The following error occurred: ' + err);
        });
    }

    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder = null;
        chunks = [];
        audioContext.close();
      }
      clearInterval(animationInterval);
      animationElement.innerHTML = '';
    }

    function playRecording() {
      if (recordedAudio) {
        recordedAudio.play();
      }
    }

    function startAnimation() {
      const bar = document.createElement('div');
      bar.classList.add('bar');
      animationElement.appendChild(bar);
      const barHeight = animationElement.offsetHeight;
      animationInterval = setInterval(function () {
        const randomHeight = Math.random() * barHeight;
        bar.style.height = randomHeight + 'px';
      }, 200);
    }

    function deleteRecording(index) {
      const recording = recordings[index];
      if (recording) {
        recording.pause();
        recording.currentTime = 0;
        recordings.splice(index, 1);
        recordingsListElement.removeChild(recordingsListElement.childNodes[index]);

        // Re-index the remaining recordings
        const recordingItems = recordingsListElement.getElementsByTagName('div');
        for (let i = 0; i < recordingItems.length; i++) {
          const recordingItem = recordingItems[i];
          const deleteButton = recordingItem.getElementsByTagName('button')[0];
          deleteButton.setAttribute('onclick', `deleteRecording(${i})`);
        }
      }
    }