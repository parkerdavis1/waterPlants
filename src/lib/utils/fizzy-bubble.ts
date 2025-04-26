console.log("Starting bubbles!");

// Joyful Fuzzy Gurgle Sound with Web Audio API
const audioContext = new AudioContext();

// Function to create a single bubble sound with randomized parameters
function createBubbleSound(startTime, duration, baseFreq) {
    // Oscillator for the bubble tone
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = baseFreq;

    // Gain node to control volume envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    // Filter for bubble resonance
    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 10 + Math.random() * 12; // Higher Q for more resonant, joyful sound
    filter.frequency.value = baseFreq * (1 + Math.random() * 0.3);

    // Create bubble formation sound with more playful frequency shifts
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(
        0.2 + Math.random() * 0.15,
        startTime + duration * 0.3,
    );

    // More dramatic, joyful frequency shifts
    oscillator.frequency.setValueAtTime(baseFreq, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * (1.5 + Math.random() * 0.5),
        startTime + duration * 0.6,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 2.5,
        startTime + duration * 0.8,
    );

    // Create amplitude envelope for the pop
    gainNode.gain.linearRampToValueAtTime(
        0.2 + Math.random() * 0.15,
        startTime + duration * 0.8,
    );
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Master gain for overall volume
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.2;

    // Connect everything
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);
    masterGain.connect(audioContext.destination);

    // Start and stop the oscillator
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
}

// Function to create white noise with filtering for fuzzy texture
function createFuzzyNoise(startTime, duration, filterFreq) {
    // Create buffer source for noise
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds buffer
    const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate,
    );
    const data = noiseBuffer.getChannelData(0);

    // Fill with random noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    // Create buffer source
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    // Create a bandpass filter for the fuzzy texture
    const fuzzyFilter = audioContext.createBiquadFilter();
    fuzzyFilter.type = "bandpass";
    fuzzyFilter.frequency.value = filterFreq;
    fuzzyFilter.Q.value = 1.5;

    // Add a second resonant filter for more character
    const resonantFilter = audioContext.createBiquadFilter();
    resonantFilter.type = "peaking";
    resonantFilter.frequency.value = filterFreq * 1.5;
    resonantFilter.Q.value = 6;
    resonantFilter.gain.value = 12;

    // Gain node for envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    // Create envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(
        0.04,
        startTime + duration * 0.2,
    ); // Low volume for noise
    gainNode.gain.setValueAtTime(0.04, startTime + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    // Filter modulation for dynamic fuzzy texture
    fuzzyFilter.frequency.setValueAtTime(filterFreq, startTime);
    fuzzyFilter.frequency.linearRampToValueAtTime(
        filterFreq * 2,
        startTime + duration * 0.3,
    );
    fuzzyFilter.frequency.linearRampToValueAtTime(
        filterFreq * 0.8,
        startTime + duration * 0.7,
    );
    fuzzyFilter.frequency.linearRampToValueAtTime(
        filterFreq * 1.5,
        startTime + duration,
    );

    // Connect everything
    noise.connect(fuzzyFilter);
    fuzzyFilter.connect(resonantFilter);
    resonantFilter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start and stop
    noise.start(startTime);
    noise.stop(startTime + duration + 0.05);
}

// Function to create a joyful gurgle sound (multiple bubbles with fuzzy noise)
export function createJoyfulFuzzyGurgle() {
    if (typeof audioContext === "undefined") {
        const audioContext = new AudioContext();
    }
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const now = audioContext.currentTime;

    // Create multiple higher-pitched bubbles for joyful effect
    for (let i = 0; i < 20; i++) {
        const startOffset = Math.random() * 1.8; // Random start time within the first 1.8 seconds
        const duration = 0.1 + Math.random() * 0.25; // Shorter, perkier bubbles
        // Higher pitched range (300-1200 Hz) for more joyful sound
        const baseFreq = 300 + Math.random() * 900;

        createBubbleSound(now + startOffset, duration, baseFreq);
    }

    // Create some middle-range bubbles
    for (let i = 0; i < 8; i++) {
        const startOffset = 0.1 + Math.random() * 1.8;
        const duration = 0.2 + Math.random() * 0.3;
        const baseFreq = 180 + Math.random() * 300;

        createBubbleSound(now + startOffset, duration, baseFreq);
    }

    // Add fuzzy white noise components at different frequency bands
    for (let i = 0; i < 6; i++) {
        const startOffset = Math.random() * 1.5;
        const duration = 0.3 + Math.random() * 0.5;
        // Various filter frequencies for the white noise to create textured gurgle
        const filterFreq = 200 + Math.random() * 2000;

        createFuzzyNoise(now + startOffset, duration, filterFreq);
    }

    // Add a couple of high-pitched sparkly noise bursts
    for (let i = 0; i < 3; i++) {
        const startOffset = 0.5 + Math.random() * 1.2;
        const duration = 0.15 + Math.random() * 0.2;
        const filterFreq = 2000 + Math.random() * 3000; // Very high frequencies

        createFuzzyNoise(now + startOffset, duration, filterFreq);
    }
}
