export function speak(text: string, opts?: { rate?: number; pitch?: number; voice?: string }) {
  if (!("speechSynthesis" in window)) {
    alert("Speech Synthesis not supported in this browser.")
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = opts?.rate ?? 1
  utterance.pitch = opts?.pitch ?? 1

  if (opts?.voice) {
    const voices = speechSynthesis.getVoices()
    const selected = voices.find((v) => v.name === opts.voice)
    if (selected) utterance.voice = selected
  }

  speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel()
  }
}

export function getVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices()
}
